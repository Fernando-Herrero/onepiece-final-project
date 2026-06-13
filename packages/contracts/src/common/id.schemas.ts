import { z } from 'zod';

export const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ID no válido');

export const mongoIdParamsSchema = <Field extends string = 'id'>(
  field: Field = 'id' as Field,
) =>
  z.object({
    params: z.object({ [field]: mongoIdSchema } as Record<
      Field,
      typeof mongoIdSchema
    >),
  });
