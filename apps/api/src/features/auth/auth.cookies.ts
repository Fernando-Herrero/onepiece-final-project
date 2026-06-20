import { SESSION_COOKIE_NAME } from '@logpose/contracts/features/auth/constants';
import type { Response } from 'express';

export { SESSION_COOKIE_NAME };
const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000;

const cookieBaseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    ...cookieBaseOptions,
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, cookieBaseOptions);
}

export function getSessionTokenFromCookieHeader(
  cookieHeader: string | undefined,
) {
  if (!cookieHeader) {
    return undefined;
  }

  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`),
  );

  if (!match?.[1]) {
    return undefined;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
