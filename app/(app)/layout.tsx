import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { getAuthenticatedUser } from '@/lib/auth/session';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/login');
  }

  return <AppShell>{children}</AppShell>;
}
