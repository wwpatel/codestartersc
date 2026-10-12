import { withAdmin } from '@/lib/auth/with-admin';
import { blockCreateSchema } from '@/lib/validation/content';
import { firstIssue } from '@/lib/validation/shared';
import { jsonError, jsonOk, readJson, handleRouteError } from '@/lib/http';
import { nextSortOrder } from '@/lib/data/admin';
import type { BlockCreateInput } from '@/lib/validation/content';

export const runtime = 'nodejs';

function blockRow(input: BlockCreateInput) {
  if (input.type === 'note') {
    return { type: 'note', title: input.title ?? null, body: input.body, language: null, url: null };
  }
  if (input.type === 'code') {
    return { type: 'code', title: input.title ?? null, body: input.body, language: input.language, url: null };
  }
  return { type: 'link', title: input.title, body: null, language: null, url: input.url };
}

export const POST = withAdmin(async (request, _ctx, { supabase }) => {
  try {
    const body = await readJson(request);
    if (body === null) return jsonError(400, 'Invalid request body.');
    const parsed = blockCreateSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, firstIssue(parsed.error));

    const { lessonId } = parsed.data;
    const sort_order = await nextSortOrder(supabase, 'lesson_blocks', 'lesson_id', lessonId);
    const { data: block, error } = await supabase
      .from('lesson_blocks')
      .insert({ ...blockRow(parsed.data), lesson_id: lessonId, sort_order })
      .select()
      .single();
    if (error) throw error;
    return jsonOk({ block });
  } catch (err) {
    return handleRouteError(err);
  }
});
