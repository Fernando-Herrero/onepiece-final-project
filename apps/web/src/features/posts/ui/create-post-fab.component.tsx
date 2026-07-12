import { PlusIcon } from '@phosphor-icons/react';
import { useTranslation } from 'next-i18next/pages';

import { useAuthSession } from '@/features/auth/api/use-auth';

type CreatePostFabProps = {
  onClick: () => void;
};

export function CreatePostFab({ onClick }: CreatePostFabProps) {
  const { t } = useTranslation();
  const { user } = useAuthSession();

  if (!user) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={t('posts.create_fab_label')}
      onClick={onClick}
      className="community-create-fab group fixed right-5 bottom-6 z-40 flex size-14 cursor-pointer items-center justify-center rounded-full border border-[#f2d9a8]/35 bg-[#0b1120]/90 text-[#f2d9a8] shadow-[0_0_0_1px_rgb(242_217_168_/_0.08),0_12px_40px_rgb(0_0_0_/_0.45)] backdrop-blur-md transition-transform duration-300 hover:scale-105 active:scale-95 motion-safe:animate-[community-fab-enter_0.6s_cubic-bezier(0.16,1,0.3,1)_both] sm:right-8"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgb(242_217_168_/_0.28),transparent_55%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="community-create-fab-ring pointer-events-none absolute inset-0 rounded-full"
      />
      <PlusIcon size={28} weight="bold" className="relative z-10" />
    </button>
  );
}
