import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getSectorsWithCounts } from '@/lib/data/curriculum';
import { sectorMeta } from '@/lib/sectors';
import { pluralize } from '@/lib/format';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';

export const dynamic = 'force-dynamic';

export default async function LearnPage() {
  const sectors = await getSectorsWithCounts();

  return (
    <Container>
      <SectionHeading
        as="h1"
        label="Curriculum"
        title="Three programs."
        description="Pick a program and work through it lesson by lesson."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {sectors.map((sector) => {
          const meta = sectorMeta(sector.slug);
          const Icon = meta.icon;
          return (
            <Link
              key={sector.id}
              href={`/learn/${sector.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-sky-400/20 bg-card p-6 transition-colors hover:border-sky-400/35"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-foreground" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">{sector.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{meta.blurb}</p>
              <p className="mt-auto pt-6 text-xs uppercase tracking-[0.16em] text-muted">
                {pluralize(sector.unitCount, 'unit')} • {pluralize(sector.lessonCount, 'lesson')}
              </p>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
