import { createUserSchema } from '@logpose/contracts/features/auth/schemas';
import * as z from 'zod/v4';

const registerFormBaseSchema = createUserSchema.extend({
  confirmPassword: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerFormSchema = registerFormBaseSchema.refine(
  data => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  },
);

export type RegisterFormValues = z.infer<typeof registerFormBaseSchema>;
