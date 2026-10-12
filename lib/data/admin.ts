import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/http';

export async function nextSortOrder(
  supabase: SupabaseClient,
  table: string,
  parentColumn: string,
  parentId: string,
) {
  const { data, error } = await supabase
    .from(table)
    .select('sort_order')
    .eq(parentColumn, parentId)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (error) throw error;
  return (data?.[0]?.sort_order ?? -1) + 1;
}

export async function reorderRows(
  supabase: SupabaseClient,
  table: string,
  parentColumn: string,
  parentId: string,
  ids: string[],
) {
  const { data: rows, error } = await supabase
    .from(table)
    .select('id')
    .eq(parentColumn, parentId);
  if (error) throw error;

  const existing = new Set((rows ?? []).map((r: { id: string }) => r.id));
  if (existing.size !== ids.length || !ids.every((id) => existing.has(id))) {
    throw new HttpError(400, 'Reorder list does not match.');
  }

  await Promise.all(
    ids.map((id, index) =>
      supabase.from(table).update({ sort_order: index }).eq('id', id),
    ),
  );
}
