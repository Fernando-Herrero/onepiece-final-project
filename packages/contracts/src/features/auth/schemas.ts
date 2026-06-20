import { z } from 'zod';
import {
  createUserSchema,
  userPublicSchema,
} from '../../common/user.schemas.js';

export { createUserSchema };

export const loginSchema = z
  .object({
    email: z.email('Email no válido'),
    password: z.string().min(1, 'La contraseña es obligatoria'),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
    newPassword: z
      .string()
      .min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
    repeatNewPassword: z.string().min(1, 'Debes repetir la nueva contraseña'),
  })
  .strict()
  .refine(data => data.newPassword === data.repeatNewPassword, {
    message: 'La nueva contraseña y su repetición no coinciden',
    path: ['repeatNewPassword'],
  })
  .refine(data => data.newPassword !== data.currentPassword, {
    message: 'La nueva contraseña debe ser distinta de la actual',
    path: ['newPassword'],
  });

export const authSessionSchema = z.object({
  user: userPublicSchema,
});

export const authMessageSchema = z.object({
  message: z.string(),
});
