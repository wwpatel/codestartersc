import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionForApi, type Session } from '@/lib/auth/session';
import { jsonError } from '@/lib/http';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface AdminContext {
  supabase: SupabaseClient;
  session: Session;
}

export type AdminHandler = (
  request: Request,
  ctx: { params: Record<string, string> },
  admin: AdminContext,
) => Promise<NextResponse>;

export function withAdmin(handler: AdminHandler) {
  return async (request: Request, ctx: { params: Record<string, string> }) => {
    const session = await getSessionForApi();
    if (!session) return jsonError(401, 'Sign in first.');
    if (session.profile.role !== 'admin') return jsonError(403, 'Admins only.');
    const supabase = createClient();
    return handler(request, ctx, { supabase, session });
  };
}
