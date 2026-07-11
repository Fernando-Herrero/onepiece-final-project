import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { Field } from '@/features/auth/form/fields/field';

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export { useFieldContext };

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Field,
  },
  formComponents: {},
});
