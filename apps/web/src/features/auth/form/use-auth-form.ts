import { createFormHook } from '@tanstack/react-form';

import {
  fieldContext,
  formContext,
} from '@/features/auth/form/auth-form.context';
import { Field } from '@/features/auth/form/fields/field';

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Field,
  },
  formComponents: {},
});
