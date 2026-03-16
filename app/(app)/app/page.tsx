import Link from 'next/link';
import { RiAlarmWarningLine, RiFlashlightLine, RiPulseLine } from 'react-icons/ri';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/app/StatCard';
import { SignalRow } from '@/components/app/SignalRow';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { countTrackedWallets, isWhaleMovementSignal } from '@/lib/signals/templates';
import { requestSentinelForUser } from '@/lib/sentinel/user-server';
import type { SignalRecord } from '@/lib/types/signal';

export default async function AppHome() {
  const user = await getAuthenticatedUser();
  const signals = user ? await requestSentinelForUser<SignalRecord[]>(user, '/signals') : [];

  const activeSignals = signals.filter((signal) => signal.is_active).length;
  const whaleSignals = signals.filter(isWhaleMovementSignal).length;
  const watchedWallets = signals.reduce((total, signal) => total + countTrackedWallets(signal.definition), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary mb-2">Overview</p>
          <h1 className="font-zen text-3xl sm:text-4xl font-semibold">Signal Command</h1>
          <p className="text-secondary mt-2 max-w-2xl">
            Track Morpho whale movement signals, review the registered watches tied to your Sentinel account, and add new alerts from templates instead of writing raw JSON.
          </p>
        </div>
        <Link href="/signals/new" className="no-underline">
          <Button size="lg" className="gap-2">
            <RiAlarmWarningLine className="w-5 h-5" />
            New Signal
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Registered Signals" value={String(signals.length)} icon={<RiFlashlightLine className="w-5 h-5" />} />
        <StatCard label="Active Signals" value={String(activeSignals)} icon={<RiPulseLine className="w-5 h-5" />} />
        <StatCard label="Watched Wallets" value={String(watchedWallets)} icon={<RiAlarmWarningLine className="w-5 h-5" />} />
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-zen text-xl font-semibold">Registered Signals</h2>
            <p className="text-secondary text-sm">
              {whaleSignals > 0
                ? `${whaleSignals} whale movement template${whaleSignals === 1 ? '' : 's'} currently registered.`
                : 'Create your first Morpho whale movement signal from a preset.'}
            </p>
          </div>
          <Link href="/signals/new" className="no-underline">
            <Button variant="secondary">Add template</Button>
          </Link>
        </div>

        {signals.length > 0 ? (
          <div className="space-y-4">
            {signals.map((signal) => (
              <SignalRow key={signal.id} signal={signal} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/80 bg-background/30 p-8 text-center">
            <p className="font-zen text-xl">No signals registered yet</p>
            <p className="text-secondary mt-2 max-w-xl mx-auto">
              Start with the whale exit trio template and enter the supplier wallets you want Sentinel to watch on Morpho.
            </p>
            <div className="mt-6">
              <Link href="/signals/new" className="no-underline">
                <Button>Create your first signal</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
