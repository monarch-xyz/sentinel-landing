import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { countTrackedWallets, describeSignalDefinition, getSignalMarketId } from '@/lib/signals/templates';
import { requestSentinelForUser, SentinelRequestError } from '@/lib/sentinel/user-server';
import type { SignalHistoryResponse, SignalNotificationLogEntry, SignalRecord, SignalRunLogEntry } from '@/lib/types/signal';

interface SignalDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

const formatTimestamp = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
};

const renderEvaluationLabel = (evaluation: SignalRunLogEntry) => {
  if (evaluation.triggered) {
    return 'Triggered';
  }

  if (!evaluation.conclusive) {
    return 'Inconclusive';
  }

  if (evaluation.in_cooldown) {
    return 'Cooldown';
  }

  return 'Checked';
};

const renderNotificationLabel = (notification: SignalNotificationLogEntry) => {
  if (typeof notification.webhook_status === 'number' && notification.webhook_status < 400) {
    return 'Delivered';
  }

  if (typeof notification.webhook_status === 'number') {
    return `Failed (${notification.webhook_status})`;
  }

  return 'Pending';
};

export default async function SignalDetailPage({ params }: SignalDetailPageProps) {
  const { id } = await params;
  const user = await getAuthenticatedUser();

  if (!user) {
    notFound();
  }

  let signal: SignalRecord;
  let history: SignalHistoryResponse;

  try {
    [signal, history] = await Promise.all([
      requestSentinelForUser<SignalRecord>(user, `/signals/${id}`),
      requestSentinelForUser<SignalHistoryResponse>(user, `/signals/${id}/history?include_notifications=true`),
    ]);
  } catch (error) {
    if (error instanceof SentinelRequestError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const trackedWallets = countTrackedWallets(signal.definition);
  const summary = describeSignalDefinition(signal.definition);
  const marketId = getSignalMarketId(signal.definition);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary mb-2">Signal</p>
          <h1 className="font-zen text-3xl sm:text-4xl font-semibold">{signal.name}</h1>
          <p className="text-secondary mt-2 max-w-3xl">{signal.description || summary}</p>
          <div className="flex flex-wrap gap-2 mt-4 text-xs text-secondary">
            <span className="rounded-full border border-border px-3 py-1">{signal.is_active ? 'Active' : 'Paused'}</span>
            <span className="rounded-full border border-border px-3 py-1">Market {marketId}</span>
            <span className="rounded-full border border-border px-3 py-1">{trackedWallets} wallets tracked</span>
            <span className="rounded-full border border-border px-3 py-1">Window {signal.definition.window.duration}</span>
          </div>
        </div>
        <Link href="/signals/new" className="no-underline">
          <Button>Create another</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="font-zen text-xl font-semibold mb-4">Definition</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
            <div className="rounded-md border border-border/80 bg-background/40 p-3">
              <p className="text-xs uppercase tracking-[0.25em] text-secondary">Created</p>
              <p className="mt-2">{formatTimestamp(signal.created_at)}</p>
            </div>
            <div className="rounded-md border border-border/80 bg-background/40 p-3">
              <p className="text-xs uppercase tracking-[0.25em] text-secondary">Last Trigger</p>
              <p className="mt-2">{formatTimestamp(signal.last_triggered_at)}</p>
            </div>
          </div>
          <pre className="text-xs leading-relaxed bg-[#0d1117] text-[#e6edf3] rounded-lg p-4 overflow-x-auto">
            {JSON.stringify(signal.definition, null, 2)}
          </pre>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="font-zen text-xl font-semibold mb-4">Recent Evaluations</h2>
          {history.evaluations.length > 0 ? (
            <div className="space-y-3">
              {history.evaluations.slice(0, 8).map((evaluation) => (
                <div key={evaluation.id} className="rounded-md border border-border/80 bg-background/40 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{renderEvaluationLabel(evaluation)}</p>
                      <p className="text-xs text-secondary">{formatTimestamp(evaluation.evaluated_at)}</p>
                    </div>
                    <div className="text-xs text-secondary">
                      {evaluation.notification_attempted
                        ? `Notify ${evaluation.notification_success ? 'ok' : 'attempted'}`
                        : 'No notification'}
                    </div>
                  </div>
                  {evaluation.error_message && <p className="text-xs text-red-400 mt-3">{evaluation.error_message}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary text-sm">No evaluation history yet.</p>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="font-zen text-xl font-semibold mb-4">Recent Notifications</h2>
        {history.notifications.length > 0 ? (
          <div className="space-y-3">
            {history.notifications.slice(0, 8).map((notification) => (
              <div key={notification.id} className="rounded-md border border-border/80 bg-background/40 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{renderNotificationLabel(notification)}</p>
                    <p className="text-xs text-secondary">{formatTimestamp(notification.triggered_at)}</p>
                  </div>
                  <div className="text-xs text-secondary">Retry count {notification.retry_count}</div>
                </div>
                {notification.error_message && <p className="text-xs text-red-400 mt-3">{notification.error_message}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-secondary text-sm">No notification deliveries recorded yet.</p>
        )}
      </div>
    </div>
  );
}
