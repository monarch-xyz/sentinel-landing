import Link from 'next/link';
import { RiArrowRightLine, RiRobot2Line, RiTelegram2Line, RiWebhookLine } from 'react-icons/ri';
import { TelegramConnectPanel } from '@/components/app/TelegramConnectPanel';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getAuthenticatedUser, getWalletAddressFromUser } from '@/lib/auth/session';

export default async function TelegramPage() {
  const user = await getAuthenticatedUser();
  const walletAddress = user ? getWalletAddressFromUser(user) : null;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 rounded-[28px] border border-border bg-surface p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Telegram</p>
          <h1 className="mt-3 font-zen text-3xl font-semibold sm:text-4xl">Keep delivery setup in its own workspace</h1>
          <p className="mt-3 text-secondary">
            This section is isolated on purpose. Bot linking, delivery prerequisites, and chat-token instructions belong here,
            not mixed into the signal inventory or dashboard overview.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/signals" className="no-underline">
            <Button size="lg" variant="secondary" className="gap-2">
              Signal inventory
              <RiArrowRightLine className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/signals/new" className="no-underline">
            <Button size="lg" className="gap-2">
              Create signal
              <RiArrowRightLine className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <TelegramConnectPanel walletAddress={walletAddress} />

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#ff6b35]/10 text-[#ff6b35]">
                <RiRobot2Line className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-secondary">Bot Flow</p>
                <h2 className="mt-2 font-zen text-2xl font-semibold">Documented linking sequence</h2>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="rounded-lg border border-border/80 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-secondary">Step 1</p>
                <p className="mt-2 text-sm text-secondary">Run the Delivery service with a valid Telegram bot token configured.</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-secondary">Step 2</p>
                <p className="mt-2 text-sm text-secondary">Send <span className="font-mono text-foreground">/start</span> to the bot to receive a short-lived link token.</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-secondary">Step 3</p>
                <p className="mt-2 text-sm text-secondary">Paste that token into the form on this page to map your Sentinel user to the Telegram chat.</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#229ED9]/10 text-[#229ED9]">
                <RiTelegram2Line className="h-5 w-5" />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-secondary">Identity</p>
              <h3 className="font-zen text-xl font-semibold">Chat linking, not channel registration</h3>
              <p className="text-sm text-secondary">
                The upstream Sentinel docs describe Telegram as a chat-link flow. This app follows that documented model.
              </p>
            </Card>

            <Card className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#ff6b35]/10 text-[#ff6b35]">
                <RiWebhookLine className="h-5 w-5" />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-secondary">Delivery</p>
              <h3 className="font-zen text-xl font-semibold">Signals deliver through the adapter</h3>
              <p className="text-sm text-secondary">
                Once linked, newly created signals can deliver through the Telegram adapter flow that Sentinel&apos;s delivery
                service expects.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
