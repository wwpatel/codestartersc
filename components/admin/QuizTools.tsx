'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import type { Quiz } from '@/lib/supabase/types';

const LETTERS = ['A', 'B', 'C', 'D'];

export function QuizTools({ lessonId, quiz }: { lessonId: string; quiz: Quiz | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function regenerate() {
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/quiz`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
        return;
      }
      router.refresh();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        {quiz?.status === 'ready' ? (
          <Tag variant="emerald">Ready</Tag>
        ) : quiz?.status === 'no_captions' ? (
          <Tag variant="amber">No captions</Tag>
        ) : quiz?.status === 'failed' ? (
          <Tag variant="amber">Failed</Tag>
        ) : (
          <Tag variant="neutral">Not generated</Tag>
        )}
      </div>

      <p className="mt-3 text-sm text-muted">
        {!quiz
          ? 'Save the lesson to build a quiz from the video transcript.'
          : quiz.status === 'ready'
            ? `Students see this quiz when the video ends. Built ${new Date(quiz.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`
            : quiz.status === 'no_captions'
              ? 'This video has no captions, so a quiz could not be built. Students see no quiz for this lesson. Use a video with captions or try again later.'
              : `Quiz generation failed: ${quiz.error}`}
      </p>

      {quiz?.status === 'ready' ? (
        <ol className="mt-6 space-y-5">
          {quiz.questions.map((q, i) => (
            <li key={i}>
              <p className="text-sm font-medium">
                {i + 1}. {q.question}
              </p>
              <ul className="mt-2 space-y-1">
                {q.choices.map((choice, j) => (
                  <li
                    key={j}
                    className={
                      j === q.answer_index
                        ? 'flex items-center gap-2 text-sm text-emerald-200'
                        : 'flex items-center gap-2 text-sm text-muted'
                    }
                  >
                    {j === q.answer_index ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span className="w-3.5 text-center text-[10px]">{LETTERS[j]}</span>
                    )}
                    {choice}
                  </li>
                ))}
              </ul>
              {q.explanation ? (
                <p className="mt-1 text-xs text-muted">{q.explanation}</p>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      <div className="mt-6">
        <Button size="sm" onClick={regenerate} disabled={pending}>
          <RefreshCw className="h-3.5 w-3.5" />
          {pending ? 'Building the quiz… this can take a minute.' : 'Regenerate quiz'}
        </Button>
      </div>
    </div>
  );
}
