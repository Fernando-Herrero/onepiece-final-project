import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

export default function NotFoundPageContent() {
  const { t } = useTranslation();

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      <Head>
        <title>{t('not_found.meta_title')}</title>
      </Head>

      <picture className="fixed inset-0 h-full w-full">
        <source
          srcSet="/landing/not-found/background-not-found-1024.webp"
          media="(min-width: 1024px)"
          type="image/webp"
        />
        <source
          srcSet="/landing/not-found/background-not-found-700.webp"
          media="(min-width: 700px)"
          type="image/webp"
        />
        <source
          srcSet="/landing/not-found/background-not-found-400.webp"
          media="(min-width: 400px)"
          type="image/webp"
        />
        <img
          src="/landing/not-found/background-not-found-400.webp"
          alt={t('not_found.bg_alt')}
          className="not-found-bg h-full w-full object-cover object-center"
        />
      </picture>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/65"
      />

      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center gap-6 px-6 text-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/landing/one-piece-logo.webp"
            alt="One Piece LogPose"
            width={120}
            height={60}
            className="h-auto w-28 md:w-32"
            priority
          />
          <h1 className="font-one-piece text-4xl tracking-wide text-[#f2d9a8] md:text-5xl">
            {t('not_found.title')}
          </h1>
          <p className="text-lg text-[#f4ede1]/90 md:text-2xl">
            {t('not_found.message')}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Image
            src="/landing/not-found/sombrero-first-crew.png"
            alt={t('not_found.crew_alt')}
            width={280}
            height={200}
            className="h-auto w-48 md:w-56"
          />
          <Link
            href="/"
            className="rounded bg-white/30 px-3 py-1 text-xl text-white underline transition-colors hover:bg-white/50"
          >
            {t('not_found.back_home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
