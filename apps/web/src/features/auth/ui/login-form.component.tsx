import { loginSchema } from '@logpose/contracts/features/auth/schemas';
import { useTranslation } from 'next-i18next/pages';
import { toast } from 'sonner';

import {
  getAuthErrorMessage,
  useLoginMutation,
} from '@/features/auth/api/use-auth';
import { useAppForm } from '@/features/auth/form/use-auth-form';
import {
  AuthFormShell,
  AuthSubmitButton,
} from '@/features/auth/ui/auth-form-shell.component';

export function LoginFormComponent() {
  const { t } = useTranslation();
  const loginMutation = useLoginMutation();

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await loginMutation.mutateAsync(value);
      } catch (error) {
        toast.error(getAuthErrorMessage(error, t));
      }
    },
    onSubmitInvalid: () => {
      toast.error(t('auth.form_invalid'));
    },
  });

  return (
    <AuthFormShell
      title={t('auth.login_title')}
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
            pendingLabel={t('auth.submit_login_pending')}
            pending={isSubmitting || loginMutation.isPending}
            disabled={!canSubmit || isSubmitting || loginMutation.isPending}
          />
        )}
      </form.Subscribe>
    </AuthFormShell>
  );
}
