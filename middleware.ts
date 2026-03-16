import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, WALLET_SESSION_COOKIE } from '@/lib/auth/constants';
import { buildLoginHref } from '@/lib/auth/redirect';

const getRequestPath = (request: NextRequest) => {
  const search = request.nextUrl.search;
  return `${request.nextUrl.pathname}${search}`;
};

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const walletSessionToken = request.cookies.get(WALLET_SESSION_COOKIE)?.value;

  if (sessionToken || walletSessionToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL(buildLoginHref(getRequestPath(request)), request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/app/:path*', '/signals/:path*', '/telegram/:path*'],
};
