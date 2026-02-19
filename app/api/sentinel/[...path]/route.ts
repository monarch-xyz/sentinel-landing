import { NextResponse } from 'next/server';
import { getAuthenticatedContext } from '@/lib/auth/session';
import { buildSentinelApiUrl } from '@/lib/sentinel/server';
import { ensureProfileWithSentinelApiKey } from '@/lib/supabase/profiles';

interface SentinelRouteContext {
  params: Promise<{ path: string[] }> | { path: string[] };
}

const proxySentinelRequest = async (request: Request, context: SentinelRouteContext) => {
  try {
    const authContext = await getAuthenticatedContext();
    if (!authContext) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { apiKey } = await ensureProfileWithSentinelApiKey({ user: authContext.user });
    const routeParams = await context.params;
    const sentinelPath = routeParams.path.join('/');
    const search = new URL(request.url).search;

    const headers = new Headers();
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('content-type', contentType);
    }

    const acceptHeader = request.headers.get('accept');
    if (acceptHeader) {
      headers.set('accept', acceptHeader);
    }

    headers.set('X-API-Key', apiKey);

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const body = hasBody ? await request.text() : undefined;

    const response = await fetch(buildSentinelApiUrl(`/${sentinelPath}`, search), {
      method: request.method,
      headers,
      body: hasBody ? body : undefined,
      cache: 'no-store',
    });

    const responseHeaders = new Headers();
    const responseContentType = response.headers.get('content-type');
    if (responseContentType) {
      responseHeaders.set('content-type', responseContentType);
    }

    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'sentinel_proxy_failed',
        details: error instanceof Error ? error.message : 'unknown_error',
      },
      { status: 500 }
    );
  }
};

export async function GET(request: Request, context: SentinelRouteContext) {
  return proxySentinelRequest(request, context);
}

export async function POST(request: Request, context: SentinelRouteContext) {
  return proxySentinelRequest(request, context);
}

export async function PATCH(request: Request, context: SentinelRouteContext) {
  return proxySentinelRequest(request, context);
}

export async function PUT(request: Request, context: SentinelRouteContext) {
  return proxySentinelRequest(request, context);
}

export async function DELETE(request: Request, context: SentinelRouteContext) {
  return proxySentinelRequest(request, context);
}
