'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { RiExternalLinkLine, RiTelegram2Line } from 'react-icons/ri';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface TelegramConnectResponse {
  ok?: boolean;
  app_user_id?: string;
  details?: string;
}

interface TelegramConnectPanelProps {
  walletAddress?: string | null;
}

export function TelegramConnectPanel({ walletAddress }: TelegramConnectPanelProps) {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage(null);

    try {
      const response = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const payload = (await response.json().catch(() => null)) as TelegramConnectResponse | null;
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.details ?? 'Unable to connect Telegram.');
      }

      setStatus('success');
      setMessage(
        payload.app_user_id
          ? `Telegram linked. Sentinel delivery is now mapped to ${payload.app_user_id}.`
          : 'Telegram linked.'
      );
      setToken('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to connect Telegram.');
    }
  };

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Telegram</p>
          <h2 className="mt-2 font-zen text-2xl font-semibold">Link alerts to your Telegram chat</h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#229ED9]/10 text-[#229ED9]">
          <RiTelegram2Line className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-3 text-sm text-secondary">
        <p>Sentinel&apos;s delivery service documents a chat-link flow, not a separate channel registration flow.</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Run the Delivery service and configure its Telegram bot token.</li>
          <li>Send <span className="font-mono">/start</span> to the Telegram bot so it issues a short-lived link token.</li>
          <li>Paste that token below and connect it to this Sentinel account.</li>
        </ol>
      </div>

      <div className="rounded-md border border-border/80 bg-background/50 p-3 text-xs text-secondary">
        {walletAddress ? (
          <span>
            Current wallet session: <span className="font-mono text-foreground">{walletAddress}</span>
          </span>
        ) : (
          <span>Your current Sentinel session will be used as the delivery identity.</span>
        )}
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Telegram link token
          <input
            type="text"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste the token returned by the bot"
            className="rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground"
          />
        </label>
        <Button type="submit" disabled={!token || status === 'loading'}>
          {status === 'loading' ? 'Connecting Telegram...' : 'Connect Telegram'}
        </Button>
      </form>

      {message && (
        <p className={status === 'error' ? 'text-sm text-red-500' : 'text-sm text-emerald-600'}>
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="https://github.com/monarch-xyz/sentinel/blob/main/docs/TELEGRAM_DELIVERY.md"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-secondary transition-colors hover:text-foreground no-underline"
        >
          Telegram delivery docs
          <RiExternalLinkLine className="h-4 w-4" />
        </Link>
        <Link
          href="https://github.com/monarch-xyz/sentinel/blob/main/packages/delivery/README.md"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-secondary transition-colors hover:text-foreground no-underline"
        >
          Delivery service setup
          <RiExternalLinkLine className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}

