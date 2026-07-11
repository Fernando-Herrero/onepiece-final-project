import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { IconButton, Text, TextField } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { type ChangeEvent, useState } from 'react';

import { useFieldContext } from '@/features/auth/form/auth-form';

const authFieldClassName =
  'bg-[#05070d]/50 text-[#f4ede1] placeholder:text-[#f4ede1]/40 border-[#f4ede1]/20';

type FieldProps = {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  autoComplete?: string;
  passwordToggle?: boolean;
};

export function Field({
  label,
  required,
  placeholder,
  type = 'text',
  autoComplete,
  passwordToggle = false,
}: FieldProps) {
  const { t } = useTranslation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const field = useFieldContext<string>();
  const showErrors = field.form.state.submissionAttempts > 0;
  const errorMsg = showErrors ? field.state.meta.errors[0]?.message : undefined;
  const inputType =
    type === 'password' && passwordToggle
      ? passwordVisible
        ? 'text'
        : 'password'
      : type;

  return (
    <label className="flex flex-col gap-1">
      <Text as="span" size="2" className="text-[#f4ede1]/85">
        {label}
      </Text>
      <TextField.Root
        className={authFieldClassName}
        color={errorMsg ? 'red' : undefined}
        type={inputType}
        name={field.name}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={field.state.value}
        required={required}
        onBlur={field.handleBlur}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          field.handleChange(event.target.value)
        }
      >
        {type === 'password' && passwordToggle ? (
          <TextField.Slot side="right" pr="1">
            <IconButton
              size="1"
              variant="ghost"
              type="button"
              color="gray"
              highContrast
              className="-m-0.5"
              aria-label={
                passwordVisible
                  ? t('auth.hide_password')
                  : t('auth.show_password')
              }
              onClick={() => setPasswordVisible(current => !current)}
            >
              {passwordVisible ? (
                <EyeSlashIcon size={16} aria-hidden />
              ) : (
                <EyeIcon size={16} aria-hidden />
              )}
            </IconButton>
          </TextField.Slot>
        ) : null}
      </TextField.Root>
      {errorMsg ? (
        <Text as="span" size="1" color="red">
          {errorMsg}
        </Text>
      ) : null}
    </label>
  );
}
