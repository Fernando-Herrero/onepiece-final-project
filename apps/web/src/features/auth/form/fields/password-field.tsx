import { useFieldContext } from '@/features/auth/form/auth-form.context';

type PasswordFieldProps = {
  label: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
};

export function PasswordField({
  label,
  required,
  placeholder,
  autoComplete,
}: PasswordFieldProps) {
  const field = useFieldContext<string>();
  const errorMsg = field.state.meta.isTouched
    ? field.state.meta.errors[0]?.message
    : undefined;

  return (
    <label className="flex flex-col gap-1 text-sm text-[#f4ede1]/85">
      {label}
      <input
        className="rounded border border-[#f4ede1]/20 bg-[#05070d]/50 px-3 py-2 text-[#f4ede1] placeholder:text-[#f4ede1]/40"
        type="password"
        name={field.name}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={event => field.handleChange(event.target.value)}
        required={required}
      />
      {errorMsg ? <span className="text-red-400">{errorMsg}</span> : null}
    </label>
  );
}
