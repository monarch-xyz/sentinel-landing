import { redirect } from 'next/navigation';
import { LoginPageContent } from '@/components/auth/LoginPageContent';
import { LOGIN_RETURN_TO_PARAM } from '@/lib/auth/constants';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { DEFAULT_SIGNED_IN_PATH, resolveReturnTo } from '@/lib/auth/redirect';

interface LoginPageProps {
  searchParams?: Promise<{ [LOGIN_RETURN_TO_PARAM]?: string }> | { [LOGIN_RETURN_TO_PARAM]?: string };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const returnTo = resolveReturnTo(resolvedSearchParams?.[LOGIN_RETURN_TO_PARAM]);
  const isReturningToProtectedPage = returnTo !== DEFAULT_SIGNED_IN_PATH;
  const user = await getAuthenticatedUser();

  if (user) {
    redirect(returnTo);
  }

  return <LoginPageContent returnTo={returnTo} isReturningToProtectedPage={isReturningToProtectedPage} />;
}
