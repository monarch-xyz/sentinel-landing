import { LOGIN_RETURN_TO_PARAM } from '@/lib/auth/constants';

export const DEFAULT_SIGNED_IN_PATH = '/app';

export const sanitizeReturnTo = (value: string | null | undefined): string | null => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null;
  }

  if (value === '/login' || value.startsWith('/login?')) {
    return null;
  }

  return value;
};

export const resolveReturnTo = (value: string | null | undefined): string =>
  sanitizeReturnTo(value) ?? DEFAULT_SIGNED_IN_PATH;

export const buildLoginHref = (returnTo?: string | null | undefined): string => {
  const safeReturnTo = sanitizeReturnTo(returnTo);
  if (!safeReturnTo) {
    return '/login';
  }

  const searchParams = new URLSearchParams({
    [LOGIN_RETURN_TO_PARAM]: safeReturnTo,
  });

  return `/login?${searchParams.toString()}`;
};

