import { withAdmin } from '@/lib/auth/with-admin';
import { reorderSchema } from '@/lib/validation/content';
import { firstIssue } from '@/lib/validation/shared';
import { jsonError, jsonOk, readJson, handleRouteError } from '@/lib/http';
import { reorderRows } from '@/lib/data/admin';

export const runtime = 'nodejs';

export const POST = withAdmin(async (request, _ctx, { supabase }) => {
  try {
    const body = await readJson(request);
    if (body === null) return jsonError(400, 'Invalid request body.');
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, firstIssue(parsed.error));

    await reorderRows(supabase, 'units', 'sector_id', parsed.data.parentId, parsed.data.ids);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
});
