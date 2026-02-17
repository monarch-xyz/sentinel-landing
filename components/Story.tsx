'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';

const storyBeats = [
  {
    id: 'problem',
    label: 'The Problem',
    title: 'Events aren\'t signals.',
    content: `Your agent subscribes to on-chain events. Supply events, withdraw events, liquidation events. But every time a whale sneezes, your webhook fires. You're drowning in noise, filtering in your own code, missing what actually matters.`,
    visual: 'noise',
    code: `// What you're doing now
onEvent("Supply", (e) => {
  // Is this important? 🤷
  if (e.amount > threshold) {
    // What about context?
    // What about the bigger picture?
    notify(e);
  }
});`,
  },
  {
    id: 'insight',
    label: 'The Insight',
    title: 'Conditions are signals.',
    content: `What if instead of reacting to every event, you could describe what actually matters? "A whale's position dropped 20% over 7 days." "Utilization crossed 90% while supply is decreasing." These are conditions — meaningful patterns, not raw events.`,
    visual: 'signal',
    code: `// What you actually want
{
  "when": "position drops 20%",
  "and": "utilization > 90%",
  "over": "7 days",
  "then": "notify me"
}`,
  },
  {
    id: 'solution',
    label: 'The Solution',
    title: 'Sentinel watches for you.',
    content: `Define your conditions once. Sentinel continuously evaluates state, compares across time windows, and fires webhooks only when your conditions are met. Your agent reacts to signal, not noise.`,
    visual: 'sentinel',
    code: `POST /api/v1/signals
{
  "name": "Whale Exit Alert",
  "conditions": [{
    "type": "change",
    "metric": "Position.supplyShares",
    "direction": "decrease",
    "by": { "percent": 20 }
  }],
  "webhook_url": "https://..."
}`,
  },
];

function CodeBlock({ code, variant }: { code: string; variant: string }) {
  const colors = {
    noise: { accent: '#ff6b35', glow: 'rgba(255, 107, 53, 0.1)' },
    signal: { accent: '#22c55e', glow: 'rgba(34, 197, 94, 0.1)' },
    sentinel: { accent: '#ff6b35', glow: 'rgba(255, 107, 53, 0.15)' },
  };
  
  const { accent, glow } = colors[variant as keyof typeof colors] || colors.noise;
  
  return (
    <div 
      className="relative rounded-lg overflow-hidden"
      style={{ boxShadow: `0 0 60px -15px ${glow}` }}
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1d1f] border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-white/40 font-mono ml-2">
          {variant === 'noise' ? 'agent.ts' : variant === 'signal' ? 'what-you-want.json' : 'sentinel-api.sh'}
        </span>
      </div>
      
      {/* Code content */}
      <pre className="p-4 bg-[#0d1117] text-sm overflow-x-auto">
        <code className="font-mono text-white/80 leading-relaxed">
          {code.split('\n').map((line, i) => (
            <div key={i} className="whitespace-pre">
              {line.includes('//') ? (
                <span className="text-white/40">{line}</span>
              ) : line.includes('"') ? (
                <span>
                  {line.split(/(["'][^"']*["'])/).map((part, j) => (
                    <span key={j} className={part.startsWith('"') || part.startsWith("'") ? `text-[${accent}]` : ''}>
                      {part.startsWith('"') || part.startsWith("'") ? (
                        <span style={{ color: accent }}>{part}</span>
                      ) : part}
                    </span>
                  ))}
                </span>
              ) : (
                line
              )}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function Story() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="story" className="relative py-24 md:py-32" ref={containerRef}>
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        {storyBeats.map((beat, index) => (
          <motion.div
            key={beat.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
              index < storyBeats.length - 1 ? 'mb-32 md:mb-48' : ''
            }`}
          >
            {/* Text side */}
            <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
              <span 
                className="inline-block text-sm font-mono tracking-wider mb-4"
                style={{ color: '#ff6b35' }}
              >
                {beat.label}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium mb-6 leading-tight">
                {beat.title}
              </h2>
              <p className="text-lg text-secondary leading-relaxed">
                {beat.content}
              </p>
            </div>
            
            {/* Visual side */}
            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
              <CodeBlock code={beat.code} variant={beat.visual} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
