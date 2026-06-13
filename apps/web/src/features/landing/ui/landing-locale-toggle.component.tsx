import { useRouter } from 'next/router';

const LOCALES = ['es', 'en'] as const;

export function LandingLocaleToggleComponent() {
  const router = useRouter();
  const activeLocale = router.locale ?? 'es';

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-white/15 bg-black/25 p-1 backdrop-blur-sm"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map(locale => (
        <button
          key={locale}
          type="button"
          onClick={() => router.push(router.pathname, router.asPath, { locale })}
          className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wider transition-colors ${
            activeLocale === locale
              ? 'bg-[#f2d9a8]/20 text-[#f2d9a8]'
              : 'text-[#f4ede1]/60 hover:text-[#f4ede1]'
          }`}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
