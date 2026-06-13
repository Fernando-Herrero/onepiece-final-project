import { z } from 'zod';
import { mongoIdSchema } from '../../common/user.schemas.js';
import { userSummarySchema } from '../../common/user.schemas.js';

export const notificationTypeSchema = z.enum([
  'like',
  'bookmark',
  'comment',
  'follow',
]);

export const notificationSchema = z.object({
  _id: z.string(),
  type: notificationTypeSchema,
  to: z.string(),
  from: userSummarySchema,
  postId: z.string().optional(),
  commentId: z.string().optional(),
  read: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const unreadCountSchema = z.object({
  count: z.number(),
});

export const markAllReadOutputSchema = z.object({
  message: z.string(),
  modifiedCount: z.number(),
});

export const deleteAllNotificationsOutputSchema = z.object({
  ok: z.literal(true),
  message: z.string(),
  deletedCount: z.number(),
});

export const notificationIdParamsSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});
