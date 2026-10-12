import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';
import { getLessonDetail, getSectorBySlug } from '@/lib/data/curriculum';
import { requireAdmin } from '@/lib/auth/session';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { LessonForm } from '@/components/admin/LessonForm';
import { BlocksEditor } from '@/components/admin/BlocksEditor';
import { QuizTools } from '@/components/admin/QuizTools';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Edit lesson · CodeStarters Curriculum' };

export default async function EditLessonPage({
  params,
}: {
  params: { sector: string; lessonId: string };
}) {
  await requireAdmin();
  const [sector, lesson] = await Promise.all([
    getSectorBySlug(params.sector),
    getLessonDetail(params.lessonId),
  ]);
  if (!sector || !lesson || lesson.unit.sector_id !== sector.id) notFound();

  const unitIndex = sector.units.findIndex((u) => u.id === lesson.unit_id);

  return (
    <Container>
      <div className="max-w-3xl">
        <Link
          href={`/learn/${sector.slug}/${lesson.id}`}
          className="flex items-center gap-1 text-xs uppercase tracking-[3px] text-muted hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to lesson
        </Link>
        <SectionHeading
          as="h1"
          className="mt-6"
          label={`${sector.name} • Unit ${unitIndex + 1}`}
          title="Edit lesson."
        />

        <div className="mt-10 space-y-10">
          <Card>
            <p className="text-xs uppercase tracking-[3px] text-muted">Lesson</p>
            <h2 className="mt-2 text-lg font-semibold">Details</h2>
            <div className="mt-5">
              <LessonForm unitId={lesson.unit_id} sectorSlug={sector.slug} lesson={lesson} />
            </div>
          </Card>

          <Card>
            <p className="text-xs uppercase tracking-[3px] text-muted">Blocks</p>
            <h2 className="mt-2 text-lg font-semibold">Notes, code and links</h2>
            <div className="mt-5">
              <BlocksEditor lessonId={lesson.id} blocks={lesson.blocks} />
            </div>
          </Card>

          <Card>
            <p className="text-xs uppercase tracking-[3px] text-muted">Quiz</p>
            <h2 className="mt-2 text-lg font-semibold">Generated quiz</h2>
            <div className="mt-5">
              <QuizTools lessonId={lesson.id} quiz={lesson.quiz} />
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
