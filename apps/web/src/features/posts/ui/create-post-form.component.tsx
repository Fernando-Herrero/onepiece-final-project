import {
  createPostSchema,
  getPostTextMaxLength,
} from '@logpose/contracts/common/post.schemas';
import { Button, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';
import * as z from 'zod/v4';

import { useAuthSession } from '@/features/auth/api/use-auth';
import type { CreatePostVariables } from '@/features/posts/api/use-posts';
import { usePostForm } from '@/features/posts/form/post-form';
import { PostImagePicker } from '@/features/posts/ui/post-image-picker.component';
import { usePendingPostImages } from '@/features/posts/use-pending-post-images';

type CreatePostFormProps = {
  onPublish: (payload: CreatePostVariables) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CreatePostForm({
  onPublish,
  onSuccess,
  onCancel,
}: CreatePostFormProps) {
  const { t } = useTranslation();
  const { user } = useAuthSession();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    pendingImages,
    fileInputRef,
    pickerOpen,
    openPicker,
    pick,
    remove,
    clear,
  } = usePendingPostImages(setFormError);
  const maxLength = user ? getPostTextMaxLength(user.verified) : 280;

  const createPostFormSchema = z.object({
    text: z
      .string()
      .trim()
      .min(1, t('posts.create_validation_error'))
      .max(maxLength, t('posts.create_max_length_error', { max: maxLength })),
  });

  const form = usePostForm({
    defaultValues: {
      text: '',
    },
    validators: {
      onChange: createPostFormSchema,
      onSubmit: createPostFormSchema,
    },
    onSubmit: ({ value }) => {
      setFormError(null);

      const parsed = createPostSchema.safeParse({
        text: value.text.trim(),
      });
      if (!parsed.success) {
        return;
      }

      const payload = {
        text: parsed.data.text,
        files: pendingImages.length
          ? pendingImages.map(item => item.file)
          : undefined,
      };

      form.reset();
      clear();
      onSuccess?.();
      onPublish(payload);
    },
  });

  if (!user) {
    return null;
  }

  function handleCancel() {
    clear();
    form.reset();
    setFormError(null);
    onCancel?.();
  }

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <Flex direction="column" gap="3">
        <form.AppField name="text">
          {field => (
            <field.TextAreaField
              label={t('posts.create_label')}
              placeholder={t('posts.create_placeholder')}
              maxLength={maxLength}
              rows={5}
            />
          )}
        </form.AppField>

        <PostImagePicker
          pendingImages={pendingImages}
          fileInputRef={fileInputRef}
          pickerOpen={pickerOpen}
          onOpenPicker={() => {
            setFormError(null);
            openPicker();
          }}
          onPick={event => {
            setFormError(null);
            pick(event);
          }}
          onRemove={remove}
        />

        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <form.Subscribe selector={state => state.values.text}>
            {text => (
              <Flex direction="column" gap="1">
                <Text
                  as="p"
                  size="1"
                  color={text.length >= maxLength ? 'amber' : 'gray'}
                >
                  {t('posts.create_char_count', {
                    count: text.length,
                    max: maxLength,
                  })}
                </Text>
                {text.length >= maxLength ? (
                  <Text as="p" size="1" color="amber">
                    {t('posts.create_char_limit_reached', { max: maxLength })}
                  </Text>
                ) : null}
              </Flex>
            )}
          </form.Subscribe>

          <Flex gap="2">
            <Button
              type="button"
              variant="soft"
              color="gray"
              className="cursor-pointer"
              onClick={handleCancel}
            >
              {t('posts.create_cancel')}
            </Button>

            <form.Subscribe
              selector={state => state.values.text.trim().length > 0}
            >
              {hasText => (
                <Button
                  type="submit"
                  disabled={!hasText}
                  className={!hasText ? 'cursor-not-allowed' : 'cursor-pointer'}
                >
                  {t('posts.create_submit')}
                </Button>
              )}
            </form.Subscribe>
          </Flex>
        </Flex>

        {formError ? (
          <Text as="p" size="2" color="red">
            {formError}
          </Text>
        ) : null}
      </Flex>
    </form>
  );
}
