import { withAdmin } from '@/lib/auth/with-admin';
import { jsonError, jsonOk, handleRouteError } from '@/lib/http';
import { generateAndStoreQuiz } from '@/lib/quiz/generate';

export const runtime = 'nodejs';
export const maxDuration = 60;

export const POST = withAdmin(async (_request, { params }, { supabase }) => {
  try {
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();
    if (error) throw error;
    if (!lesson) return jsonError(404, 'Lesson not found.');

    const quiz = await generateAndStoreQuiz(supabase, lesson.id, lesson.youtube_id);
    return jsonOk({ quiz });
  } catch (err) {
    return handleRouteError(err);
  }
});
