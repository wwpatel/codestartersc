'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import type { SectorLesson } from '@/lib/supabase/types';

const iconBtn =
  'inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40';

export function LessonControls({
  lesson,
  unitId,
  sectorSlug,
  orderedIds,
  index,
}: {
  lesson: SectorLesson;
  unitId: string;
  sectorSlug: string;
  orderedIds: string[];
  index: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function move(direction: -1 | 1) {
    const ids = [...orderedIds];
    const j = index + direction;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    const res = await fetch('/api/admin/lessons/reorder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ parentId: unitId, ids }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not reorder.');
      return;
    }
    setError(null);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm('Delete this lesson?')) return;
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not delete.');
      return;
    }
    setError(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Link
          href={`/learn/${sectorSlug}/${lesson.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Link>
        <button
          type="button"
          aria-label="Move lesson up"
          className={iconBtn}
          disabled={index === 0}
          onClick={() => move(-1)}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Move lesson down"
          className={iconBtn}
          disabled={index === orderedIds.length - 1}
          onClick={() => move(1)}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Delete lesson" className={iconBtn} onClick={remove}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
