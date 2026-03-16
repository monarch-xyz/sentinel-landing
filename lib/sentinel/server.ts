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

const normalizeSentinelBaseUrl = (value: string) => {
  const withScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(value) ? value : `http://${value}`;
  const url = new URL(withScheme);

  const normalizedPath = trimTrailingSlash(url.pathname);
  url.pathname =
    !normalizedPath || normalizedPath === '/' ? '/api/v1' : normalizedPath;

  return trimTrailingSlash(url.toString());
};

export const getSentinelApiBaseUrl = () =>
  normalizeSentinelBaseUrl(
    process.env.SENTINEL_API_BASE_URL ?? SENTINEL_BASE_URL_FALLBACK
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
  appUserId,
}: {
  appUserId: string;
}) => {
  const registerAdminKey = process.env.SENTINEL_REGISTER_ADMIN_KEY;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (registerAdminKey) {
    headers['X-Admin-Key'] = registerAdminKey;
  }

  let response: Response;
  try {
    response = await fetch(buildSentinelApiUrl('/auth/register'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: `supabase-${appUserId}`,
      }),
      cache: 'no-store',
    });
  } catch (error) {
    throw new Error(
      `Unable to reach Sentinel at ${getSentinelApiBaseUrl()}: ${error instanceof Error ? error.message : 'fetch failed'}`
    );
  }

  let payload: SentinelRegisterResponse | undefined;
  try {
    payload = (await response.json()) as SentinelRegisterResponse;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Sentinel register unauthorized (set SENTINEL_REGISTER_ADMIN_KEY to match REGISTER_ADMIN_KEY)');
    }
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
