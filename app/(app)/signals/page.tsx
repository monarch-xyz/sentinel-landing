import Link from 'next/link';
import { RiAddLine, RiArrowRightLine, RiFileList3Line, RiFlashlightLine, RiPulseLine } from 'react-icons/ri';
import { SignalRow } from '@/components/app/SignalRow';
import { TemplateLibrary } from '@/components/app/TemplateLibrary';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { countTrackedWallets } from '@/lib/signals/templates';
import { requestSentinelForUser } from '@/lib/sentinel/user-server';
import type { SignalRecord } from '@/lib/types/signal';

const byUpdatedAtDesc = (left: SignalRecord, right: SignalRecord) =>
  new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();

export default async function SignalsPage() {
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
  const trackedWallets = orderedSignals.reduce((total, signal) => total + countTrackedWallets(signal.definition), 0);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 rounded-[28px] border border-border bg-surface p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Signals</p>
          <h1 className="mt-3 font-zen text-3xl font-semibold sm:text-4xl">Existing signals and new registrations</h1>
          <p className="mt-3 text-secondary">
            This page is the inventory. Review every registered signal, open its DSL detail page, and launch the builder when
            you want to add another one.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/signals/new" className="no-underline">
            <Button size="lg" className="gap-2">
              <RiAddLine className="h-5 w-5" />
              Add new signal
            </Button>
          </Link>
          <Link href="/app" className="no-underline">
            <Button size="lg" variant="secondary" className="gap-2">
              Back to dashboard
              <RiArrowRightLine className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">All Signals</p>
            <p className="mt-2 font-zen text-2xl font-semibold">{orderedSignals.length}</p>
          </div>
          <RiFileList3Line className="h-6 w-6 text-[#ff6b35]" />
        </Card>
        <Card className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">Active</p>
            <p className="mt-2 font-zen text-2xl font-semibold">{activeSignals}</p>
          </div>
          <RiPulseLine className="h-6 w-6 text-[#ff6b35]" />
        </Card>
        <Card className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">Tracked Wallets</p>
            <p className="mt-2 font-zen text-2xl font-semibold">{trackedWallets}</p>
          </div>
          <RiFlashlightLine className="h-6 w-6 text-[#ff6b35]" />
        </Card>
      </div>

      <Card className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">Inventory</p>
            <h2 className="mt-2 font-zen text-2xl font-semibold">Registered signal list</h2>
          </div>
          <p className="text-sm text-secondary">Click any signal name to open the DSL structure, evaluations, and notification history.</p>
        </div>

        {signalsError ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
            <p className="font-medium text-foreground">Signal inventory is unavailable.</p>
            <p className="mt-2 text-sm text-secondary">{signalsError}</p>
          </div>
        ) : orderedSignals.length > 0 ? (
          <div className="divide-y divide-border/70">
            {orderedSignals.map((signal) => (
              <SignalRow key={signal.id} signal={signal} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/80 bg-background/40 p-8 text-center">
            <p className="font-zen text-xl">No signals registered yet</p>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-secondary">
              Use a template below or go straight to the builder to create your first Sentinel signal.
            </p>
            <div className="mt-6">
              <Link href="/signals/new" className="no-underline">
                <Button>Create first signal</Button>
              </Link>
            </div>
          </div>
        )}
      </Card>

      <TemplateLibrary />
    </div>
  );
}
