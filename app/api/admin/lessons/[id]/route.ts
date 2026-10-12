import { withAdmin } from '@/lib/auth/with-admin';
import { lessonUpdateSchema } from '@/lib/validation/content';
import { firstIssue } from '@/lib/validation/shared';
import { jsonError, jsonOk, readJson, handleRouteError } from '@/lib/http';
import { parseYouTubeId } from '@/lib/youtube';
import { generateAndStoreQuiz } from '@/lib/quiz/generate';

export const runtime = 'nodejs';
export const maxDuration = 60;

export const PATCH = withAdmin(async (request, { params }, { supabase }) => {
  try {
    const body = await readJson(request);
    if (body === null) return jsonError(400, 'Invalid request body.');
    const parsed = lessonUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, firstIssue(parsed.error));

    const { data: existing, error: loadError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();
    if (loadError) throw loadError;
    if (!existing) return jsonError(404, 'Lesson not found.');

    const { data: existingQuiz } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', params.id)
      .maybeSingle();

    const { title, description, youtubeUrl } = parsed.data;
    const youtube_id = parseYouTubeId(youtubeUrl)!;

    const { data: lesson, error } = await supabase
      .from('lessons')
      .update({ title, description, youtube_url: youtubeUrl, youtube_id })
      .eq('id', params.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!lesson) return jsonError(404, 'Lesson not found.');

    const regenerated = youtube_id !== existing.youtube_id || !existingQuiz;
    const quiz = regenerated
      ? await generateAndStoreQuiz(supabase, lesson.id, lesson.youtube_id)
      : existingQuiz;

    return jsonOk({ lesson, quiz, regenerated });
  } catch (err) {
    return handleRouteError(err);
  }
});

export const DELETE = withAdmin(async (_request, { params }, { supabase }) => {
  try {
    const { error } = await supabase.from('lessons').delete().eq('id', params.id);
    if (error) throw error;
    return jsonOk({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
});
