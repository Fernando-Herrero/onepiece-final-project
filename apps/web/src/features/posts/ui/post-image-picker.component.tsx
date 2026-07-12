import { POST_MAX_IMAGES } from '@logpose/contracts/common/post.schemas';
import { ImageIcon, XIcon } from '@phosphor-icons/react';
import { Button, Flex, IconButton, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import type { ChangeEvent, RefObject } from 'react';

import type { PendingImage } from '@/features/posts/use-pending-post-images';

type PostImagePickerProps = {
  pendingImages: PendingImage[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  pickerOpen?: boolean;
  disabled?: boolean;
  onOpenPicker: () => void;
  onPick: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: (previewUrl: string) => void;
};

export function PostImagePicker({
  pendingImages,
  fileInputRef,
  pickerOpen = false,
  disabled = false,
  onOpenPicker,
  onPick,
  onRemove,
}: PostImagePickerProps) {
  const { t } = useTranslation();
  const pickDisabled =
    pendingImages.length >= POST_MAX_IMAGES || disabled || pickerOpen;

  return (
    <Flex direction="column" gap="2">
      <Flex align="center" justify="between" gap="3" wrap="wrap">
        <Text as="span" size="2" weight="medium" className="text-[#f2d9a8]">
          {t('posts.create_images_label')}
        </Text>
        <Text as="span" size="1" color="gray">
          {t('posts.create_images_count', {
            count: pendingImages.length,
            max: POST_MAX_IMAGES,
          })}
        </Text>
      </Flex>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onPick}
      />

      <Flex align="center" gap="2" wrap="wrap">
        <Button
          type="button"
          variant="soft"
          color="gray"
          highContrast
          disabled={pickDisabled}
          className={pickDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          onClick={onOpenPicker}
        >
          <ImageIcon size={16} aria-hidden />
          {pickerOpen
            ? t('posts.create_images_pick_pending')
            : t('posts.create_images_pick')}
        </Button>
        <Text as="span" size="1" color="gray">
          {t('posts.create_images_hint')}
        </Text>
      </Flex>

      {pendingImages.length > 0 ? (
        <Flex gap="2" wrap="wrap">
          {pendingImages.map(item => (
            <div
              key={item.previewUrl}
              className="group relative size-20 overflow-hidden rounded-xl border border-[#f2d9a8]/20 bg-[#05070d]/60 motion-safe:animate-[community-image-in_0.35s_ease-out_both]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt=""
                className="size-full object-cover"
              />
              <IconButton
                type="button"
                size="1"
                variant="solid"
                color="gray"
                highContrast
                aria-label={t('posts.create_images_remove')}
                className="absolute top-1 right-1 cursor-pointer opacity-90"
                onClick={() => onRemove(item.previewUrl)}
              >
                <XIcon size={12} aria-hidden />
              </IconButton>
            </div>
          ))}
        </Flex>
      ) : null}
    </Flex>
  );
}
