'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { cn } from '@/lib/cn';
import type { QuizQuestion } from '@/lib/supabase/types';

const LETTERS = ['A', 'B', 'C', 'D'];

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const answered = answers.filter((a) => a !== null).length;
  const score = questions.reduce(
    (n, q, i) => n + (answers[i] === q.answer_index ? 1 : 0),
    0,
  );

  function pick(questionIndex: number, choiceIndex: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === questionIndex ? choiceIndex : a)));
  }

  function retake() {
    setAnswers(questions.map(() => null));
    setSubmitted(false);
    rootRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const remark =
    score === questions.length
      ? 'Perfect score.'
      : score === questions.length - 1
        ? 'Nice work.'
        : score === questions.length - 2
          ? 'Good effort.'
          : 'Watch the video again and retake the quiz.';

  return (
    <div ref={rootRef} className="scroll-mt-32 rounded-2xl border border-sky-400/20 bg-card p-6 md:p-8">
      <Tag variant="emerald">Quiz</Tag>
      <h2 className="mt-4 text-2xl font-semibold">Check what you learned.</h2>
      <p className="mt-2 text-sm text-muted">
        {questions.length} questions from this video. Pick one answer each.
      </p>

      <div className="mt-8 space-y-8">
        {questions.map((question, i) => {
          const correct = answers[i] === question.answer_index;
          return (
            <fieldset key={i}>
              <legend className="text-base font-medium leading-7">
                {i + 1}. {question.question}
              </legend>
              <div className="mt-4 grid gap-2">
                {question.choices.map((choice, j) => {
                  const selected = answers[i] === j;
                  const isAnswer = j === question.answer_index;
                  return (
                    <label
                      key={j}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors',
                        submitted
                          ? isAnswer
                            ? 'border-emerald-400/50 bg-emerald-400/10'
                            : selected
                              ? 'border-rose-400/40 bg-rose-400/10'
                              : 'border-white/10 opacity-60'
                          : selected
                            ? 'border-accent/50 bg-sky-400/10'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/25',
                      )}
                    >
                      <input
                        type="radio"
                        name={`q-${i}`}
                        className="sr-only"
                        checked={selected}
                        disabled={submitted}
                        onChange={() => pick(i, j)}
                      />
                      <span
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                          submitted && isAnswer
                            ? 'border-emerald-400/50 text-emerald-200'
                            : selected
                              ? 'border-accent/60 text-sky-200'
                              : 'border-white/15 text-muted',
                        )}
                      >
                        {LETTERS[j] ?? j + 1}
                      </span>
                      <span className="leading-6">{choice}</span>
                    </label>
                  );
                })}
              </div>
              {submitted ? (
                <p className="mt-3 text-sm text-muted">
                  <span className="font-medium text-white/90">
                    {correct ? 'Correct.' : 'Not quite.'}
                  </span>{' '}
                  {question.explanation}
                </p>
              ) : null}
            </fieldset>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
        {submitted ? (
          <>
            <p className="text-lg font-semibold">
              {score} / {questions.length} correct{' '}
              <span className="ml-2 text-sm font-normal text-muted">{remark}</span>
            </p>
            <Button variant="secondary" onClick={retake}>
              Retake
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">
              {answered} of {questions.length} answered
            </p>
            <Button disabled={answered < questions.length} onClick={() => setSubmitted(true)}>
              Check answers
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
