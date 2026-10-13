'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Textarea } from '@/components/ui/Textarea';
import type { Quiz } from '@/lib/supabase/types';

const LETTERS = ['A', 'B', 'C', 'D'];

export function QuizTools({ lessonId, quiz }: { lessonId: string; quiz: Quiz | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');

  async function regenerate(pasted?: string) {
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/quiz`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(pasted ? { transcript: pasted } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
        return;
      }
      setTranscript('');
      router.refresh();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      {quiz?.status === 'ready' ? <Tag variant="emerald">Ready</Tag> : null}

      <p className={quiz?.status === 'ready' ? 'mt-3 text-sm text-muted' : 'text-sm text-muted'}>
        {!quiz
          ? 'Save the lesson to build a quiz from the video transcript.'
          : quiz.status === 'ready'
            ? `Students see this quiz when the video ends. Built ${new Date(quiz.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`
            : quiz.status === 'no_captions'
              ? 'YouTube did not share captions for this video with the server. Paste the transcript below to build the quiz.'
              : 'The quiz could not be built. Click Regenerate quiz, or paste the transcript below.'}
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

      {quiz?.status !== 'ready' ? (
        <div className="mt-6">
          <label htmlFor="quiz-transcript" className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Transcript
          </label>
          <Textarea
            id="quiz-transcript"
            rows={6}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="On YouTube, open the video description, click Show transcript, then copy and paste it here."
          />
          <div className="mt-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => regenerate(transcript)}
              disabled={pending || transcript.trim().length === 0}
            >
              Build quiz from transcript
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      <div className="mt-6">
        <Button size="sm" onClick={() => regenerate()} disabled={pending}>
          <RefreshCw className="h-3.5 w-3.5" />
          {pending ? 'Building the quiz… this can take a minute.' : 'Regenerate quiz'}
        </Button>
      </div>
    </div>
  );
}
