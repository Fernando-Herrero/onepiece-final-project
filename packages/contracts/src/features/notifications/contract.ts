import { oc } from '@orpc/contract';
import { z } from 'zod';
import {
  deleteAllNotificationsOutputSchema,
  markAllReadOutputSchema,
  notificationIdParamsSchema,
  notificationSchema,
  unreadCountSchema,
} from './schemas.js';

export const notificationsErrors = {
  UNAUTHORIZED: {
    status: 401,
    message: 'Not authorized, no user found',
  },
  NOTIFICATION_NOT_FOUND: {
    status: 404,
    message: 'Notificación no encontrada',
  },
} as const;

export const notificationsContract = oc
  .tag('Notifications')
  .prefix('/notifications')
  .router({
    list: oc
      .route({
        method: 'GET',
        path: '/',
        description: 'List notifications for the authenticated user',
      })
      .errors(notificationsErrors)
      .output(z.array(notificationSchema)),

    getUnreadCount: oc
      .route({
        method: 'GET',
        path: '/unread-count',
        description: 'Get unread notification count',
      })
      .errors(notificationsErrors)
      .output(unreadCountSchema),

    markRead: oc
      .route({
        method: 'PUT',
        path: '/{id}/read',
        inputStructure: 'detailed',
        description: 'Mark a notification as read',
      })
      .input(notificationIdParamsSchema)
      .errors(notificationsErrors)
      .output(notificationSchema),

    markAllRead: oc
      .route({
        method: 'PUT',
        path: '/mark-all-read',
        description: 'Mark all notifications as read',
      })
      .errors(notificationsErrors)
      .output(markAllReadOutputSchema),

    deleteOne: oc
      .route({
        method: 'DELETE',
        path: '/{id}',
        inputStructure: 'detailed',
        description: 'Delete a notification',
      })
      .input(notificationIdParamsSchema)
      .errors(notificationsErrors)
      .output(notificationSchema),

    deleteAll: oc
      .route({
        method: 'DELETE',
        path: '/',
        description: 'Delete all notifications for the authenticated user',
      })
      .errors(notificationsErrors)
      .output(deleteAllNotificationsOutputSchema),
  });
