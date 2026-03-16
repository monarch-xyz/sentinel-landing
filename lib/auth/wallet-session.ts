import 'server-only';

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { WALLET_SESSION_COOKIE } from '@/lib/auth/constants';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;
const FORMAT_VERSION = 'v1';

export interface WalletSessionData {
  address: string;
  sentinelApiKey: string;
  sentinelUserId: string;
  issuedAt: string;
}

const getWalletSessionSecret = () => {
  const configuredSecret =
    process.env.SENTINEL_PROFILE_ENCRYPTION_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!configuredSecret) {
    throw new Error(
      'Missing a session secret. Set SENTINEL_PROFILE_ENCRYPTION_KEY or SUPABASE_SECRET_KEY.'
    );
  }

  return createHash('sha256').update(configuredSecret).digest();
};

export const encodeWalletSession = (session: WalletSessionData) => {
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, getWalletSessionSecret(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${FORMAT_VERSION}:${iv.toString('base64url')}:${authTag.toString('base64url')}:${encrypted.toString('base64url')}`;
};

export const decodeWalletSession = (value: string): WalletSessionData => {
  const [version, encodedIv, encodedTag, encodedPayload] = value.split(':');
  if (version !== FORMAT_VERSION || !encodedIv || !encodedTag || !encodedPayload) {
    throw new Error('Invalid wallet session format');
  }

  const decipher = createDecipheriv(
    ENCRYPTION_ALGORITHM,
    getWalletSessionSecret(),
    Buffer.from(encodedIv, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encodedPayload, 'base64url')),
    decipher.final(),
  ]);

  const parsed = JSON.parse(decrypted.toString('utf8')) as Partial<WalletSessionData>;
  if (
    typeof parsed.address !== 'string' ||
    typeof parsed.sentinelApiKey !== 'string' ||
    typeof parsed.sentinelUserId !== 'string' ||
    typeof parsed.issuedAt !== 'string'
  ) {
    throw new Error('Invalid wallet session payload');
  }

  return {
    address: parsed.address.toLowerCase(),
    sentinelApiKey: parsed.sentinelApiKey,
    sentinelUserId: parsed.sentinelUserId,
    issuedAt: parsed.issuedAt,
  };
};

export const getWalletSession = async (): Promise<WalletSessionData | null> => {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(WALLET_SESSION_COOKIE)?.value;
  if (!rawValue) {
    return null;
  }

  try {
    return decodeWalletSession(rawValue);
  } catch {
    return null;
  }
};

