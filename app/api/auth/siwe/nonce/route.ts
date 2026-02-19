import { NextResponse } from 'next/server';
import { generateNonce } from 'siwe';
import { cookies } from 'next/headers';
import { SIWE_NONCE_COOKIE } from '@/lib/auth/session';

export async function GET() {
  const nonce = generateNonce();
  const cookieStore = await cookies();
  cookieStore.set(SIWE_NONCE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 5,
  });
  return NextResponse.json({ nonce });
}
