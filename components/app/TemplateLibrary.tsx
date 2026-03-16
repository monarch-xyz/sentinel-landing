'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RiCheckLine, RiFileCopyLine, RiSparklingLine } from 'react-icons/ri';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SIGNAL_TEMPLATE_PRESETS, buildWhaleMovementTemplate, type SignalTemplateId } from '@/lib/signals/templates';

const SAMPLE_MARKET_ID = '0xb8fc70e82bc5bb53e773626fcc6a23f7eefa036918d7ef216ecfb1950a94a85e';
const SAMPLE_WHALES = [
  '0x1111111111111111111111111111111111111111',
  '0x2222222222222222222222222222222222222222',
  '0x3333333333333333333333333333333333333333',
];
const LOCAL_DELIVERY_WEBHOOK = 'http://delivery:3100/webhook/deliver';

const buildTemplatePayload = (templateId: SignalTemplateId) => {
  const template = buildWhaleMovementTemplate({
    templateId,
    marketId: SAMPLE_MARKET_ID,
    whaleAddresses: SAMPLE_WHALES,
  });

  return JSON.stringify(
    {
      ...template,
      webhook_url: LOCAL_DELIVERY_WEBHOOK,
    },
    null,
    2
  );
};

export function TemplateLibrary() {
  const [copiedTemplate, setCopiedTemplate] = useState<SignalTemplateId | null>(null);

  const handleCopy = async (templateId: SignalTemplateId) => {
    try {
      await navigator.clipboard.writeText(buildTemplatePayload(templateId));
      setCopiedTemplate(templateId);
      window.setTimeout(() => {
        setCopiedTemplate((current) => (current === templateId ? null : current));
      }, 1800);
    } catch {
      setCopiedTemplate(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-secondary mb-2">Templates</p>
        <h2 className="font-zen text-2xl font-semibold">Start from a known-good signal shape</h2>
        <p className="text-secondary mt-2 max-w-3xl">
          Copy a ready-made Sentinel payload for reference, or open the builder with the template already selected.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {SIGNAL_TEMPLATE_PRESETS.map((template) => (
          <Card key={template.id} className="flex h-full flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-secondary">{template.accent}</p>
                <h3 className="mt-2 font-zen text-xl font-semibold">{template.title}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#ff6b35]/10 text-[#ff6b35]">
                <RiSparklingLine className="h-5 w-5" />
              </div>
            </div>

            <p className="text-sm leading-relaxed text-secondary">{template.description}</p>

            <div className="rounded-md border border-border/80 bg-background/50 p-3 text-xs text-secondary">
              The copied JSON uses a sample Morpho market, three placeholder wallet addresses, and the local delivery webhook
              from Sentinel&apos;s Docker docs.
            </div>

            <div className="mt-auto flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="secondary" className="gap-2" onClick={() => handleCopy(template.id)}>
                {copiedTemplate === template.id ? <RiCheckLine className="h-4 w-4" /> : <RiFileCopyLine className="h-4 w-4" />}
                {copiedTemplate === template.id ? 'Copied' : 'Copy JSON'}
              </Button>
              <Link href={`/signals/new?preset=${template.id}`} className="no-underline">
                <Button className="w-full sm:w-auto">Use in builder</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

