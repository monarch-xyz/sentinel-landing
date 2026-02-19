import { createApiClient } from '@/lib/api/client';

const sentinelBaseUrl =
  process.env.SENTINEL_API_BASE_URL ??
  process.env.NEXT_PUBLIC_SENTINEL_ENDPOINT ??
  'http://localhost:3000/api/v1';

export const sentinelClient = createApiClient({
  baseUrl: sentinelBaseUrl,
});
