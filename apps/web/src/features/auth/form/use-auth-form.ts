import { createFormHook } from '@tanstack/react-form';

import {
  fieldContext,
  formContext,
} from '@/features/auth/form/auth-form.context';
import { PasswordField } from '@/features/auth/form/fields/password-field';
import { TextField } from '@/features/auth/form/fields/text-field';

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    PasswordField,
  },
  formComponents: {},
});
