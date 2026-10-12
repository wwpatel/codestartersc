'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LessonDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-4 w-4" /> Lessons
      </Button>
      {open ? (
        <>
          <div
            className="fixed inset-0 z-[55] bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-[60] w-80 max-w-[85vw] overflow-y-auto border-r border-white/10 bg-background p-6">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="mb-6 rounded-lg p-1 text-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            {children}
          </div>
        </>
      ) : null}
    </>
  );
}
