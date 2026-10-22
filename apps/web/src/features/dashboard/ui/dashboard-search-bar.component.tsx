import { IconButton } from '@radix-ui/themes';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import { useEffect, useRef, useState } from 'react';

import { Icon } from '@/components/icons/icon';

export function DashboardSearchBar() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const active = router.pathname.startsWith('/dashboard/search');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (!formRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  function close(restoreFocus = false) {
    setIsOpen(false);
    setQuery('');
    if (restoreFocus) {
      buttonRef.current?.focus();
    }
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isOpen) {
      setIsOpen(true);
      return;
    }

    const trimmed = query.trim();
    if (trimmed) {
      void router.push({
        pathname: '/dashboard/search',
        query: { q: trimmed },
      });
    }

    close();
  }

  const buttonVisualProps = {
    variant: active ? ('soft' as const) : ('ghost' as const),
    color: active ? ('orange' as const) : ('gray' as const),
    highContrast: active,
  };

  const isCloseAction = isOpen && !query.trim();
  const desktopButtonLabel = t(
    isCloseAction ? 'dashboard.topbar.search_close' : 'dashboard.nav.search',
  );

  return (
    <>
      <IconButton
        asChild
        {...buttonVisualProps}
        className="m-0! box-border size-9 p-0 md:hidden"
        aria-label={t('dashboard.nav.search')}
      >
        <Link href="/dashboard/search">
          <Icon.Search aria-hidden />
        </Link>
      </IconButton>

      <form
        ref={formRef}
        role="search"
        onSubmit={handleSubmit}
        className={`hidden items-center rounded-full border transition-colors md:flex ${
          isOpen ? 'border-highlight/25 bg-deep/60 pl-3' : 'border-transparent'
        }`}
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          tabIndex={isOpen ? 0 : -1}
          aria-hidden={!isOpen}
          placeholder={t('dashboard.topbar.search_placeholder')}
          aria-label={t('dashboard.nav.search')}
          className={`text-foreground placeholder:text-foreground/40 bg-transparent text-sm transition-[width,opacity] duration-200 ease-out outline-none ${
            isOpen ? 'w-40 opacity-100' : 'w-0 opacity-0'
          }`}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              close(true);
            }
          }}
        />
        <IconButton
          ref={buttonRef}
          type="submit"
          {...buttonVisualProps}
          className="m-0! box-border size-9 shrink-0 p-0"
          aria-label={desktopButtonLabel}
          aria-expanded={isOpen}
        >
          <Icon.Search aria-hidden />
        </IconButton>
      </form>
    </>
  );
}
