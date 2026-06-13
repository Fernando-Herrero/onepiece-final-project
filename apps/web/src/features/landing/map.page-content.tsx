import { Heading } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';

export default function MapPageContent() {
  const { t } = useTranslation();

  return (
    <LandingPublicLayout title={t('map.meta_title')}>
      <Heading
        as="h1"
        size="7"
        mb="6"
        align="center"
        className="font-one-piece tracking-wide text-[#f2d9a8]"
      >
        {t('landing.nav.map')}
      </Heading>

      <picture className="mx-auto block w-full max-w-4xl">
        <source
          media="(min-width: 800px)"
          srcSet="/landing/map/map-1024.webp"
          type="image/webp"
        />
        <source
          media="(min-width: 600px)"
          srcSet="/landing/map/map-700.webp"
          type="image/webp"
        />
        <source
          media="(min-width: 400px)"
          srcSet="/landing/map/map-400.webp"
          type="image/webp"
        />
        <img
          src="/landing/map/map-400.webp"
          alt={t('map.alt')}
          className="w-full rounded-lg shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
        />
      </picture>
    </LandingPublicLayout>
  );
}
