import { withAdmin } from '@/lib/auth/with-admin';
import { unitUpdateSchema } from '@/lib/validation/content';
import { firstIssue } from '@/lib/validation/shared';
import { jsonError, jsonOk, readJson, handleRouteError } from '@/lib/http';

export const runtime = 'nodejs';

export const PATCH = withAdmin(async (request, { params }, { supabase }) => {
  try {
    const body = await readJson(request);
    if (body === null) return jsonError(400, 'Invalid request body.');
    const parsed = unitUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, firstIssue(parsed.error));

    const { data: unit, error } = await supabase
      .from('units')
      .update({ title: parsed.data.title, description: parsed.data.description })
      .eq('id', params.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!unit) return jsonError(404, 'Unit not found.');
    return jsonOk({ unit });
  } catch (err) {
    return handleRouteError(err);
  }
});

export const DELETE = withAdmin(async (_request, { params }, { supabase }) => {
  try {
    const { error } = await supabase.from('units').delete().eq('id', params.id);
    if (error) throw error;
    return jsonOk({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
});
