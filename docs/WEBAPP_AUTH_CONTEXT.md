# Sentinel Webapp Auth Context

## Current State
This repo started as a marketing site and is now evolving into a webapp with SIWE login and server-side Sentinel integration.

### Current Paths
- `/` marketing landing page (`app/(marketing)/page.tsx`)
- `/login` SIWE login (`app/login/page.tsx`)
- `/app` dashboard (`app/(app)/app/page.tsx`)
- API routes for SIWE auth and Sentinel proxy

## Architecture Goal
We want the auth layer to live **inside this Next.js app**. That means this app provides:

1. SIWE (Sign-In with Ethereum) authentication
2. Server-side sessions (Supabase Auth)
3. Secure storage of Sentinel API keys per user
4. Server-to-server calls to Sentinel `/api/v1` endpoints
5. Telegram delivery integration via Delivery Service

The browser **must never** see Sentinel API keys.

## Identity Mapping Contract

Persist this mapping in your webapp DB:

- `supabase_user_id`
- `sentinel_user_id`
- `sentinel_api_key` (encrypted at rest)

Telegram delivery must use `app_user_id = sentinel_user_id` because Sentinel worker webhooks currently emit `context.app_user_id = sentinel_user_id`.

## Implemented So Far

### SIWE UI
- `components/auth/WalletAuth.tsx` handles wallet connect + signing
- `lib/auth/siwe.ts` builds SIWE message (`statement` field controls the text users sign)
- `app/login/page.tsx` is SIWE-only (MVP)

### Auth API (Route Handlers)
- `GET /api/auth/siwe/nonce` -> returns nonce + sets `siwe-nonce` cookie
- `POST /api/auth/siwe/verify` -> verifies SIWE message + nonce, resolves/creates Supabase user, provisions Sentinel API key per user, mints Supabase Auth session, sets `sentinel-session` cookie
- `POST /api/auth/logout` -> revokes Supabase session + clears `sentinel-session` cookie

### Sentinel Proxy
- `ALL /api/sentinel/*` via `app/api/sentinel/[...path]/route.ts`
- Uses authenticated user session, loads/decrypts per-user Sentinel API key from Supabase profile, forwards request with `X-API-Key`
- Browser never receives Sentinel API keys
- Includes history reads (`GET /api/sentinel/signals/:id/history`) through the same user-scoped API-key path

### Telegram Delivery Bridge
- `GET /api/telegram/connect?token=...` (bot-link friendly)
- `POST /api/telegram/connect`
- Accepts `{ token }` from delivery bot-link flow
- Resolves the authenticated user mapping and calls delivery `POST /link/connect` with:
  - `token`
  - `app_user_id = sentinel_user_id`

### Supabase Setup
- `lib/supabase/admin.ts` for server-side admin operations
- `lib/supabase/client.ts` for browser (not wired yet)
- Fresh-state assumption: schema is created directly in Supabase project (no migration file required in this repo)

## Missing / TODO

### Critical (MVP)
1. **Done: Supabase schema**
   - `profiles(supabase_user_id, wallet_address, sentinel_user_id, sentinel_api_key)`
   - Sentinel API key stored encrypted in `sentinel_api_key`

2. **Done: Per-user key provisioning**
   - SIWE verify flow calls Sentinel `POST /api/v1/auth/register`
   - If Sentinel register gate is enabled, backend sends `X-Admin-Key` from `SENTINEL_REGISTER_ADMIN_KEY`
   - Key is encrypted and stored in Supabase profile

3. **Done: Proxy APIs**
   - Catch-all `/api/sentinel/*` supports `GET/POST/PATCH/PUT/DELETE`
   - Route resolves per-user API key and forwards with `X-API-Key`

4. **Done: Session guard**
   - `/app/*` is guarded in `app/(app)/layout.tsx` with server-side auth check + redirect to `/login`

5. **Magic link** (optional later)
   - Not implemented in backend right now

### Telegram Integration
- Backend connect endpoint is implemented (`POST /api/telegram/connect`).
- UI flow still needs to be wired in app screens:
  - User gets `token` from Telegram bot `/start` link flow.
  - Webapp sends token to backend connect endpoint.
  - Backend links using `app_user_id = sentinel_user_id`.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_SECRET_KEY=
SENTINEL_API_BASE_URL=http://localhost:3300/api/v1
SENTINEL_REGISTER_ADMIN_KEY=
SENTINEL_PROFILE_ENCRYPTION_KEY=
DELIVERY_BASE_URL=
```

## Notes
- Session creation now uses `admin.generateLink(type=magiclink)` + `verifyOtp(token_hash)` because `createSession` is not available in the installed `@supabase/supabase-js`.
- `SENTINEL_PROFILE_ENCRYPTION_KEY` must decode to 32 bytes (base64, hex, or raw 32-char string).
- If delivery and Sentinel run on the same host, `DELIVERY_BASE_URL` can be omitted; backend infers it from Sentinel base URL by removing `/api/v1`.
- `SENTINEL_API_BASE_URL` is the single canonical Sentinel endpoint for this app. It must be a full URL including scheme and `/api/v1`.
- Code still supports legacy Supabase env names (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) as fallbacks during migration.
- Sentinel has no global API key for protected `/api/v1/*` calls. Protected endpoints always use user-scoped `X-API-Key`.
- Register may still be admin-gated via Sentinel `REGISTER_ADMIN_KEY`; in that case set matching webapp `SENTINEL_REGISTER_ADMIN_KEY`.
- `REGISTER_ADMIN_KEY` is configured in Sentinel service env. `SENTINEL_REGISTER_ADMIN_KEY` is configured in this webapp backend env.
