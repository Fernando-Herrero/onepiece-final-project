export const commonErrors = {
  UNAUTHORIZED: { status: 401, message: 'Not authorized, no user found' },
  FORBIDDEN: { status: 403, message: 'Forbidden' },
} as const;
