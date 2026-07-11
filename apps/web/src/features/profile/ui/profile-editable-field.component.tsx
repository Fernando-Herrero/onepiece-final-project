import { Button, Flex, Text, TextArea, TextField } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { type KeyboardEvent, useState } from 'react';

export const profileFieldClassName =
  'bg-[#05070d]/50 text-[#f4ede1] placeholder:text-[#f4ede1]/40 border-[#f4ede1]/20';

type ProfileEditableFieldProps = {
  value: string;
  emptyText: string;
  placeholder: string;
  multiline?: boolean;
  prominent?: boolean;
  isEditing: boolean;
  isSaving?: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: (value: string) => void;
};

export function ProfileEditableField({
  value,
  emptyText,
  placeholder,
  multiline = false,
  prominent = false,
  isEditing,
  isSaving = false,
  onStartEdit,
  onCancel,
  onSave,
}: ProfileEditableFieldProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);

  function startEdit() {
    setDraft(value);
    onStartEdit();
  }

  function handleSave() {
    onSave(draft);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onCancel();
    }
    if (!multiline && event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    }
  }

  if (isEditing) {
    return (
      <Flex direction="column" gap="2" onKeyDown={handleKeyDown}>
        {multiline ? (
          <TextArea
            className={profileFieldClassName}
            rows={4}
            maxLength={2000}
            value={draft}
            placeholder={placeholder}
            autoFocus
            onChange={event => setDraft(event.target.value)}
          />
        ) : (
          <TextField.Root
            className={profileFieldClassName}
            value={draft}
            placeholder={placeholder}
            autoFocus
            onChange={event => setDraft(event.target.value)}
          />
        )}
        <Flex
          gap="2"
          justify={draft === 'coverImage' ? 'end' : 'start'}
          className="w-full"
        >
          <Button
            type="button"
            size="1"
            color="orange"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? t('profile.saving') : t('profile.save_button')}
          </Button>
          <Button
            type="button"
            size="1"
            color="gray"
            disabled={isSaving}
            onClick={onCancel}
          >
            {t('profile.cancel')}
          </Button>
        </Flex>
      </Flex>
    );
  }

  const hasValue = value.trim().length > 0;

  return (
    <Button
      type="button"
      variant="ghost"
      color="gray"
      highContrast={hasValue}
      className="group h-auto w-full max-w-full cursor-pointer justify-between rounded-md border border-transparent px-2 py-1 text-left hover:border-[#f2d9a8]/20 hover:bg-[#f2d9a8]/5 active:bg-[#f2d9a8]/8"
      onClick={startEdit}
    >
      {hasValue ? (
        <Text
          as="span"
          size={prominent ? '5' : '2'}
          weight={prominent ? 'bold' : 'regular'}
          className={prominent ? 'text-[#f4ede1]' : 'text-[#f4ede1]/85'}
        >
          {value.trim()}
        </Text>
      ) : (
        <Text
          as="span"
          size={prominent ? '3' : '2'}
          className="text-[#f4ede1]/50 italic"
        >
          {emptyText}
        </Text>
      )}

      <Text
        as="span"
        size="1"
        className="shrink-0 text-[#f2d9a8]/0 transition group-hover:text-[#f2d9a8]/70"
        aria-hidden
      >
        ✎
      </Text>
    </Button>
  );
}
