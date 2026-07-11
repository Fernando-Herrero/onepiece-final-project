import { useTranslation } from 'next-i18next/pages';
import { toast } from 'sonner';

import {
  getAuthErrorMessage,
  useRegisterMutation,
} from '@/features/auth/api/use-auth';
import { useAppForm } from '@/features/auth/form/use-auth-form';
import { registerFormSchema } from '@/features/auth/register-form.schema';
import {
  AuthFormShell,
  AuthSubmitButton,
} from '@/features/auth/ui/auth-form-shell.component';
import { AvatarPickerComponent } from '@/features/avatar/ui/avatar-picker.component';

export function RegisterFormComponent() {
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
      avatar: '',
    },
    validators: {
      onChange: registerFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await registerMutation.mutateAsync(value);
      } catch (error) {
        toast.error(getAuthErrorMessage(error, t));
      }
    },
    onSubmitInvalid: () => {
      toast.error(t('auth.form_invalid'));
    },
  });

  return (
    <form
      className="flex w-full max-w-4xl flex-col items-center gap-6"
      onSubmit={event => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <AuthFormShell
        asCard
        title={t('auth.register_title')}
        maxWidthClass="max-w-md"
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

        <form.Subscribe
          selector={state => [state.isSubmitting, state.canSubmit]}
        >
          {([isSubmitting, canSubmit]) => (
            <AuthSubmitButton
              label={t('auth.submit_register')}
              pendingLabel={t('auth.submit_register_pending')}
              pending={isSubmitting || registerMutation.isPending}
              disabled={
                !canSubmit || isSubmitting || registerMutation.isPending
              }
            />
          )}
        </form.Subscribe>
      </AuthFormShell>

      <form.Field name="avatar">
        {field => (
          <AvatarPickerComponent
            value={field.state.value}
            onChange={value => {
              field.handleChange(value);
              field.handleBlur();
            }}
            error={field.state.meta.errors[0]?.message}
          />
        )}
      </form.Field>
    </form>
  );
}
