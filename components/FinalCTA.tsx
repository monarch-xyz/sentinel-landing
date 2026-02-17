'use client';

import { motion } from 'framer-motion';
import { RiGithubLine, RiDiscordLine, RiBookOpenLine } from 'react-icons/ri';

export function FinalCTA() {
  return (
    <section className="relative py-24 md:py-32">
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(255, 107, 53, 0.05) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium mb-6">
            Ready to give your agent <span className="text-[#ff6b35]">eyes</span>?
          </h2>
          <p className="text-lg text-secondary mb-10">
            Sentinel is in early access. Join our Discord for API keys 
            and help shape how agents perceive DeFi.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="https://discord.gg/Ur4dwN3aPS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#5865F2] text-white font-serif text-lg rounded-md hover:bg-[#5865F2]/90 transition-colors no-underline"
            >
              <RiDiscordLine className="w-5 h-5" />
              Join Discord
            </a>
            <a
              href="https://github.com/monarch-xyz/sentinel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 border border-current text-secondary font-serif text-lg rounded-md hover:text-[#ff6b35] hover:border-[#ff6b35] transition-colors no-underline"
            >
              <RiGithubLine className="w-5 h-5" />
              View on GitHub
            </a>
          </div>

          {/* Secondary link */}
          <a
            href="https://github.com/monarch-xyz/sentinel/blob/main/docs/ARCHITECTURE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-secondary hover:text-[#ff6b35] transition-colors"
          >
            <RiBookOpenLine className="w-4 h-4" />
            <span className="text-sm">Read the architecture docs</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
