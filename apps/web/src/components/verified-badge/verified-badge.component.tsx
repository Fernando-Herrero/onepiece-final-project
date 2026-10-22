import { Tooltip } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { Icon } from '@/components/icons/icon';

type VerifiedBadgeProps = {
  verified: boolean;
};

export function VerifiedBadge({ verified }: VerifiedBadgeProps) {
  const { t } = useTranslation();
  const label = t(verified ? 'profile.verified' : 'profile.not_verified');

  return (
    <Tooltip content={label}>
      <span
        className={`inline-flex shrink-0 ${
          verified ? 'text-[#4d9dff]' : 'text-foreground/30'
        }`}
      >
        <Icon.Badge
          size={15}
          weight={verified ? 'fill' : 'regular'}
          role="img"
          aria-label={label}
        />
      </span>
    </Tooltip>
  );
}
