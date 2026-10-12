import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SectorWithUnits } from '@/lib/supabase/types';

export function LessonSidebar({
  sector,
  currentLessonId,
}: {
  sector: SectorWithUnits;
  currentLessonId: string;
}) {
  return (
    <nav>
      <Link
        href={`/learn/${sector.slug}`}
        className="flex items-center gap-1 text-xs uppercase tracking-[3px] text-muted hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {sector.name}
      </Link>
      {sector.units.map((unit, i) => (
        <div key={unit.id} className="mt-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Unit {i + 1}
          </p>
          <p className="mb-2 text-sm font-semibold text-white/90">{unit.title}</p>
          <ul className="space-y-0.5">
            {unit.lessons.map((lesson, j) => {
              const active = lesson.id === currentLessonId;
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/learn/${sector.slug}/${lesson.id}`}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border-l-2 px-3 py-2 text-sm transition-colors',
                      active
                        ? 'border-accent bg-sky-400/10 text-foreground'
                        : 'border-transparent text-muted hover:bg-white/5 hover:text-foreground',
                    )}
                  >
                    <span className="w-5 shrink-0 text-xs tabular-nums text-muted">{j + 1}</span>
                    <span>{lesson.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
