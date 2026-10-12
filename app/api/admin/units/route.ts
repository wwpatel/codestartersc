import { withAdmin } from '@/lib/auth/with-admin';
import { unitCreateSchema } from '@/lib/validation/content';
import { firstIssue } from '@/lib/validation/shared';
import { jsonError, jsonOk, readJson, handleRouteError } from '@/lib/http';
import { nextSortOrder } from '@/lib/data/admin';

export const runtime = 'nodejs';

export const POST = withAdmin(async (request, _ctx, { supabase }) => {
  try {
    const body = await readJson(request);
    if (body === null) return jsonError(400, 'Invalid request body.');
    const parsed = unitCreateSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, firstIssue(parsed.error));

    const { sectorId, title, description } = parsed.data;
    const sort_order = await nextSortOrder(supabase, 'units', 'sector_id', sectorId);
    const { data: unit, error } = await supabase
      .from('units')
      .insert({ sector_id: sectorId, title, description, sort_order })
      .select()
      .single();
    if (error) throw error;
    return jsonOk({ unit });
  } catch (err) {
    return handleRouteError(err);
  }
});
