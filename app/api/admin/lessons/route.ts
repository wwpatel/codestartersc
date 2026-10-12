import { withAdmin } from '@/lib/auth/with-admin';
import { lessonCreateSchema } from '@/lib/validation/content';
import { firstIssue } from '@/lib/validation/shared';
import { jsonError, jsonOk, readJson, handleRouteError } from '@/lib/http';
import { nextSortOrder } from '@/lib/data/admin';
import { parseYouTubeId } from '@/lib/youtube';
import { generateAndStoreQuiz } from '@/lib/quiz/generate';

export const runtime = 'nodejs';
export const maxDuration = 60;

export const POST = withAdmin(async (request, _ctx, { supabase }) => {
  try {
    const body = await readJson(request);
    if (body === null) return jsonError(400, 'Invalid request body.');
    const parsed = lessonCreateSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, firstIssue(parsed.error));

    const { unitId, title, description, youtubeUrl } = parsed.data;
    const youtube_id = parseYouTubeId(youtubeUrl)!;
    const sort_order = await nextSortOrder(supabase, 'lessons', 'unit_id', unitId);

    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({ unit_id: unitId, title, description, youtube_url: youtubeUrl, youtube_id, sort_order })
      .select()
      .single();
    if (error) throw error;

    const quiz = await generateAndStoreQuiz(supabase, lesson.id, lesson.youtube_id);
    return jsonOk({ lesson, quiz });
  } catch (err) {
    return handleRouteError(err);
  }
});
