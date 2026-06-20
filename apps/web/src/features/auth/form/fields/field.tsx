import { IconButton, Text, TextField } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { type ChangeEvent, useState } from 'react';

import { useFieldContext } from '@/features/auth/form/auth-form.context';

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

function PasswordVisibilityIcon({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-4"
        aria-hidden="true"
      >
        <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-2.18-2.18A11.96 11.96 0 0 0 23.25 12C21.55 7.03 17.15 3.25 12 3.25c-2.04 0-3.97.5-5.66 1.37L3.53 2.47ZM12 20.75c5.15 0 9.55-3.78 11.25-8.75-.55-1.48-1.35-2.84-2.35-4.01l-1.72 1.72c.83 1.01 1.47 2.17 1.87 3.44A10.04 10.04 0 0 1 12 19.25c-1.78 0-3.44-.46-4.89-1.27l-1.56 1.56A11.9 11.9 0 0 0 12 20.75ZM4.75 12c.4-1.27 1.04-2.43 1.87-3.44l-1.72-1.72C3.9 8.01 3.1 9.37 2.55 10.85 4.25 15.82 8.65 19.6 13.8 19.6c1.04 0 2.04-.16 2.98-.45l-1.56-1.56A10.04 10.04 0 0 1 4.75 12Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5Zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  );
}

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
  const errorMsg = field.state.meta.isTouched
    ? field.state.meta.errors[0]?.message
    : undefined;
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
              <PasswordVisibilityIcon hidden={passwordVisible} />
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
