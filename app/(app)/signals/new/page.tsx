import { SignalBuilderForm } from '@/components/app/SignalBuilderForm';
import { SIGNAL_TEMPLATE_PRESETS, type SignalTemplateId } from '@/lib/signals/templates';

interface NewSignalPageProps {
  searchParams?: Promise<{ preset?: string }> | { preset?: string };
}

export default async function NewSignalPage({ searchParams }: NewSignalPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const presetParam = resolvedSearchParams?.preset;
  const hasPreset = (value: string): value is SignalTemplateId =>
    SIGNAL_TEMPLATE_PRESETS.some((preset) => preset.id === value);
  const initialPreset =
    typeof presetParam === 'string' && hasPreset(presetParam) ? presetParam : undefined;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-secondary mb-2">Create</p>
        <h1 className="font-zen text-3xl sm:text-4xl font-semibold">New Whale Signal</h1>
        <p className="text-secondary mt-2 max-w-2xl">
          Start with a Morpho whale movement template, paste the supplier wallets you care about, and let Sentinel register the full JSON definition for you.
        </p>
        <p className="text-secondary mt-3 max-w-2xl text-sm">
          If you want Telegram alerts, connect your chat from the dashboard first so the signal can deliver to the Telegram adapter flow documented in Sentinel&apos;s delivery service.
        </p>
      </div>

      <SignalBuilderForm initialPreset={initialPreset} />
    </div>
  );
}
