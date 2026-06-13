import { loginSchema } from '@logpose/contracts/features/auth/schemas';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { toast } from 'sonner';

import {
  getErrorMessage,
  useLoginMutation,
} from '@/features/auth/api/use-auth-room';
import { useAppForm } from '@/features/auth/form/use-auth-form';

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
        toast.error(getErrorMessage(error));
      }
    },
    onSubmitInvalid: () => {
      toast.error(t('auth.form_invalid'));
    },
  });

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
      onSubmit={event => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <h1 className="text-center text-xl font-bold">{t('auth.login_title')}</h1>

      <form.AppField name="email">
        {field => (
          <field.TextField
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
          <field.PasswordField
            label={t('auth.password')}
            autoComplete="current-password"
            placeholder={t('auth.password_placeholder')}
            required
          />
        )}
      </form.AppField>

      <form.Subscribe selector={state => [state.isSubmitting, state.canSubmit]}>
        {([isSubmitting, canSubmit]) => (
          <button
            className="rounded bg-orange-600 px-4 py-2 font-medium text-white disabled:opacity-60"
            type="submit"
            disabled={!canSubmit || isSubmitting || loginMutation.isPending}
          >
            {isSubmitting || loginMutation.isPending
              ? t('auth.submit_login_pending')
              : t('auth.submit_login')}
          </button>
        )}
      </form.Subscribe>

      <p className="text-center text-sm">
        {t('auth.not_registered')}{' '}
        <Link className="text-orange-700 underline" href="/register">
          {t('auth.register_link')}
        </Link>
      </p>
    </form>
  );
}
