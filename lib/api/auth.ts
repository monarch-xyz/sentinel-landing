import { createApiClient } from '@/lib/api/client';
import {
  AuthSession,
  MagicLinkRequest,
  SiweNonceResponse,
  TelegramConnectRequest,
  SiweVerifyRequest,
} from '@/lib/auth/types';

const localClient = createApiClient({ baseUrl: '' });

export const requestMagicLink = (payload: MagicLinkRequest) =>
  localClient.post<AuthSession, MagicLinkRequest>('/api/auth/magic-link', payload);

export const requestSiweNonce = () => localClient.get<SiweNonceResponse>('/api/auth/siwe/nonce');

export const verifySiwe = (payload: SiweVerifyRequest) =>
  localClient.post<AuthSession, SiweVerifyRequest>('/api/auth/siwe/verify', payload);

export const logout = () => localClient.post<void, Record<string, never>>('/api/auth/logout', {});

export const connectTelegram = (payload: TelegramConnectRequest) =>
  localClient.post<{ ok: boolean; app_user_id: string }, TelegramConnectRequest>('/api/telegram/connect', payload);
