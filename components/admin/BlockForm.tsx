'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { CODE_LANGUAGES } from '@/lib/code-languages';
import type { BlockType, LessonBlock } from '@/lib/supabase/types';

export function BlockForm({
  lessonId,
  block,
  onDone,
}: {
  lessonId: string;
  block?: LessonBlock;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [type, setType] = useState<BlockType>(block?.type ?? 'note');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formKey = block?.id ?? 'new';

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);

    const form = new FormData(event.currentTarget);
    const base = {
      type,
      title: String(form.get('title') ?? '').trim() || undefined,
    };
    let payload: Record<string, unknown>;
    if (type === 'note') {
      payload = { ...base, body: form.get('body') };
    } else if (type === 'code') {
      payload = { ...base, language: form.get('language'), body: form.get('body') };
    } else {
      payload = { ...base, url: form.get('url') };
    }
    if (!block) payload.lessonId = lessonId;

    setPending(true);
    try {
      const res = await fetch(
        block ? `/api/admin/blocks/${block.id}` : '/api/admin/blocks',
        {
          method: block ? 'PATCH' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
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
      {!block ? (
        <Field label="Type" htmlFor={`${formKey}-type`}>
          <Select
            id={`${formKey}-type`}
            value={type}
            onChange={(e) => setType(e.target.value as BlockType)}
          >
            <option value="note">Note</option>
            <option value="code">Code</option>
            <option value="link">Link</option>
          </Select>
        </Field>
      ) : null}

      <Field
        label={type === 'link' ? 'Label' : 'Title (optional)'}
        htmlFor={`${formKey}-title`}
      >
        <Input
          id={`${formKey}-title`}
          name="title"
          maxLength={160}
          required={type === 'link'}
          defaultValue={block?.title ?? ''}
        />
      </Field>

      {type === 'code' ? (
        <Field label="Language" htmlFor={`${formKey}-lang`}>
          <Select
            id={`${formKey}-lang`}
            name="language"
            defaultValue={block?.language ?? 'python'}
          >
            {CODE_LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      {type !== 'link' ? (
        <Field label={type === 'code' ? 'Code' : 'Body'} htmlFor={`${formKey}-body`}>
          <Textarea
            id={`${formKey}-body`}
            name="body"
            required
            rows={type === 'code' ? 10 : 4}
            spellCheck={false}
            className={type === 'code' ? 'font-mono text-xs' : undefined}
            defaultValue={block?.body ?? ''}
          />
        </Field>
      ) : (
        <Field label="URL" htmlFor={`${formKey}-url`}>
          <Input
            id={`${formKey}-url`}
            name="url"
            type="url"
            required
            maxLength={2000}
            placeholder="https://"
            defaultValue={block?.url ?? ''}
          />
        </Field>
      )}

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
