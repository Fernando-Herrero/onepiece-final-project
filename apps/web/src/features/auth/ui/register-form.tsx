import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { toast } from 'sonner';

import {
  getErrorMessage,
  useRegisterMutation,
} from '@/features/auth/api/auth.hooks';
import { useAppForm } from '@/features/auth/form/use-auth-form';
import { registerFormSchema } from '@/features/auth/register-form.schema';

export function RegisterForm() {
  const { t } = useTranslation();
  const registerMutation = useRegisterMutation();

  const form = useAppForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onChange: registerFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await registerMutation.mutateAsync(value);
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
      className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
      onSubmit={event => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <h1 className="text-center text-xl font-bold">
        {t('auth.register_title')}
      </h1>

      <form.AppField name="firstName">
        {field => (
          <field.TextField
            label={t('auth.first_name')}
            placeholder={t('auth.first_name_placeholder')}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="lastName">
        {field => (
          <field.TextField
            label={t('auth.last_name')}
            placeholder={t('auth.last_name_placeholder')}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="username">
        {field => (
          <field.TextField
            label={t('auth.username')}
            placeholder={t('auth.username_placeholder')}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="email">
        {field => (
          <field.TextField
            label={t('auth.email')}
            type="email"
            placeholder={t('auth.email_placeholder')}
            required
          />
        )}
      </form.AppField>

      <form.AppField name="password">
        {field => (
          <field.PasswordField
            label={t('auth.password')}
            autoComplete="new-password"
            required
          />
        )}
      </form.AppField>

      <form.AppField name="confirmPassword">
        {field => (
          <field.PasswordField
            label={t('auth.confirm_password')}
            autoComplete="new-password"
            required
          />
        )}
      </form.AppField>

      <form.Subscribe selector={state => [state.isSubmitting, state.canSubmit]}>
        {([isSubmitting, canSubmit]) => (
          <button
            className="rounded bg-orange-600 px-4 py-2 font-medium text-white disabled:opacity-60"
            type="submit"
            disabled={!canSubmit || isSubmitting || registerMutation.isPending}
          >
            {isSubmitting || registerMutation.isPending
              ? t('auth.submit_register_pending')
              : t('auth.submit_register')}
          </button>
        )}
      </form.Subscribe>

      <p className="text-center text-sm">
        {t('auth.already_registered')}{' '}
        <Link className="text-orange-700 underline" href="/login">
          {t('auth.login_link')}
        </Link>
      </p>
    </form>
  );
}
