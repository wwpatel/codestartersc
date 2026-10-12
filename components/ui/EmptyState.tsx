import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function EmptyState({
  title,
  text,
  action,
  className,
}: {
  title: string;
  text: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center',
        className,
      )}
    >
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
