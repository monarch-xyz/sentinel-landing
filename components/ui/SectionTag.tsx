'use client';

import { cn } from '@/lib/utils';

type SectionTagProps = {
  children: string;
  className?: string;
};

export function SectionTag({ children, className }: SectionTagProps) {
  return (
    <span
      className={cn(
        'inline-block font-mono text-xs tracking-[0.2em] uppercase',
        'text-[#ff6b35]/80 border border-[#ff6b35]/20 rounded',
        'px-2 py-1',
        className,
      )}
    >
      [ {children} ]
    </span>
  );
}
