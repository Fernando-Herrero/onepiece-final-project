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
      className="relative flex w-full max-w-sm flex-col gap-4 overflow-hidden rounded-xl border border-[#f2d9a8]/30 bg-linear-to-br from-[#1b2742]/85 via-[#101a30]/95 to-[#0b1120] p-7 shadow-[0_0_48px_rgba(242,217,168,0.1),0_28px_64px_rgba(0,0,0,0.55)] backdrop-blur-md before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-[#f2d9a8]/70 before:to-transparent"
      onSubmit={event => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <h1 className="text-center font-one-piece text-2xl tracking-wide text-[#f2d9a8]">
        {t('auth.login_title')}
      </h1>

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
            className="rounded-md bg-linear-to-r from-orange-600 to-[#a64242] px-4 py-2.5 font-road-captain text-sm uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(166,66,66,0.4)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(166,66,66,0.5)] disabled:translate-y-0 disabled:opacity-60"
            type="submit"
            disabled={!canSubmit || isSubmitting || loginMutation.isPending}
          >
            {isSubmitting || loginMutation.isPending
              ? t('auth.submit_login_pending')
              : t('auth.submit_login')}
          </button>
        )}
      </form.Subscribe>

      <p className="text-center text-sm text-[#f4ede1]/75">
        {t('auth.not_registered')}{' '}
        <Link className="text-[#f2d9a8] underline hover:text-[#f4ede1]" href="/register">
          {t('auth.register_link')}
        </Link>
      </p>
    </form>
  );
}
