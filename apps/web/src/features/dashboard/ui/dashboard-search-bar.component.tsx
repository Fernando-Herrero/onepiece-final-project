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

  function close() {
    setIsOpen(false);
    setQuery('');
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isOpen) {
      setIsOpen(true);
      return;
    }

    const trimmed = query.trim();
    if (trimmed) {
      void router.push(`/dashboard/search?q=${encodeURIComponent(trimmed)}`);
    }

    close();
  }

  return (
    <>
      <IconButton
        asChild
        variant={active ? 'soft' : 'ghost'}
        color={active ? 'orange' : 'gray'}
        highContrast={active}
        className="m-0! box-border size-9 p-0 md:hidden"
        aria-label={t('dashboard.nav.search')}
      >
        <Link href="/dashboard/search">
          <Icon.Search aria-hidden />
        </Link>
      </IconButton>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`hidden items-center rounded-full border transition-colors md:flex ${
          isOpen
            ? 'border-[#f2d9a8]/25 bg-[#05070d]/60 pl-3'
            : 'border-transparent'
        }`}
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder={t('dashboard.topbar.search_placeholder')}
          aria-label={t('dashboard.nav.search')}
          className={`bg-transparent text-sm text-[#f4ede1] transition-[width,opacity] duration-200 ease-out outline-none placeholder:text-[#f4ede1]/40 ${
            isOpen ? 'w-40 opacity-100' : 'w-0 opacity-0'
          }`}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              close();
            }
          }}
        />
        <IconButton
          type="submit"
          variant={active ? 'soft' : 'ghost'}
          color={active ? 'orange' : 'gray'}
          highContrast={active}
          className="m-0! box-border size-9 shrink-0 p-0"
          aria-label={t(
            isOpen ? 'dashboard.topbar.search_close' : 'dashboard.nav.search',
          )}
          aria-expanded={isOpen}
        >
          <Icon.Search aria-hidden />
        </IconButton>
      </form>
    </>
  );
}
