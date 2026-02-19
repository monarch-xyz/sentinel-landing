import { NextResponse } from 'next/server';
import { getAuthenticatedContext } from '@/lib/auth/session';
import { connectDeliveryLink, DeliveryError } from '@/lib/delivery/server';
import { ensureProfileWithSentinelApiKey } from '@/lib/supabase/profiles';

interface TelegramConnectPayload {
  token: string;
}

export async function POST(request: Request) {
  let payload: TelegramConnectPayload;
  try {
    payload = (await request.json()) as TelegramConnectPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!payload?.token) {
    return NextResponse.json({ error: 'missing_token' }, { status: 400 });
  }

  const auth = await getAuthenticatedContext();
  if (!auth) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const provisioning = await ensureProfileWithSentinelApiKey({ user: auth.user });
    const deliveryResponse = await connectDeliveryLink({
      token: payload.token,
      appUserId: provisioning.sentinelUserId,
    });

    return NextResponse.json({
      ok: true,
      app_user_id: provisioning.sentinelUserId,
      delivery: deliveryResponse,
    });
  } catch (error) {
    if (error instanceof DeliveryError) {
      return NextResponse.json(
        {
          error: 'telegram_connect_failed',
          details: error.message,
          delivery: error.payload,
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        error: 'telegram_connect_failed',
        details: error instanceof Error ? error.message : 'unknown_error',
      },
      { status: 500 }
    );
  }
}
