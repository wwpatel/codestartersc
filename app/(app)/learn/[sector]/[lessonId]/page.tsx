import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getLessonDetail, getSectorBySlug } from '@/lib/data/curriculum';
import { getSession } from '@/lib/auth/session';
import { Container } from '@/components/ui/Container';
import { Tag } from '@/components/ui/Tag';
import { LessonSidebar } from '@/components/learn/LessonSidebar';
import { LessonDrawer } from '@/components/learn/LessonDrawer';
import { LessonVideo } from '@/components/lesson/LessonVideo';
import { LessonBlocks } from '@/components/lesson/LessonBlocks';
import { cn } from '@/lib/cn';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { sector: string; lessonId: string };
}): Promise<Metadata> {
  const lesson = await getLessonDetail(params.lessonId);
  return { title: lesson ? `${lesson.title} · CodeStarters Curriculum` : 'CodeStarters Curriculum' };
}

export default async function LessonPage({
  params,
}: {
  params: { sector: string; lessonId: string };
}) {
  const [sector, lesson] = await Promise.all([
    getSectorBySlug(params.sector),
    getLessonDetail(params.lessonId),
    getSession(),
  ]);
  if (!sector || !lesson || lesson.unit.sector_id !== sector.id) notFound();

  const flat = sector.units.flatMap((u) => u.lessons.map((l) => ({ unit: u, lesson: l })));
  const position = flat.findIndex((f) => f.lesson.id === lesson.id);
  const prev = position > 0 ? flat[position - 1] : null;
  const next = position < flat.length - 1 ? flat[position + 1] : null;

  const unitIndex = sector.units.findIndex((u) => u.id === lesson.unit_id);
  const lessonIndex = sector.units[unitIndex]?.lessons.findIndex((l) => l.id === lesson.id) ?? 0;

  const quiz =
    lesson.quiz?.status === 'ready' && lesson.quiz.questions.length === 5
      ? lesson.quiz.questions
      : null;

  const sidebar = <LessonSidebar sector={sector} currentLessonId={lesson.id} />;

  return (
    <Container>
      <div className="flex gap-10">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
            {sidebar}
          </div>
        </aside>
        <div className="min-w-0 max-w-3xl flex-1">
          <div className="mb-6 lg:hidden">
            <LessonDrawer>{sidebar}</LessonDrawer>
          </div>
          <p className="text-xs uppercase tracking-[3px] text-muted">
            {sector.name} • Unit {unitIndex + 1} • Lesson {lessonIndex + 1}
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-1px] md:text-4xl">{lesson.title}</h1>
          <div className="mt-4 flex gap-2">
            <Tag variant="sky">Video</Tag>
            {quiz ? <Tag variant="emerald">Quiz</Tag> : null}
            {lesson.blocks.some((b) => b.type === 'code') ? <Tag variant="neutral">Code</Tag> : null}
          </div>
          <div className="mt-8">
            <LessonVideo youtubeId={lesson.youtube_id} title={lesson.title} quiz={quiz} />
          </div>
          {lesson.description ? (
            <p className="mt-8 whitespace-pre-line text-base leading-7 text-muted">
              {lesson.description}
            </p>
          ) : null}
          <LessonBlocks blocks={lesson.blocks} />
          <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
            {prev ? (
              <Link
                href={`/learn/${sector.slug}/${prev.lesson.id}`}
                className={cn('inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted hover:text-white')}
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/learn/${sector.slug}/${next.lesson.id}`}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted hover:text-white"
              >
                Next lesson <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
