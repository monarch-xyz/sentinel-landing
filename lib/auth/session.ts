import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SESSION_COOKIE } from '@/lib/auth/constants';
import { getWalletSession } from '@/lib/auth/wallet-session';

export { SESSION_COOKIE, SIWE_NONCE_COOKIE, WALLET_SESSION_COOKIE } from '@/lib/auth/constants';

export interface AuthenticatedContext {
  token: string;
  user: User;
}

const buildWalletUser = (address: string): User =>
  ({
    id: `wallet:${address}`,
    email: `${address}@wallet.sentinel`,
    user_metadata: {
      address,
    },
    app_metadata: {
      provider: 'siwe',
      session: 'wallet-cookie',
    },
    aud: 'authenticated',
    created_at: new Date(0).toISOString(),
  }) as User;

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
    const walletSession = await getWalletSession();
    if (!walletSession) {
      return null;
    }

    return {
      token: walletSession.address,
      user: buildWalletUser(walletSession.address),
    };
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data?.user) {
      return {
        token,
        user: data.user,
      };
    }
  } catch {
    // Fall back to the wallet session when Supabase is unavailable.
  }

  const walletSession = await getWalletSession();
  if (!walletSession) {
    return null;
  }

  return {
    token: walletSession.address,
    user: buildWalletUser(walletSession.address),
  };
};

export const getAuthenticatedUser = async (): Promise<User | null> => {
  const context = await getAuthenticatedContext();
  return context?.user ?? null;
};
