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
      <h1 className="text-center font-one-piece text-2xl tracking-wide text-[#f2d9a8]">
        {title}
      </h1>

      {children}

      <p className="text-center text-sm text-[#f4ede1]/75">
        {footerText}{' '}
        <Link
          className="text-[#f2d9a8] underline hover:text-[#f4ede1]"
          href={footerLinkHref}
        >
          {footerLinkText}
        </Link>
      </p>
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
    <button
      className="rounded-md bg-linear-to-r from-orange-600 to-[#a64242] px-4 py-2.5 font-road-captain text-sm uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(166,66,66,0.4)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(166,66,66,0.5)] disabled:translate-y-0 disabled:opacity-60"
      type="submit"
      disabled={disabled}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
