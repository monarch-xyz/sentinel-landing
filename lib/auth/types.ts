export type AuthProvider = 'siwe' | 'magic-link';

export interface AuthSession {
  token: string;
  expiresAt?: string;
  address?: string;
  email?: string;
  sentinelUserId?: string;
  provider: AuthProvider;
}

export interface AuthError {
  error: string;
  message?: string;
  details?: string;
  field?: string;
}

export interface MagicLinkRequest {
  email: string;
  redirectUrl?: string;
}

export interface SiweNonceResponse {
  nonce: string;
}

export interface SiweVerifyRequest {
  message: string;
  signature: string;
}

export interface TelegramConnectRequest {
  token: string;
}
