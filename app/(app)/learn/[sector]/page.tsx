import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSectorBySlug } from '@/lib/data/curriculum';
import { getSession } from '@/lib/auth/session';
import { sectorMeta } from '@/lib/sectors';
import { pluralize } from '@/lib/format';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EmptyState } from '@/components/ui/EmptyState';
import { LessonCard } from '@/components/learn/LessonCard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { sector: string };
}): Promise<Metadata> {
  const sector = await getSectorBySlug(params.sector);
  return { title: sector ? `${sector.name} · CodeStarters Curriculum` : 'CodeStarters Curriculum' };
}

export default async function SectorPage({
  params,
}: {
  params: { sector: string };
}) {
  const [sector, session] = await Promise.all([getSectorBySlug(params.sector), getSession()]);
  if (!sector) notFound();

  const isAdmin = session?.profile.role === 'admin';
  const meta = sectorMeta(sector.slug);
  const lessonCount = sector.units.reduce((n, u) => n + u.lessons.length, 0);

  return (
    <Container>
      <div className="flex items-end justify-between gap-6">
        <SectionHeading
          as="h1"
          label="Program"
          title={`${sector.name}.`}
          description={meta.blurb}
        />
        <p className="hidden shrink-0 text-xs uppercase tracking-[0.16em] text-muted md:block">
          {pluralize(sector.units.length, 'unit')} • {pluralize(lessonCount, 'lesson')}
        </p>
      </div>

      {sector.units.length === 0 ? (
        <EmptyState
          className="mt-12"
          title="No units yet."
          text={
            isAdmin
              ? 'Add the first unit to start building this program.'
              : 'Lessons for this program are on the way.'
          }
        />
      ) : (
        <div className="mt-12 space-y-14">
          {sector.units.map((unit, i) => (
            <section key={unit.id}>
              <div className="flex items-end justify-between gap-6 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[3px] text-muted">Unit {i + 1}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{unit.title}</h2>
                  {unit.description ? (
                    <p className="mt-1 max-w-2xl text-sm text-muted">{unit.description}</p>
                  ) : null}
                </div>
                <p className="shrink-0 text-xs uppercase tracking-[0.16em] text-muted">
                  {pluralize(unit.lessons.length, 'lesson')}
                </p>
              </div>
              {unit.lessons.length === 0 ? (
                <EmptyState
                  className="mt-6"
                  title={isAdmin ? 'No lessons yet.' : 'No lessons in this unit yet.'}
                  text={isAdmin ? 'Add a lesson to this unit.' : 'Check back soon.'}
                />
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {unit.lessons.map((lesson, j) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      index={j}
                      href={`/learn/${sector.slug}/${lesson.id}`}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </Container>
  );
}
