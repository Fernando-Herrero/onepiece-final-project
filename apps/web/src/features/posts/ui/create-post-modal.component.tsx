import { Card, Flex, Heading, IconButton, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useEffect } from 'react';

import type { CreatePostVariables } from '@/features/posts/api/use-posts';
import { CreatePostForm } from '@/features/posts/ui/create-post-form.component';

type CreatePostModalProps = {
  open: boolean;
  onClose: () => void;
  onPublish: (payload: CreatePostVariables) => void;
};

export function CreatePostModal({
  open,
  onClose,
  onPublish,
}: CreatePostModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <Flex
      align="center"
      justify="center"
      className="community-modal-backdrop fixed inset-0 z-50 bg-[#05070d]/82 p-4 backdrop-blur-md motion-safe:animate-[community-backdrop-in_0.35s_ease-out_both]"
      role="dialog"
      aria-modal="true"
      aria-label={t('posts.create_modal_title')}
      onClick={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <Card
        className="community-modal-panel relative max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto border border-[#f2d9a8]/20 bg-[#0b1120]/95 p-5 shadow-[0_24px_80px_rgb(0_0_0/0.55)] motion-safe:animate-[community-modal-in_0.45s_cubic-bezier(0.16,1,0.3,1)_both] sm:p-6"
        onClick={event => event.stopPropagation()}
      >
        <Flex align="start" justify="between" gap="3" mb="4">
          <Flex direction="column" gap="1">
            <Heading as="h2" size="4" className="text-[#f2d9a8]">
              {t('posts.create_modal_title')}
            </Heading>
            <Text as="p" size="1" color="gray" className="text-[#f4ede1]/60">
              {t('posts.create_modal_subtitle')}
            </Text>
          </Flex>
          <IconButton
            type="button"
            variant="ghost"
            color="gray"
            size="2"
            aria-label={t('posts.create_cancel')}
            className="cursor-pointer"
            onClick={onClose}
          >
            ✕
          </IconButton>
        </Flex>

        <CreatePostForm
          onPublish={onPublish}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </Card>
    </Flex>
  );
}
