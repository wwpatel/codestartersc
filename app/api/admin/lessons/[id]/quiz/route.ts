import { withAdmin } from '@/lib/auth/with-admin';
import { z } from 'zod';
import { jsonError, jsonOk, handleRouteError, readJson } from '@/lib/http';
import { generateAndStoreQuiz } from '@/lib/quiz/generate';
import { firstIssue } from '@/lib/validation/shared';

export const runtime = 'nodejs';
export const maxDuration = 60;

const bodySchema = z
  .object({
    transcript: z
      .string()
      .trim()
      .min(200, 'Paste the full transcript (at least 200 characters).')
      .max(60000, 'That transcript is too long (60,000 characters max).')
      .optional(),
  })
  .nullable();

export const POST = withAdmin(async (request, { params }, { supabase }) => {
  try {
    const parsed = bodySchema.safeParse(await readJson(request));
    if (!parsed.success) return jsonError(400, firstIssue(parsed.error));
    const transcript = parsed.data?.transcript;

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();
    if (error) throw error;
    if (!lesson) return jsonError(404, 'Lesson not found.');

    const quiz = await generateAndStoreQuiz(supabase, lesson.id, lesson.youtube_id, transcript);
    return jsonOk({ quiz });
  } catch (err) {
    return handleRouteError(err);
  }
});
