import { loginSchema } from '@logpose/contracts/features/auth/schemas';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import {
  getAuthErrorMessage,
  useLoginMutation,
} from '@/features/auth/api/use-auth';
import { useAppForm } from '@/features/auth/form/auth-form';
import {
  AuthFormShell,
  AuthSubmitButton,
} from '@/features/auth/ui/auth-form-shell.component';

export function LoginFormComponent() {
  const { t } = useTranslation();
  const loginMutation = useLoginMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isBusy = loginMutation.isPending || loginMutation.isRedirecting;

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);

      try {
        await loginMutation.mutateAsync(value);
      } catch (error) {
        setSubmitError(getAuthErrorMessage(error, t));
      }
    },
    onSubmitInvalid: () => {
      setSubmitError(t('auth.form_invalid'));
    },
  });

  return (
    <AuthFormShell
      title={t('auth.login_title')}
      errorMessage={submitError}
      onSubmit={() => void form.handleSubmit()}
      footerText={t('auth.not_registered')}
      footerLinkText={t('auth.register_link')}
      footerLinkHref="/register"
    >
      <form.AppField name="email">
        {field => (
          <field.Field
            label={t('auth.email')}
            type="email"
            autoComplete="email"
            placeholder={t('auth.email_placeholder')}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="password">
        {field => (
          <field.Field
            label={t('auth.password')}
            type="password"
            autoComplete="current-password"
            placeholder={t('auth.password_placeholder')}
            passwordToggle
            required
          />
        )}
      </form.AppField>

      <form.Subscribe selector={state => [state.isSubmitting, state.canSubmit]}>
        {([isSubmitting, canSubmit]) => (
          <AuthSubmitButton
            label={t('auth.submit_login')}
            pendingLabel={
              loginMutation.isRedirecting
                ? t('auth.submit_redirect_pending')
                : t('auth.submit_login_pending')
            }
            pending={isSubmitting || isBusy}
            disabled={!canSubmit || isSubmitting || isBusy}
          />
        )}
      </form.Subscribe>
    </AuthFormShell>
  );
}
