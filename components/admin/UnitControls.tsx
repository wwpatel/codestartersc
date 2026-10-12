'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { UnitForm } from './UnitForm';
import type { Unit } from '@/lib/supabase/types';

const iconBtn =
  'inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40';

export function UnitControls({
  unit,
  sectorId,
  orderedIds,
  index,
}: {
  unit: Unit;
  sectorId: string;
  orderedIds: string[];
  index: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function move(direction: -1 | 1) {
    const ids = [...orderedIds];
    const j = index + direction;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    const res = await fetch('/api/admin/units/reorder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ parentId: sectorId, ids }),
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
    if (!window.confirm('Delete this unit and all of its lessons?')) return;
    const res = await fetch(`/api/admin/units/${unit.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not delete.');
      return;
    }
    setError(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Move unit up"
          className={iconBtn}
          disabled={index === 0}
          onClick={() => move(-1)}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Move unit down"
          className={iconBtn}
          disabled={index === orderedIds.length - 1}
          onClick={() => move(1)}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Edit unit"
          className={iconBtn}
          onClick={() => setEditing((v) => !v)}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Delete unit" className={iconBtn} onClick={remove}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
      {editing ? (
        <div className="w-full md:w-96">
          <UnitForm sectorId={sectorId} unit={unit} onDone={() => setEditing(false)} />
        </div>
      ) : null}
    </div>
  );
}
