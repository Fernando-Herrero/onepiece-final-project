import { Text, TextArea } from '@radix-ui/themes';

import { useFieldContext } from '@/features/posts/form/post-form';

const postFieldClassName =
  'min-h-24 resize-y border-[#f2d9a8]/20 bg-[#05070d]/60 text-[#f4ede1]';

type TextAreaFieldProps = {
  label: string;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
};

export function TextAreaField({
  label,
  placeholder,
  maxLength,
  rows = 4,
}: TextAreaFieldProps) {
  const field = useFieldContext<string>();
  const showErrors = field.form.state.submissionAttempts > 0;
  const errorMsg = showErrors ? field.state.meta.errors[0]?.message : undefined;

  return (
    <label className="flex flex-col gap-1">
      <Text as="span" size="2" weight="medium" className="text-[#f2d9a8]">
        {label}
      </Text>
      <TextArea
        name={field.name}
        value={field.state.value}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={postFieldClassName}
        onBlur={field.handleBlur}
        onChange={event => field.handleChange(event.target.value)}
      />
      {errorMsg ? (
        <Text as="span" size="1" color="red">
          {errorMsg}
        </Text>
      ) : null}
    </label>
  );
}
