import {
  POST_IMAGE_MAX_BYTES,
  POST_MAX_IMAGES,
} from '@logpose/contracts/common/post.schemas';
import { useTranslation } from 'next-i18next/pages';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';

export type PendingImage = {
  file: File;
  previewUrl: string;
};

export function usePendingPostImages(onError: (message: string) => void) {
  const { t } = useTranslation();
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!pickerOpen) {
      return;
    }

    function releasePicker() {
      setPickerOpen(false);
    }

    window.addEventListener('focus', releasePicker);
    return () => window.removeEventListener('focus', releasePicker);
  }, [pickerOpen]);

  function clear() {
    for (const item of pendingImages) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setPendingImages([]);
  }

  function openPicker() {
    if (
      pickerOpen ||
      pendingImages.length >= POST_MAX_IMAGES ||
      !fileInputRef.current
    ) {
      return;
    }

    setPickerOpen(true);
    fileInputRef.current.click();
  }

  function pick(event: ChangeEvent<HTMLInputElement>) {
    setPickerOpen(false);

    const selected = [...(event.target.files ?? [])];
    event.target.value = '';

    if (selected.length === 0) {
      return;
    }

    const remainingSlots = POST_MAX_IMAGES - pendingImages.length;
    if (remainingSlots <= 0) {
      onError(t('posts.create_images_max', { max: POST_MAX_IMAGES }));
      return;
    }

    const validFiles = selected.filter(
      file =>
        file.type.startsWith('image/') && file.size <= POST_IMAGE_MAX_BYTES,
    );
    const invalidType = selected.some(file => !file.type.startsWith('image/'));
    const invalidSize = selected.some(file => file.size > POST_IMAGE_MAX_BYTES);

    if (invalidType) {
      onError(t('posts.create_images_type_error'));
    } else if (invalidSize) {
      onError(t('posts.create_images_size_error'));
    }

    const accepted = validFiles.slice(0, remainingSlots);

    if (selected.length > remainingSlots && accepted.length > 0) {
      onError(
        t('posts.create_images_truncated', {
          added: accepted.length,
          selected: selected.length,
          max: POST_MAX_IMAGES,
        }),
      );
    }

    if (accepted.length === 0) {
      return;
    }

    setPendingImages(current => [
      ...current,
      ...accepted.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }

  function remove(previewUrl: string) {
    setPendingImages(current => {
      const target = current.find(item => item.previewUrl === previewUrl);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter(item => item.previewUrl !== previewUrl);
    });
  }

  return {
    pendingImages,
    fileInputRef,
    pickerOpen,
    openPicker,
    pick,
    remove,
    clear,
  };
}
