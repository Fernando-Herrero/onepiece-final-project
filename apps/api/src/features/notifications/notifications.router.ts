import { contract } from '@logpose/contracts/contract';
import { implement, ORPCError } from '@orpc/server';

import {
  type ApiContext,
  getRequiredAuthUser,
} from '../auth/auth.router.js';
import {
  Notification,
  NOTIFICATION_FROM_POPULATE,
  serializeNotification,
} from './notification.model.js';

const os = implement(contract.notifications).$context<ApiContext>();

const requireAuth = os.middleware(async ({ context, next }) => {
  const user = getRequiredAuthUser(context.headers);
  return next({ context: { ...context, user } });
});

const list = os.list.use(requireAuth).handler(async ({ context }) => {
  const notifications = await Notification.find({ to: context.user!.id })
    .sort({ createdAt: -1 })
    .populate(NOTIFICATION_FROM_POPULATE);

  return notifications.map(serializeNotification);
});

const getUnreadCount = os.getUnreadCount
  .use(requireAuth)
  .handler(async ({ context }) => {
    const count = await Notification.countDocuments({
      to: context.user!.id,
      read: false,
    });

    return { count };
  });

const markRead = os.markRead.use(requireAuth).handler(async ({ input, context }) => {
  const notification = await Notification.findOne({
    _id: input.params.id,
    to: context.user!.id,
  }).populate(NOTIFICATION_FROM_POPULATE);

  if (!notification) {
    throw new ORPCError('NOTIFICATION_NOT_FOUND');
  }

  notification.read = true;
  await notification.save();

  return serializeNotification(notification);
});

const markAllRead = os.markAllRead
  .use(requireAuth)
  .handler(async ({ context }) => {
    const result = await Notification.updateMany(
      { to: context.user!.id, read: false },
      { read: true },
    );

    return {
      message: 'Notificaciones marcadas como leídas',
      modifiedCount: result.modifiedCount,
    };
  });

const deleteOne = os.deleteOne
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const notification = await Notification.findOne({
      _id: input.params.id,
      to: context.user!.id,
    }).populate(NOTIFICATION_FROM_POPULATE);

    if (!notification) {
      throw new ORPCError('NOTIFICATION_NOT_FOUND');
    }

    await notification.deleteOne();
    return serializeNotification(notification);
  });

const deleteAll = os.deleteAll
  .use(requireAuth)
  .handler(async ({ context }) => {
    const result = await Notification.deleteMany({ to: context.user!.id });

    return {
      ok: true as const,
      message: 'Notificaciones eliminadas',
      deletedCount: result.deletedCount,
    };
  });

export const notificationsRouter = os.router({
  list,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteOne,
  deleteAll,
});
