'use client';

import { motion } from 'framer-motion';
import { SectionTag } from './ui/SectionTag';
import { GridDivider } from './ui/GridDivider';

const storyBeats = [
  {
    id: 'problem',
    tag: 'The Problem',
    title: 'Events aren\'t signals.',
    content: `Your agent subscribes to on-chain events. Supply, withdraw, liquidation. But every time a whale sneezes, your webhook fires. You're drowning in noise.`,
    code: `// What you're doing now
onEvent("Supply", (e) => {
  if (e.amount > threshold) {
    // Is this important? 🤷
    notify(e);
  }
});`,
  },
  {
    id: 'insight',
    tag: 'The Insight',
    title: 'Conditions are signals.',
    content: `What if instead of reacting to events, you described what matters? "Position dropped 20%." "Utilization crossed 90%." These are conditions — meaningful patterns.`,
    code: `// What you actually want
{
  "when": "position drops 20%",
  "and": "utilization > 90%",
  "over": "7 days"
}`,
  },
  {
    id: 'solution',
    tag: 'The Solution',
    title: 'Sentinel watches.',
    content: `Define conditions once. Sentinel continuously evaluates state, compares across time windows, fires webhooks only when met. Signal reaches your agent clean.`,
    code: `POST /api/v1/signals
{
  "name": "Whale Exit",
  "conditions": [{
    "type": "change",
    "metric": "Position.supplyShares",
    "direction": "decrease",
    "by": { "percent": 20 }
  }]
}`,
  },
];

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative rounded-lg overflow-hidden border border-border">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
      </div>
      
      {/* Code content */}
      <pre className="p-4 bg-background text-sm overflow-x-auto">
        <code className="font-mono text-secondary leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}

export function Story() {
  return (
    <section id="story" className="relative">
      {/* Grid divider at top */}
      <GridDivider rows={4} />

      <div className="py-16 md:py-24">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          {storyBeats.map((beat, index) => (
            <motion.div
              key={beat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                index < storyBeats.length - 1 ? 'mb-24 md:mb-32' : ''
              }`}
            >
              {/* Text side */}
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <SectionTag>{beat.tag}</SectionTag>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl mt-4 mb-4">
                  {beat.title}
                </h2>
                <p className="text-secondary leading-relaxed">
                  {beat.content}
                </p>
              </div>
              
              {/* Code side */}
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <CodeBlock code={beat.code} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
