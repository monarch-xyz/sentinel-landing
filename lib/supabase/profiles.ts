import type { User } from '@supabase/supabase-js';
import { getWalletAddressFromUser } from '@/lib/auth/session';
import { decryptSecret, encryptSecret } from '@/lib/security/secrets';
import { registerSentinelUser } from '@/lib/sentinel/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export interface ProfileRow {
  supabase_user_id: string;
  wallet_address: string | null;
  sentinel_user_id: string | null;
  sentinel_api_key: string | null;
}

const PROFILE_SELECT = 'supabase_user_id,wallet_address,sentinel_user_id,sentinel_api_key';

const normalizeWalletAddress = (walletAddress: string) => walletAddress.toLowerCase();

export const getProfileByUserId = async (userId: string): Promise<ProfileRow | null> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('supabase_user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile by user id: ${error.message}`);
  }

  return (data as ProfileRow | null) ?? null;
};

export const getProfileByWalletAddress = async (walletAddress: string): Promise<ProfileRow | null> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('wallet_address', normalizeWalletAddress(walletAddress))
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile by wallet address: ${error.message}`);
  }

  return (data as ProfileRow | null) ?? null;
};

const upsertProfile = async ({
  supabaseUserId,
  walletAddress,
  sentinelUserId,
  encryptedSentinelApiKey,
}: {
  supabaseUserId: string;
  walletAddress?: string | null;
  sentinelUserId?: string | null;
  encryptedSentinelApiKey?: string | null;
}): Promise<ProfileRow> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        supabase_user_id: supabaseUserId,
        wallet_address: walletAddress ? normalizeWalletAddress(walletAddress) : null,
        sentinel_user_id: sentinelUserId ?? null,
        sentinel_api_key: encryptedSentinelApiKey ?? null,
      },
      { onConflict: 'supabase_user_id' }
    )
    .select(PROFILE_SELECT)
    .single();

  if (error || !data) {
    throw new Error(`Failed to upsert profile: ${error?.message ?? 'empty_response'}`);
  }

  return data as ProfileRow;
};

const resolveWalletAddress = (user: User, override?: string) =>
  (override ? normalizeWalletAddress(override) : getWalletAddressFromUser(user)) ?? null;

export const ensureProfileWithSentinelApiKey = async ({
  user,
  walletAddress,
}: {
  user: User;
  walletAddress?: string;
}) => {
  const resolvedWalletAddress = resolveWalletAddress(user, walletAddress);
  let profile = await getProfileByUserId(user.id);

  if (!profile) {
    profile = await upsertProfile({
      supabaseUserId: user.id,
      walletAddress: resolvedWalletAddress,
    });
  } else if (resolvedWalletAddress && profile.wallet_address !== resolvedWalletAddress) {
    profile = await upsertProfile({
      supabaseUserId: user.id,
      walletAddress: resolvedWalletAddress,
      sentinelUserId: profile.sentinel_user_id,
      encryptedSentinelApiKey: profile.sentinel_api_key,
    });
  }

  if (profile.sentinel_api_key && profile.sentinel_user_id) {
    return {
      profile,
      apiKey: decryptSecret(profile.sentinel_api_key),
      sentinelUserId: profile.sentinel_user_id,
    };
  }

  const registration = await registerSentinelUser({
    appUserId: user.id,
  });

  profile = await upsertProfile({
    supabaseUserId: user.id,
    walletAddress: resolvedWalletAddress,
    sentinelUserId: registration.sentinelUserId,
    encryptedSentinelApiKey: encryptSecret(registration.apiKey),
  });

  if (!profile.sentinel_user_id) {
    throw new Error('Sentinel user id was not persisted');
  }

  return {
    profile,
    apiKey: registration.apiKey,
    sentinelUserId: profile.sentinel_user_id,
  };
};
