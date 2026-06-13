import mongoose, { type HydratedDocument, Schema, type Types } from 'mongoose';

import { serializeUserSummary, type UserDoc } from '../users/user.model.js';

export type NotificationType = 'like' | 'bookmark' | 'comment' | 'follow';

export type NotificationDoc = HydratedDocument<{
  _id: Types.ObjectId;
  type: NotificationType;
  to: Types.ObjectId;
  from: Types.ObjectId | UserDoc;
  postId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}>;

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['like', 'bookmark', 'comment', 'follow'],
      required: true,
    },
    to: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    from: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'posts' },
    commentId: { type: Schema.Types.ObjectId, ref: 'comments' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification = mongoose.model<NotificationDoc>(
  'notifications',
  notificationSchema,
);

export const NOTIFICATION_FROM_POPULATE = {
  path: 'from',
  select:
    'username firstName lastName avatar displayName verified bio privacy role isActive',
};

export function serializeNotification(notification: NotificationDoc) {
  const doc = notification.toObject();
  const fromUser =
    typeof notification.from === 'object' && 'username' in notification.from
      ? notification.from
      : null;

  return {
    _id: notification._id.toString(),
    type: doc.type,
    to: doc.to.toString(),
    from: fromUser
      ? serializeUserSummary(fromUser)
      : {
          _id: doc.from.toString(),
          username: '',
          firstName: '',
          lastName: '',
          verified: false,
          privacy: {
            showPosts: true,
            showLikes: true,
            showBookmarked: true,
            showComments: true,
          },
          role: 'user' as const,
          isActive: true,
        },
    postId: doc.postId?.toString(),
    commentId: doc.commentId?.toString(),
    read: doc.read,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function createNotification(data: {
  type: NotificationType;
  to: string;
  from: string;
  postId?: string;
  commentId?: string;
}) {
  if (data.to === data.from) {
    return null;
  }

  return Notification.create({
    type: data.type,
    to: data.to,
    from: data.from,
    postId: data.postId,
    commentId: data.commentId,
  });
}
