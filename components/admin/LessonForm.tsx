'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { parseYouTubeId } from '@/lib/youtube';
import type { Lesson } from '@/lib/supabase/types';

export function LessonForm({
  unitId,
  sectorSlug,
  lesson,
  onDone,
}: {
  unitId: string;
  sectorSlug: string;
  lesson?: Lesson;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlWillChange = (url: string) =>
    lesson ? parseYouTubeId(url) !== lesson.youtube_id : false;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setSaved(false);

    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get('title'),
      description: form.get('description'),
      youtubeUrl: form.get('youtubeUrl'),
    };
    setRebuilding(urlWillChange(String(payload.youtubeUrl ?? '')));
    setPending(true);
    try {
      const res = await fetch(
        lesson ? `/api/admin/lessons/${lesson.id}` : '/api/admin/lessons',
        {
          method: lesson ? 'PATCH' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(lesson ? payload : { ...payload, unitId }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
        return;
      }
      if (lesson) {
        setSaved(true);
        router.refresh();
      } else {
        router.push(`/learn/${sectorSlug}/${data.lesson.id}/edit`);
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setPending(false);
    }
  }

  const formKey = lesson?.id ?? 'new';
  const pendingLabel = lesson
    ? rebuilding
      ? 'Saving and rebuilding the quiz…'
      : 'Saving…'
    : 'Saving and building the quiz…';

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-white/10 bg-card p-5"
    >
      <Field label="Title" htmlFor={`${formKey}-title`}>
        <Input id={`${formKey}-title`} name="title" required maxLength={160} defaultValue={lesson?.title} />
      </Field>
      <Field label="Description" htmlFor={`${formKey}-desc`}>
        <Textarea id={`${formKey}-desc`} name="description" rows={3} maxLength={4000} defaultValue={lesson?.description} />
      </Field>
      <Field
        label="YouTube URL"
        htmlFor={`${formKey}-url`}
        help="Paste a youtube.com/watch, youtu.be or embed link."
      >
        <Input
          id={`${formKey}-url`}
          name="youtubeUrl"
          type="url"
          required
          maxLength={500}
          defaultValue={lesson?.youtube_url}
          placeholder="https://www.youtube.com/watch?v=…"
        />
      </Field>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {saved ? <p className="text-sm text-emerald-300">Saved.</p> : null}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? pendingLabel : 'Save'}
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
