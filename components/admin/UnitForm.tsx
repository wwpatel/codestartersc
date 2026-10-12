'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { Unit } from '@/lib/supabase/types';

export function UnitForm({
  sectorId,
  unit,
  onDone,
}: {
  sectorId: string;
  unit?: Unit;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get('title'),
      description: form.get('description'),
    };

    setPending(true);
    try {
      const res = await fetch(unit ? `/api/admin/units/${unit.id}` : '/api/admin/units', {
        method: unit ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(unit ? payload : { ...payload, sectorId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
        return;
      }
      router.refresh();
      onDone?.();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-white/10 bg-card p-5"
    >
      <Field label="Title" htmlFor={unit ? `unit-title-${unit.id}` : 'unit-title-new'}>
        <Input
          id={unit ? `unit-title-${unit.id}` : 'unit-title-new'}
          name="title"
          required
          maxLength={120}
          defaultValue={unit?.title}
        />
      </Field>
      <Field label="Description" htmlFor={unit ? `unit-desc-${unit.id}` : 'unit-desc-new'}>
        <Textarea
          id={unit ? `unit-desc-${unit.id}` : 'unit-desc-new'}
          name="description"
          rows={3}
          maxLength={1000}
          defaultValue={unit?.description}
        />
      </Field>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Saving…' : 'Save'}
        </Button>
        {onDone ? (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
