const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export class DeliveryError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'DeliveryError';
    this.status = status;
    this.payload = payload;
  }
}

const inferDeliveryBaseUrl = () => {
  const sentinelApiBase =
    process.env.SENTINEL_API_BASE_URL ??
    process.env.NEXT_PUBLIC_SENTINEL_ENDPOINT ??
    'http://localhost:3000/api/v1';
  return trimTrailingSlash(sentinelApiBase).replace(/\/api\/v1$/, '');
};

export const getDeliveryBaseUrl = () =>
  trimTrailingSlash(process.env.DELIVERY_BASE_URL ?? inferDeliveryBaseUrl());

export const connectDeliveryLink = async ({
  token,
  appUserId,
}: {
  token: string;
  appUserId: string;
}) => {
  const response = await fetch(`${getDeliveryBaseUrl()}/link/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      app_user_id: appUserId,
    }),
    cache: 'no-store',
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new DeliveryError(`Delivery connect failed (${response.status})`, response.status, payload);
  }

  return payload;
};
