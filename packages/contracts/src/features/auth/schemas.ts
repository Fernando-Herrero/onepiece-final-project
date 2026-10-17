import * as z from 'zod/v4';

import {
  createUserSchema,
  userPublicSchema,
} from '../../common/user.schemas.js';

export { createUserSchema };

export const loginSchema = z
  .object({
    email: z.email(),
    password: z.string().min(1),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
    repeatNewPassword: z.string().min(1),
  })
  .strict()
  .refine(data => data.newPassword === data.repeatNewPassword, {
    message: 'New passwords do not match',
    path: ['repeatNewPassword'],
  })
  .refine(data => data.newPassword !== data.currentPassword, {
    message: 'New password must differ from the current one',
    path: ['newPassword'],
  });

export const authSessionSchema = z.object({
  user: userPublicSchema,
});

export const authMessageSchema = z.object({
  message: z.string(),
});
