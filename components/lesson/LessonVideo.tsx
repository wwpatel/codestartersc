'use client';

import { useEffect, useRef, useState } from 'react';
import { YouTubePlayer } from './YouTubePlayer';
import { Quiz } from './Quiz';
import type { QuizQuestion } from '@/lib/supabase/types';

export function LessonVideo({
  youtubeId,
  title,
  quiz,
}: {
  youtubeId: string;
  title: string;
  quiz: QuizQuestion[] | null;
}) {
  const [showQuiz, setShowQuiz] = useState(false);
  const quizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showQuiz) {
      quizRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showQuiz]);

  return (
    <div>
      <YouTubePlayer videoId={youtubeId} title={title} onEnded={() => setShowQuiz(true)} />
      {quiz && !showQuiz ? (
        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>Watch the video to unlock the quiz.</span>
          <button
            type="button"
            onClick={() => setShowQuiz(true)}
            className="text-xs font-semibold uppercase tracking-[0.16em] text-accent hover:text-sky-300"
          >
            Already watched? Take the quiz
          </button>
        </div>
      ) : null}
      {quiz && showQuiz ? (
        <div ref={quizRef} className="mt-6">
          <Quiz questions={quiz} />
        </div>
      ) : null}
    </div>
  );
}
