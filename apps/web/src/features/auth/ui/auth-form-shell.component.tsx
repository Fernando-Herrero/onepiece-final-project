import { Button, Heading, Link as RadixLink, Text } from '@radix-ui/themes';
import Link from 'next/link';
import type { ReactNode } from 'react';

type AuthFormShellProps = {
  title: string;
  maxWidthClass?: string;
  onSubmit: () => void;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  children: ReactNode;
};

export function AuthFormShell({
  title,
  maxWidthClass = 'max-w-sm',
  onSubmit,
  footerText,
  footerLinkText,
  footerLinkHref,
  children,
}: AuthFormShellProps) {
  return (
    <form
      className={`relative flex w-full ${maxWidthClass} flex-col gap-4 overflow-hidden rounded-xl border border-[#f2d9a8]/30 bg-linear-to-br from-[#1b2742]/85 via-[#101a30]/95 to-[#0b1120] p-7 shadow-[0_0_48px_rgba(242,217,168,0.1),0_28px_64px_rgba(0,0,0,0.55)] backdrop-blur-md before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-[#f2d9a8]/70 before:to-transparent`}
      onSubmit={event => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Heading
        as="h1"
        size="5"
        align="center"
        className="font-one-piece tracking-wide text-[#f2d9a8]"
      >
        {title}
      </Heading>

      {children}

      <Text as="p" size="2" align="center" className="text-[#f4ede1]/75">
        {footerText}{' '}
        <RadixLink
          asChild
          className="text-[#f2d9a8] underline hover:text-[#f4ede1]"
        >
          <Link href={footerLinkHref}>{footerLinkText}</Link>
        </RadixLink>
      </Text>
    </form>
  );
}

type AuthSubmitButtonProps = {
  label: string;
  pendingLabel: string;
  pending: boolean;
  disabled: boolean;
};

export function AuthSubmitButton({
  label,
  pendingLabel,
  pending,
  disabled,
}: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      size="3"
      disabled={disabled}
      className="font-road-captain tracking-wider uppercase transition hover:-translate-y-0.5"
    >
      {pending ? pendingLabel : label}
    </Button>
  );
}
