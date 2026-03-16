import { SignalBuilderForm } from '@/components/app/SignalBuilderForm';

export default function NewSignalPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-secondary mb-2">Create</p>
        <h1 className="font-zen text-3xl sm:text-4xl font-semibold">New Whale Signal</h1>
        <p className="text-secondary mt-2 max-w-2xl">
          Start with a Morpho whale movement template, paste the supplier wallets you care about, and let Sentinel register the full JSON definition for you.
        </p>
      </div>

      <SignalBuilderForm />
    </div>
  );
}
