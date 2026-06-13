import { useFieldContext } from '@/features/auth/form/auth-form.context';

type TextFieldProps = {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'email';
  autoComplete?: string;
};

export function TextField({
  label,
  required,
  placeholder,
  type = 'text',
  autoComplete,
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const errorMsg = field.state.meta.isTouched
    ? field.state.meta.errors[0]?.message
    : undefined;

  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      {required ? <span className="sr-only">required</span> : null}
      <input
        className="rounded border border-neutral-300 px-3 py-2"
        type={type}
        name={field.name}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={event => field.handleChange(event.target.value)}
        required={required}
      />
      {errorMsg ? <span className="text-red-600">{errorMsg}</span> : null}
    </label>
  );
}
