import { InjectCollection } from '@jperezmart/nest-mongodb';
import { Injectable } from '@nestjs/common';
import { type Collection, ObjectId } from 'mongodb';

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

@Injectable()
export class NotificationsPersistence {
  constructor(
    @InjectCollection('notifications')
    private readonly notifications: Collection<NotificationDocument>,
  ) {}

  async createFollow(to: string, from: string) {
    if (to === from) {
      return null;
    }

    const now = new Date();
    const result = await this.notifications.insertOne({
      type: 'follow',
      to: new ObjectId(to),
      from: new ObjectId(from),
      read: false,
      createdAt: now,
      updatedAt: now,
    } as NotificationDocument);

    return result.insertedId;
  }
}
