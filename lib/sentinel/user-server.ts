import 'server-only';
import type { User } from '@supabase/supabase-js';
import { buildSentinelApiUrl } from '@/lib/sentinel/server';
import { ensureProfileWithSentinelApiKey } from '@/lib/supabase/profiles';

export class SentinelRequestError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'SentinelRequestError';
    this.status = status;
    this.payload = payload;
  }
}

const parseResponsePayload = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const requestSentinelForUser = async <T>(
  user: User,
  path: string,
  init: RequestInit = {}
): Promise<T> => {
  const { apiKey } = await ensureProfileWithSentinelApiKey({ user });

  const headers = new Headers(init.headers);
  headers.set('X-API-Key', apiKey);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildSentinelApiUrl(path), {
    ...init,
    headers,
    cache: 'no-store',
  });

  const payload = await parseResponsePayload(response);
  if (!response.ok) {
    throw new SentinelRequestError(`Sentinel request failed (${response.status})`, response.status, payload);
  }

  return payload as T;
};
