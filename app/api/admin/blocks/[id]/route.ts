import { withAdmin } from '@/lib/auth/with-admin';
import { blockUpdateSchema } from '@/lib/validation/content';
import { firstIssue } from '@/lib/validation/shared';
import { jsonError, jsonOk, readJson, handleRouteError } from '@/lib/http';
import { z } from 'zod';

export const runtime = 'nodejs';

function blockRow(input: z.infer<typeof blockUpdateSchema>) {
  if (input.type === 'note') {
    return { type: 'note', title: input.title ?? null, body: input.body, language: null, url: null };
  }
  if (input.type === 'code') {
    return { type: 'code', title: input.title ?? null, body: input.body, language: input.language, url: null };
  }
  return { type: 'link', title: input.title, body: null, language: null, url: input.url };
}

export const PATCH = withAdmin(async (request, { params }, { supabase }) => {
  try {
    const body = await readJson(request);
    if (body === null) return jsonError(400, 'Invalid request body.');
    const parsed = blockUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, firstIssue(parsed.error));

    const { data: block, error } = await supabase
      .from('lesson_blocks')
      .update(blockRow(parsed.data))
      .eq('id', params.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!block) return jsonError(404, 'Block not found.');
    return jsonOk({ block });
  } catch (err) {
    return handleRouteError(err);
  }
});

export const DELETE = withAdmin(async (_request, { params }, { supabase }) => {
  try {
    const { error } = await supabase.from('lesson_blocks').delete().eq('id', params.id);
    if (error) throw error;
    return jsonOk({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
});
