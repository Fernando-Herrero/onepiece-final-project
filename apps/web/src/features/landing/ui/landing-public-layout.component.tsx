import Head from 'next/head';
import type { ReactNode } from 'react';

import { LandingFooterComponent } from '@/features/landing/ui/landing-footer.component';
import { LandingHeaderComponent } from '@/features/landing/ui/landing-header.component';

type LandingPublicLayoutProps = {
  children: ReactNode;
  title: string;
  description?: string;
  wide?: boolean;
};

export function LandingPublicLayout({
  children,
  title,
  description,
  wide = false,
}: LandingPublicLayoutProps) {
  return (
    <div className="min-h-screen bg-[#05070d] text-[#f4ede1]">
      <Head>
        <title>{title}</title>
        {description ? <meta name="description" content={description} /> : null}
      </Head>
      <LandingHeaderComponent />
      <main
        className={`mx-auto px-6 pb-16 pt-24 ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}
      >
        {children}
      </main>
      <LandingFooterComponent />
    </div>
  );
}
