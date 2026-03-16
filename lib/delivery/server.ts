const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const normalizeBaseUrl = (value: string) => {
  const withScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(value) ? value : `http://${value}`;
  return trimTrailingSlash(new URL(withScheme).toString());
};

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
  const sentinelApiBase = process.env.SENTINEL_API_BASE_URL ?? 'http://localhost:3000/api/v1';
  return normalizeBaseUrl(sentinelApiBase).replace(/\/api\/v1$/, '');
};

export const getDeliveryBaseUrl = () =>
  normalizeBaseUrl(process.env.DELIVERY_BASE_URL ?? inferDeliveryBaseUrl());

export const getDeliveryWebhookUrl = () => `${getDeliveryBaseUrl()}/webhook/deliver`;

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
