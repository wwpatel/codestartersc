import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type {
  BlockType,
  LessonBlock,
  LessonDetail,
  Quiz,
  QuizStatus,
  Sector,
  SectorLesson,
  SectorUnit,
  SectorWithCounts,
  SectorWithUnits,
  Unit,
} from '@/lib/supabase/types';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function bySortOrder<T extends { sort_order: number }>(a: T, b: T) {
  return a.sort_order - b.sort_order;
}

// PostgREST returns one-to-one embeds as an object or a one-element array.
function one<T>(x: T | T[] | null | undefined): T | null {
  if (!x) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}

interface UnitCountRow {
  id: string;
  lessons: { id: string }[] | null;
}

export const getSectorsWithCounts = cache(async (): Promise<SectorWithCounts[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('sectors')
    .select('*, units(id, lessons(id))')
    .order('sort_order');

  return ((data ?? []) as (Sector & { units: UnitCountRow[] | null })[]).map((sector) => {
    const units = sector.units ?? [];
    return {
      ...sector,
      unitCount: units.length,
      lessonCount: units.reduce((n, u) => n + (u.lessons?.length ?? 0), 0),
    };
  });
});

interface RawSectorLesson {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  unit_id: string;
  quizzes: { status: QuizStatus } | { status: QuizStatus }[] | null;
  lesson_blocks: { type: BlockType }[] | null;
}

export const getSectorBySlug = cache(
  async (slug: string): Promise<SectorWithUnits | null> => {
    const supabase = createClient();
    const { data } = await supabase
      .from('sectors')
      .select(
        '*, units(*, lessons(id, title, description, sort_order, unit_id, quizzes(status), lesson_blocks(type)))',
      )
      .eq('slug', slug)
      .maybeSingle();
    if (!data) return null;

    const row = data as Sector & {
      units: (Unit & { lessons: RawSectorLesson[] | null })[] | null;
    };

    const units: SectorUnit[] = (row.units ?? [])
      .map((unit) => ({
        ...unit,
        lessons: (unit.lessons ?? [])
          .map((lesson) => {
            const quiz = one(lesson.quizzes);
            return {
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              sort_order: lesson.sort_order,
              unit_id: lesson.unit_id,
              quizStatus: quiz?.status ?? null,
              blockTypes: Array.from(
                new Set((lesson.lesson_blocks ?? []).map((b) => b.type)),
              ),
            } as SectorLesson;
          })
          .sort(bySortOrder),
      }))
      .sort(bySortOrder);

    return { ...row, units };
  },
);

interface RawUnitJoin extends Unit {
  sector: Sector | Sector[] | null;
}

interface RawLessonDetail {
  unit: RawUnitJoin | RawUnitJoin[] | null;
  lesson_blocks: LessonBlock[] | null;
  quizzes: Quiz | Quiz[] | null;
}

export const getLessonDetail = cache(
  async (lessonId: string): Promise<LessonDetail | null> => {
    if (!UUID_RE.test(lessonId)) return null;
    const supabase = createClient();
    const { data } = await supabase
      .from('lessons')
      .select('*, unit:units(*, sector:sectors(*)), lesson_blocks(*), quizzes(*)')
      .eq('id', lessonId)
      .maybeSingle();
    if (!data) return null;

    const row = data as unknown as Omit<LessonDetail, 'unit' | 'blocks' | 'quiz'> &
      RawLessonDetail;
    const unit = one(row.unit);
    if (!unit) return null;
    const sector = one(unit.sector);
    if (!sector) return null;

    return {
      ...row,
      unit: { ...unit, sector },
      blocks: (row.lesson_blocks ?? []).sort(bySortOrder),
      quiz: one(row.quizzes),
    };
  },
);
