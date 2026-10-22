import { InjectCollection } from '@jperezmart/nest-mongodb';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import { type ClientSession, type Collection, ObjectId } from 'mongodb';

export type NotificationType = 'like' | 'bookmark' | 'comment' | 'follow';

type NotificationDocument = {
  _id: ObjectId;
  type: NotificationType;
  to: ObjectId;
  from: ObjectId;
  postId?: ObjectId;
  commentId?: ObjectId;
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type NewNotification =
  | { type: 'follow'; to: string; from: string }
  | { type: 'like' | 'bookmark'; to: string; from: string; postId: string };

@Injectable()
export class NotificationsPersistence implements OnModuleInit {
  constructor(
    @InjectCollection('notifications')
    private readonly notifications: Collection<NotificationDocument>,
  ) {}

  async onModuleInit() {
    await this.notifications.createIndexes([
      { key: { to: 1, createdAt: -1 } },
      { key: { from: 1 } },
    ]);
  }

  /** Nadie se notifica a sí mismo: si `to` y `from` coinciden, no se crea. */
  async create(notification: NewNotification) {
    if (notification.to === notification.from) {
      return;
    }

    const now = new Date();
    await this.notifications.insertOne({
      _id: new ObjectId(),
      type: notification.type,
      to: new ObjectId(notification.to),
      from: new ObjectId(notification.from),
      ...(notification.type === 'follow'
        ? {}
        : { postId: new ObjectId(notification.postId) }),
      read: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  async deleteByUser(userId: string, session: ClientSession) {
    const user = new ObjectId(userId);
    await this.notifications.deleteMany(
      { $or: [{ to: user }, { from: user }] },
      { session },
    );
  }
}
