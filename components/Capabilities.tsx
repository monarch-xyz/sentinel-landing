'use client';

import { motion } from 'framer-motion';

const capabilities = [
  {
    title: 'Compose conditions',
    description: 'Combine threshold checks, percentage changes, and time windows. AND them, OR them, nest them. Model how real strategies think.',
  },
  {
    title: 'Watch across time',
    description: '"Position dropped 20% over 7 days." Sentinel compares state across time windows, not just point-in-time snapshots.',
  },
  {
    title: 'Filter noise at source',
    description: 'Your webhook fires only when all conditions are met. No more filtering in your agent. Signal reaches you clean.',
  },
  {
    title: 'React with context',
    description: 'Webhook payloads include matched conditions, actual values, and thresholds. Your agent knows exactly what triggered and why.',
  },
];

export function Capabilities() {
  return (
    <section className="relative py-24 md:py-32 bg-surface">
      {/* Subtle texture */}
      <div
        className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        {/* Section intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium mb-6">
            What Sentinel <span className="text-[#ff6b35]">enables</span>
          </h2>
          <p className="text-lg text-secondary">
            More than event triggers. A query engine that runs continuously, 
            evaluating conditions against live blockchain state.
          </p>
        </motion.div>

        {/* Capabilities list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {capabilities.map((cap, index) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-start gap-4">
                {/* Accent line */}
                <div className="w-px h-full min-h-[60px] bg-gradient-to-b from-[#ff6b35] to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                
                <div>
                  <h3 className="font-serif text-xl font-medium mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-secondary leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
