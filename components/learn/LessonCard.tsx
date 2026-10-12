import Link from 'next/link';
import type { ReactNode } from 'react';
import { Tag } from '@/components/ui/Tag';
import type { SectorLesson } from '@/lib/supabase/types';

export function LessonCard({
  lesson,
  index,
  href,
  children,
}: {
  lesson: SectorLesson;
  index: number;
  href: string;
  children?: ReactNode;
}) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-white/10 bg-card p-5 transition-colors hover:border-sky-400/35">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Lesson {index + 1}</p>
      <h3 className="mt-2 text-base font-semibold">
        <Link href={href} className="after:absolute after:inset-0">
          {lesson.title}
        </Link>
      </h3>
      {lesson.description ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{lesson.description}</p>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Tag variant="sky">Video</Tag>
        {lesson.quizStatus === 'ready' ? <Tag variant="emerald">Quiz</Tag> : null}
        {lesson.blockTypes.includes('code') ? <Tag variant="neutral">Code</Tag> : null}
      </div>
      {children ? <div className="relative z-10 mt-4 flex gap-2">{children}</div> : null}
    </article>
  );
}
