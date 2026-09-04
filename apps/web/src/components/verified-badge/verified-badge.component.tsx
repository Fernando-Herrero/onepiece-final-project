import { Tooltip } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { Icon } from '@/components/icons/icon';

type VerifiedBadgeProps = {
  /** `sm` para listas y cabeceras de post, `md` junto al nombre del perfil. */
  size?: 'sm' | 'md';
  className?: string;
};

const SIZE_PX = {
  sm: 15,
  md: 20,
} as const;

/**
 * Insignia de cuenta verificada (ajustes › premium). Solo decorativa para el
 * ratón: el nombre accesible viaja en el `title` del SVG vía `aria-label`, de
 * modo que un lector de pantalla anuncia "Verificado" junto al nombre.
 */
export function VerifiedBadge({ size = 'sm', className }: VerifiedBadgeProps) {
  const { t } = useTranslation();
  const label = t('profile.verified');

  return (
    <Tooltip content={label}>
      <span
        className={`inline-flex shrink-0 text-[#4d9dff] ${className ?? ''}`}
      >
        <Icon.Verified size={SIZE_PX[size]} role="img" aria-label={label} />
      </span>
    </Tooltip>
  );
}
