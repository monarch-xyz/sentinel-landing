import { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { buildLoginHref } from '@/lib/auth/redirect';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getAuthenticatedUser();
  if (!user) {
    const requestHeaders = await headers();
    redirect(buildLoginHref(requestHeaders.get('next-url')));
  }

  return <AppShell>{children}</AppShell>;
}
