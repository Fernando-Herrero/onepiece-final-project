import { Theme } from '@radix-ui/themes';
import type { PropsWithChildren } from 'react';

export default function RadixThemesProvider({ children }: PropsWithChildren) {
  return (
    <Theme
      appearance="dark"
      accentColor="orange"
      grayColor="slate"
      radius="large"
      scaling="100%"
      hasBackground={false}
      className="bg-deep text-foreground min-h-screen"
    >
      {children}
    </Theme>
  );
}
