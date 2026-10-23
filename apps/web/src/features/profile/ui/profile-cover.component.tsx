import { Box, Button, Flex, Text, TextField } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import { profileFieldClassName } from '@/features/profile/ui/profile-editable-field.component';

type ProfileCoverProps = {
  value: string;
  isOwner: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: (value: string) => void;
};

export function ProfileCover({
  value,
  isOwner,
  isEditing,
  isSaving,
  onStartEdit,
  onCancel,
  onSave,
}: ProfileCoverProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);
  const [loadError, setLoadError] = useState(false);

  function startEdit() {
    setDraft(value);
    onStartEdit();
  }

  return (
    <Box
      position="relative"
      className="group to-page h-36 w-full overflow-hidden bg-linear-to-r from-[#1a0f05] via-[#3d2010] sm:h-40 lg:h-44"
    >
      {isEditing ? (
        <Flex
          direction="column"
          gap="2"
          justify="center"
          className="bg-page/92 absolute inset-0 p-4"
        >
          <TextField.Root
            className={profileFieldClassName}
            value={draft}
            placeholder={t('profile.input_cover_image')}
            autoFocus
            onChange={event => setDraft(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                onSave(draft);
              }
              if (event.key === 'Escape') {
                onCancel();
              }
            }}
          />
          <Flex gap="2" justify="end">
            <Button
              type="button"
              size="1"
              color="orange"
              disabled={isSaving}
              onClick={() => onSave(draft)}
            >
              {isSaving ? t('profile.saving') : t('profile.save_button')}
            </Button>
            <Button
              type="button"
              size="1"
              variant="soft"
              color="gray"
              disabled={isSaving}
              onClick={onCancel}
            >
              {t('profile.cancel')}
            </Button>
          </Flex>
        </Flex>
      ) : (
        <>
          {value && !loadError ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- cover URL libre del usuario */}
              <img
                src={value}
                alt=""
                className="h-full w-full object-cover opacity-80"
                onError={() => setLoadError(true)}
              />
              <Box
                className="from-page/70 pointer-events-none absolute inset-0 bg-linear-to-t via-[#3d2010]/20 to-[#1a0f05]/30"
                aria-hidden
              />
            </>
          ) : isOwner ? (
            <Flex
              align="center"
              justify="center"
              className="absolute inset-0 px-6 text-center"
            >
              <Text as="p" size="2" className="text-foreground/45 italic">
                {t('profile.cover_empty_hint')}
              </Text>
            </Flex>
          ) : null}
          {isOwner ? (
            <>
              <Flex
                align="center"
                justify="center"
                className="bg-page/0 group-hover:bg-page/50 pointer-events-none absolute inset-0 z-10 opacity-0 transition duration-200 group-hover:opacity-100"
              >
                <Text
                  as="span"
                  size="2"
                  weight="medium"
                  className="text-highlight"
                >
                  {t('profile.change_cover_img')}
                </Text>
              </Flex>
              <Button
                type="button"
                variant="ghost"
                color="gray"
                aria-label={t('profile.change_cover_img')}
                className="absolute inset-0 z-20 h-full w-full cursor-pointer rounded-none hover:bg-transparent active:bg-transparent"
                onClick={startEdit}
              />
            </>
          ) : null}
        </>
      )}
    </Box>
  );
}
