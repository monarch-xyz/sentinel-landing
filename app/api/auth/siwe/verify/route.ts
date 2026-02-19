import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SiweMessage } from 'siwe';
import type { User } from '@supabase/supabase-js';
import { ensureProfileWithSentinelApiKey, getProfileByWalletAddress } from '@/lib/supabase/profiles';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SESSION_COOKIE, SIWE_NONCE_COOKIE } from '@/lib/auth/session';

interface VerifyPayload {
  message: string;
  signature: string;
  address: string;
}

const findAuthUserByEmail = async (email: string): Promise<User | null> => {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`user_list_failed:${error.message}`);
    }

    const found = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase()) ?? null;
    if (found) {
      return found;
    }

    if (data.users.length < perPage) {
      return null;
    }

    page += 1;
  }
};

const getOrCreateWalletUser = async (walletAddress: string): Promise<User> => {
  const normalizedAddress = walletAddress.toLowerCase();
  const email = `${normalizedAddress}@wallet.sentinel`;

  const existingProfile = await getProfileByWalletAddress(normalizedAddress);
  if (existingProfile) {
    const { data: existingUser, error: existingUserError } = await supabaseAdmin.auth.admin.getUserById(
      existingProfile.supabase_user_id
    );
    if (!existingUserError && existingUser.user) {
      return existingUser.user;
    }
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      address: normalizedAddress,
    },
  });

  if (!error && data.user) {
    return data.user;
  }

  if (!error?.message?.includes('User already registered')) {
    throw new Error(`user_create_failed:${error?.message ?? 'unknown'}`);
  }

  const existingUser = await findAuthUserByEmail(email);
  if (!existingUser) {
    throw new Error('user_exists_but_unreachable');
  }

  return existingUser;
};

const createUserSession = async (email: string, request: Request) => {
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: new URL('/login', request.url).toString(),
    },
  });

  if (linkError || !linkData?.properties?.hashed_token) {
    throw new Error(`session_link_failed:${linkError?.message ?? 'missing_token_hash'}`);
  }

  const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
    type: 'magiclink',
    token_hash: linkData.properties.hashed_token,
  });

  if (verifyError || !verifyData?.session) {
    throw new Error(`session_verify_failed:${verifyError?.message ?? 'missing_session'}`);
  }

  return verifyData.session;
};

export async function POST(request: Request) {
  let payload: VerifyPayload;
  try {
    payload = (await request.json()) as VerifyPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!payload?.message || !payload?.signature || !payload?.address) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const normalizedPayloadAddress = payload.address.toLowerCase();
  const cookieStore = await cookies();
  const nonce = cookieStore.get(SIWE_NONCE_COOKIE)?.value;
  if (!nonce) {
    return NextResponse.json({ error: 'missing_nonce' }, { status: 400 });
  }

  try {
    const siweMessage = new SiweMessage(payload.message);
    const fields = await siweMessage.verify({
      signature: payload.signature,
      domain: request.headers.get('host') ?? new URL(request.url).host,
      nonce,
    });

    if (!fields.success) {
      return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
    }

    const signedAddress = siweMessage.address.toLowerCase();
    if (signedAddress !== normalizedPayloadAddress) {
      return NextResponse.json({ error: 'address_mismatch' }, { status: 400 });
    }

    const user = await getOrCreateWalletUser(normalizedPayloadAddress);
    const session = await createUserSession(`${normalizedPayloadAddress}@wallet.sentinel`, request);
    const provisioning = await ensureProfileWithSentinelApiKey({
      user,
      walletAddress: normalizedPayloadAddress,
    });

    cookieStore.set(SESSION_COOKIE, session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.delete(SIWE_NONCE_COOKIE);

    return NextResponse.json({
      token: session.access_token,
      provider: 'siwe',
      address: normalizedPayloadAddress,
      sentinelUserId: provisioning.sentinelUserId,
    });
  } catch (error) {
    const message = (error as Error).message;
    const isServerError =
      message.startsWith('user_') ||
      message.startsWith('session_') ||
      message.startsWith('profile_') ||
      message.startsWith('Sentinel ');
    cookieStore.delete(SIWE_NONCE_COOKIE);
    return NextResponse.json(
      { error: 'verification_failed', details: message },
      { status: isServerError ? 500 : 400 }
    );
  }
}
