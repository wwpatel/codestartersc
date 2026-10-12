'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tag, type TagVariant } from '@/components/ui/Tag';
import { CODE_LANGUAGES } from '@/lib/code-languages';
import { BlockForm } from './BlockForm';
import type { LessonBlock } from '@/lib/supabase/types';

const iconBtn =
  'inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40';

const TAG_VARIANT: Record<LessonBlock['type'], TagVariant> = {
  note: 'neutral',
  code: 'neutral',
  link: 'sky',
};

function preview(block: LessonBlock) {
  const text = block.body ?? block.url ?? '';
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

function Row({
  block,
  index,
  orderedIds,
  onEdit,
}: {
  block: LessonBlock;
  index: number;
  orderedIds: string[];
  onEdit: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function move(direction: -1 | 1) {
    const ids = [...orderedIds];
    const j = index + direction;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    const res = await fetch('/api/admin/blocks/reorder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ parentId: block.lesson_id, ids }),
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
    if (!window.confirm('Delete this block?')) return;
    const res = await fetch(`/api/admin/blocks/${block.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not delete.');
      return;
    }
    setError(null);
    router.refresh();
  }

  const langLabel = block.language
    ? CODE_LANGUAGES.find((l) => l.value === block.language)?.label ?? block.language
    : null;

  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Tag variant={TAG_VARIANT[block.type]}>
              {block.type === 'note' ? 'Note' : block.type === 'code' ? 'Code' : 'Link'}
            </Tag>
            {block.type === 'code' && langLabel ? (
              <span className="text-xs uppercase tracking-[0.16em] text-muted">{langLabel}</span>
            ) : null}
          </div>
          <p className="mt-2 truncate text-sm">
            {block.title ?? <span className="text-muted">{preview(block)}</span>}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Move block up"
            className={iconBtn}
            disabled={index === 0}
            onClick={() => move(-1)}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Move block down"
            className={iconBtn}
            disabled={index === orderedIds.length - 1}
            onClick={() => move(1)}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Edit block" className={iconBtn} onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Delete block" className={iconBtn} onClick={remove}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

export function BlocksEditor({
  lessonId,
  blocks,
}: {
  lessonId: string;
  blocks: LessonBlock[];
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const orderedIds = blocks.map((b) => b.id);

  return (
    <div className="space-y-3">
      {blocks.map((block, i) =>
        editingId === block.id ? (
          <BlockForm
            key={block.id}
            lessonId={lessonId}
            block={block}
            onDone={() => setEditingId(null)}
          />
        ) : (
          <Row
            key={block.id}
            block={block}
            index={i}
            orderedIds={orderedIds}
            onEdit={() => setEditingId(block.id)}
          />
        ),
      )}
      {adding ? (
        <BlockForm lessonId={lessonId} onDone={() => setAdding(false)} />
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
          <Plus className="h-3.5 w-3.5" /> Add block
        </Button>
      )}
    </div>
  );
}
