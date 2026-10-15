import { createUserSchema } from '@logpose/contracts/features/auth/schemas';
import * as z from 'zod/v4';

const registerFormBaseSchema = createUserSchema.extend({
  confirmPassword: z.string().min(6),
});

export const registerFormSchema = registerFormBaseSchema.refine(
  data => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    params: { i18n: 'passwords_mismatch' },
    path: ['confirmPassword'],
  },
);

export type RegisterFormValues = z.infer<typeof registerFormBaseSchema>;
