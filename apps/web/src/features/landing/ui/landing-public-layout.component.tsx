import Head from 'next/head';
import type { ReactNode } from 'react';

import { LandingFooterComponent } from '@/features/landing/ui/landing-footer.component';
import { LandingHeaderComponent } from '@/features/landing/ui/landing-header.component';

type LandingPublicLayoutProps = {
  children: ReactNode;
  title: string;
  description?: string;
  wide?: boolean;
  centered?: boolean;
};

export function LandingPublicLayout({
  children,
  title,
  description,
  wide = false,
  centered = false,
}: LandingPublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#05070d] text-[#f4ede1]">
      <Head>
        <title>{title}</title>
        {description ? <meta name="description" content={description} /> : null}
      </Head>
      <LandingHeaderComponent />
      <main
        className={`mx-auto flex w-full flex-1 flex-col px-6 pb-8 pt-24 ${wide ? 'max-w-6xl' : 'max-w-3xl'} ${centered ? 'justify-center' : ''}`}
      >
        {children}
      </main>
      <LandingFooterComponent />
    </div>
  );
}
