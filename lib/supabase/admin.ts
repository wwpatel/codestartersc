import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getPublicSupabaseEnv, getServiceRoleKey } from '@/lib/env';

export function createAdminClient() {
  const { url } = getPublicSupabaseEnv();
  return createSupabaseClient(url, getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
