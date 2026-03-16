import Link from 'next/link';
import {
  RiAlarmWarningLine,
  RiArrowRightLine,
  RiFlashlightLine,
  RiPulseLine,
  RiTelegram2Line,
  RiWallet3Line,
} from 'react-icons/ri';
import { SignalDslPanel } from '@/components/app/SignalDslPanel';
import { SignalRow } from '@/components/app/SignalRow';
import { StatCard } from '@/components/app/StatCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getAuthenticatedUser, getWalletAddressFromUser } from '@/lib/auth/session';
import { countTrackedWallets, isWhaleMovementSignal } from '@/lib/signals/templates';
import { requestSentinelForUser } from '@/lib/sentinel/user-server';
import type { SignalRecord } from '@/lib/types/signal';

const byUpdatedAtDesc = (left: SignalRecord, right: SignalRecord) =>
  new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();

export default async function AppHome() {
  const user = await getAuthenticatedUser();
  let signals: SignalRecord[] = [];
  let signalsError: string | null = null;

  if (user) {
    try {
      signals = await requestSentinelForUser<SignalRecord[]>(user, '/signals');
    } catch (error) {
      signalsError = error instanceof Error ? error.message : 'Unable to load signals.';
    }
  }

  const orderedSignals = [...signals].sort(byUpdatedAtDesc);
  const activeSignals = orderedSignals.filter((signal) => signal.is_active).length;
  const whaleSignals = orderedSignals.filter(isWhaleMovementSignal).length;
  const watchedWallets = orderedSignals.reduce((total, signal) => total + countTrackedWallets(signal.definition), 0);
  const triggeredSignals = orderedSignals.filter((signal) => Boolean(signal.last_triggered_at)).length;
  const walletAddress = user ? getWalletAddressFromUser(user) : null;
  const spotlightSignal = orderedSignals[0] ?? null;
  const recentSignals = orderedSignals.slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">Dashboard</p>
            <h1 className="mt-3 font-zen text-3xl font-semibold sm:text-4xl">Run the console from a clear control surface</h1>
            <p className="mt-3 text-secondary">
              This page is now just the overview: recent signals, current activity, and a quick DSL spotlight. Use the
              dedicated Signals and Telegram sections to manage the real workflow.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/signals" className="no-underline">
              <Button size="lg" className="gap-2">
                View signals
                <RiArrowRightLine className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/telegram" className="no-underline">
              <Button size="lg" variant="secondary" className="gap-2">
                Telegram setup
                <RiTelegram2Line className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-secondary">
          {walletAddress ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5">
              <RiWallet3Line className="h-4 w-4 text-[#ff6b35]" />
              <span className="font-mono text-foreground">{walletAddress}</span>
            </div>
          ) : null}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5">
            <span>{orderedSignals.length}</span>
            <span>signal{orderedSignals.length === 1 ? '' : 's'} registered</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5">
            <span>{triggeredSignals}</span>
            <span>have triggered at least once</span>
          </div>
        </div>
      </section>

      {signalsError ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <p className="font-medium text-foreground">The overview loaded, but Sentinel signal data is unavailable.</p>
          <p className="mt-2 text-sm text-secondary">{signalsError}</p>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered Signals" value={String(orderedSignals.length)} icon={<RiFlashlightLine className="h-5 w-5" />} />
        <StatCard label="Active Signals" value={String(activeSignals)} icon={<RiPulseLine className="h-5 w-5" />} />
        <StatCard label="Whale Templates" value={String(whaleSignals)} icon={<RiAlarmWarningLine className="h-5 w-5" />} />
        <StatCard label="Tracked Wallets" value={String(watchedWallets)} icon={<RiWallet3Line className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-secondary">Recent Signals</p>
              <h2 className="mt-2 font-zen text-2xl font-semibold">What is currently live</h2>
            </div>
            <Link href="/signals" className="text-sm text-secondary no-underline transition-colors hover:text-foreground">
              Open inventory
            </Link>
          </div>

          {recentSignals.length > 0 ? (
            <div className="divide-y divide-border/70">
              {recentSignals.map((signal) => (
                <SignalRow key={signal.id} signal={signal} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-background/40 p-6">
              <p className="font-zen text-xl text-foreground">No signals registered yet</p>
              <p className="mt-2 text-sm text-secondary">
                Start in the Signals section, pick a template, and register your first Morpho signal.
              </p>
              <div className="mt-5">
                <Link href="/signals/new" className="no-underline">
                  <Button>Create first signal</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>

        {spotlightSignal ? (
          <SignalDslPanel
            signal={spotlightSignal}
            compact
            eyebrow="Signal Spotlight"
            title={spotlightSignal.name}
            description="Newest signal definition in the workspace. Open the detail page for history, notifications, and the full DSL view."
          />
        ) : (
          <Card className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-secondary">Next Steps</p>
              <h2 className="mt-2 font-zen text-2xl font-semibold">Set up the first complete flow</h2>
            </div>
            <div className="grid gap-3">
              <div className="rounded-lg border border-border/80 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-secondary">1. Telegram</p>
                <p className="mt-2 text-sm text-secondary">Link your Telegram chat in the dedicated Telegram section.</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-secondary">2. Builder</p>
                <p className="mt-2 text-sm text-secondary">Create a whale movement signal from a known template.</p>
              </div>
              <div className="rounded-lg border border-border/80 bg-background/50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-secondary">3. Review</p>
                <p className="mt-2 text-sm text-secondary">Use the signal detail page to inspect the DSL and delivery history.</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Signals</p>
          <h3 className="font-zen text-xl font-semibold">Manage existing automations</h3>
          <p className="text-sm text-secondary">Browse everything registered, open DSL details, or launch the builder for a new signal.</p>
          <Link href="/signals" className="no-underline">
            <Button variant="secondary" className="gap-2">
              Go to signals
              <RiArrowRightLine className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Telegram</p>
          <h3 className="font-zen text-xl font-semibold">Keep delivery setup isolated</h3>
          <p className="text-sm text-secondary">Use a dedicated page for bot linking and delivery instructions instead of mixing it into the dashboard.</p>
          <Link href="/telegram" className="no-underline">
            <Button variant="secondary" className="gap-2">
              Open Telegram setup
              <RiArrowRightLine className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Builder</p>
          <h3 className="font-zen text-xl font-semibold">Add another signal fast</h3>
          <p className="text-sm text-secondary">Jump straight into the template builder if you already know the market and wallets you want to track.</p>
          <Link href="/signals/new" className="no-underline">
            <Button variant="secondary" className="gap-2">
              Open builder
              <RiArrowRightLine className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
