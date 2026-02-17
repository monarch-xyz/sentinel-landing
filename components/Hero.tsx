'use client';

import { motion } from 'framer-motion';
import { RiArrowDownLine } from 'react-icons/ri';

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-14 md:pt-16">
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255, 107, 53, 0.03) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-4xl mx-auto">
          {/* Opening - provocative */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-lg sm:text-xl text-secondary mb-8 italic"
          >
            Most agents are blind.
          </motion.p>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] mb-8"
          >
            Give your agent
            <br />
            <span className="text-[#ff6b35]">awareness</span> in DeFi.
          </motion.h1>

          {/* Narrative paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mb-12"
          >
            <p className="font-serif text-xl sm:text-2xl text-secondary leading-relaxed mb-6">
              Raw blockchain events are noise. Every supply, withdraw, borrow — 
              thousands per hour. That&apos;s not signal. That&apos;s spam.
            </p>
            <p className="font-serif text-xl sm:text-2xl leading-relaxed">
              What matters isn&apos;t <em>events</em>. It&apos;s <em>conditions</em>.
              <br />
              <span className="text-[#ff6b35]">When something meaningful happens.</span>
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <a
              href="#story"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#ff6b35] text-white font-serif text-lg rounded-md hover:bg-[#ff6b35]/90 transition-colors no-underline"
            >
              Learn how it works
              <RiArrowDownLine className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/monarch-xyz/sentinel/blob/main/docs/ARCHITECTURE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border border-current text-secondary font-serif text-lg rounded-md hover:text-[#ff6b35] hover:border-[#ff6b35] transition-colors no-underline"
            >
              Read the docs
            </a>
          </motion.div>

          {/* Byline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-sm text-secondary"
          >
            Built by{' '}
            <a
              href="https://monarchlend.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff6b35] hover:underline"
            >
              Monarch
            </a>
          </motion.p>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border border-secondary/30 rounded-full flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 bg-[#ff6b35] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
