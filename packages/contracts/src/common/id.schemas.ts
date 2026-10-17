import * as z from 'zod/v4';

export const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const mongoIdParamsSchema = <Field extends string = 'id'>(
  field: Field = 'id' as Field,
) =>
  z.object({
    params: z.object({ [field]: mongoIdSchema } as Record<
      Field,
      typeof mongoIdSchema
    >),
  });
