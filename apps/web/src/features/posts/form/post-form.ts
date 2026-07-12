import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { TextAreaField } from '@/features/posts/form/fields/textarea-field';

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export { useFieldContext };

export const { useAppForm: usePostForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextAreaField,
  },
  formComponents: {},
});
