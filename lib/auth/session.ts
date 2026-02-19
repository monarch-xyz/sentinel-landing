import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const SESSION_COOKIE = 'sentinel-session';
export const SIWE_NONCE_COOKIE = 'siwe-nonce';

export interface AuthenticatedContext {
  token: string;
  user: User;
}

export const getWalletAddressFromUser = (user: User): string | null => {
  const userMetadata = user.user_metadata as Record<string, unknown> | undefined;
  const fromMetadata = userMetadata?.address;
  if (typeof fromMetadata === 'string' && fromMetadata.length > 0) {
    return fromMetadata.toLowerCase();
  }

  if (user.email?.endsWith('@wallet.sentinel')) {
    return user.email.split('@')[0]?.toLowerCase() ?? null;
  }

  return null;
};

export const getSessionToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
};

export const getAuthenticatedContext = async (): Promise<AuthenticatedContext | null> => {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }

  return {
    token,
    user: data.user,
  };
};

export const getAuthenticatedUser = async (): Promise<User | null> => {
  const context = await getAuthenticatedContext();
  return context?.user ?? null;
};
