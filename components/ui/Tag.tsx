import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type TagVariant = 'sky' | 'emerald' | 'amber' | 'neutral';

const variants: Record<TagVariant, string> = {
  sky: 'border-sky-400/25 bg-sky-400/10 text-sky-200',
  emerald: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
  amber: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
  neutral: 'border-white/15 bg-white/5 text-white/70',
};

export function Tag({
  variant = 'neutral',
  className,
  children,
}: {
  variant?: TagVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
