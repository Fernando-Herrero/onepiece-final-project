import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import {
  getAuthErrorMessage,
  useRegisterMutation,
} from '@/features/auth/api/use-auth';
import { useAppForm } from '@/features/auth/form/auth-form';
import { registerFormSchema } from '@/features/auth/register-form.schema';
import {
  AuthFormShell,
  AuthSubmitButton,
} from '@/features/auth/ui/auth-form-shell.component';
import { AvatarPickerComponent } from '@/features/avatar/ui/avatar-picker.component';

export function RegisterFormComponent() {
  const { t } = useTranslation();
  const registerMutation = useRegisterMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isBusy = registerMutation.isPending || registerMutation.isRedirecting;

  const form = useAppForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      avatar: '',
    },
    validators: {
      onChange: registerFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);

      try {
        await registerMutation.mutateAsync(value);
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
      title={t('auth.register_title')}
      maxWidthClass="max-w-md"
      errorMessage={submitError}
      onSubmit={() => void form.handleSubmit()}
      footerText={t('auth.already_registered')}
      footerLinkText={t('auth.login_link')}
      footerLinkHref="/login"
    >
      <form.AppField name="firstName">
        {field => (
          <field.Field
            label={t('auth.first_name')}
            placeholder={t('auth.first_name_placeholder')}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="lastName">
        {field => (
          <field.Field
            label={t('auth.last_name')}
            placeholder={t('auth.last_name_placeholder')}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="username">
        {field => (
          <field.Field
            label={t('auth.username')}
            placeholder={t('auth.username_placeholder')}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="email">
        {field => (
          <field.Field
            label={t('auth.email')}
            type="email"
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
            autoComplete="new-password"
            passwordToggle
            required
          />
        )}
      </form.AppField>

      <form.AppField name="confirmPassword">
        {field => (
          <field.Field
            label={t('auth.confirm_password')}
            type="password"
            autoComplete="new-password"
            passwordToggle
            required
          />
        )}
      </form.AppField>

      <form.Field name="avatar">
        {field => (
          <form.Subscribe selector={state => state.submissionAttempts}>
            {submissionAttempts => (
              <AvatarPickerComponent
                value={field.state.value}
                onChange={value => field.handleChange(value)}
                error={
                  submissionAttempts > 0
                    ? field.state.meta.errors[0]?.message
                    : undefined
                }
              />
            )}
          </form.Subscribe>
        )}
      </form.Field>

      <form.Subscribe selector={state => [state.isSubmitting, state.canSubmit]}>
        {([isSubmitting, canSubmit]) => (
          <AuthSubmitButton
            label={t('auth.submit_register')}
            pendingLabel={
              registerMutation.isRedirecting
                ? t('auth.submit_redirect_pending')
                : t('auth.submit_register_pending')
            }
            pending={isSubmitting || isBusy}
            disabled={!canSubmit || isSubmitting || isBusy}
          />
        )}
      </form.Subscribe>
    </AuthFormShell>
  );
}
