import { SegmentedControl } from '@radix-ui/themes';
import { useRouter } from 'next/router';

const LOCALES = ['es', 'en'] as const;

export function LandingLocaleToggleComponent() {
  const router = useRouter();
  const activeLocale = router.locale ?? 'es';

  return (
    <SegmentedControl.Root
      size="1"
      value={activeLocale}
      onValueChange={locale =>
        router.push(router.pathname, router.asPath, { locale })
      }
      aria-label="Language"
    >
      {LOCALES.map(locale => (
        <SegmentedControl.Item key={locale} value={locale}>
          {locale.toUpperCase()}
        </SegmentedControl.Item>
      ))}
    </SegmentedControl.Root>
  );
}
