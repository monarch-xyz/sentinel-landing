interface SentinelRegisterResponse {
  api_key?: string;
  apiKey?: string;
  key?: string;
  token?: string;
  access_token?: string;
  user_id?: string;
  userId?: string;
  id?: string;
  data?: SentinelRegisterResponse;
}

const SENTINEL_BASE_URL_FALLBACK = 'http://localhost:3000/api/v1';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const getSentinelApiBaseUrl = () =>
  trimTrailingSlash(
    process.env.SENTINEL_API_BASE_URL ??
      process.env.NEXT_PUBLIC_SENTINEL_ENDPOINT ??
      SENTINEL_BASE_URL_FALLBACK
  );

export const buildSentinelApiUrl = (path: string, search: string = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSentinelApiBaseUrl()}${normalizedPath}${search}`;
};

const pickString = (
  payload: SentinelRegisterResponse | undefined,
  keys: Array<keyof SentinelRegisterResponse>
) => {
  if (!payload) {
    return null;
  }

  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  if (payload.data) {
    return pickString(payload.data, keys);
  }

  return null;
};

export const registerSentinelUser = async ({
  walletAddress,
  appUserId,
}: {
  walletAddress: string;
  appUserId: string;
}) => {
  const serviceApiKey = process.env.SENTINEL_SERVICE_API_KEY;
  if (!serviceApiKey) {
    throw new Error('Missing SENTINEL_SERVICE_API_KEY');
  }

  const response = await fetch(buildSentinelApiUrl('/auth/register'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': serviceApiKey,
      Authorization: `Bearer ${serviceApiKey}`,
    },
    body: JSON.stringify({
      wallet_address: walletAddress,
      external_user_id: appUserId,
    }),
    cache: 'no-store',
  });

  let payload: SentinelRegisterResponse | undefined;
  try {
    payload = (await response.json()) as SentinelRegisterResponse;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    throw new Error(`Sentinel register failed (${response.status})`);
  }

  const apiKey = pickString(payload, ['api_key', 'apiKey', 'key', 'token', 'access_token']);
  if (!apiKey) {
    throw new Error('Sentinel register response missing api key');
  }

  const sentinelUserId = pickString(payload, ['user_id', 'userId', 'id']);
  if (!sentinelUserId) {
    throw new Error('Sentinel register response missing user id');
  }

  return {
    apiKey,
    sentinelUserId,
  };
};
