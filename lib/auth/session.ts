import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { Role } from '@/lib/supabase/types';

export interface SessionProfile {
  id: string;
  username: string;
  role: Role;
}

export interface Session {
  user: User;
  profile: SessionProfile;
}

export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, role')
    .eq('id', user.id)
    .single();
  if (!profile) return null;

  return { user, profile: profile as SessionProfile };
});

export const getSessionForApi = getSession;

export async function requireUser(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.profile.role !== 'admin') redirect('/learn');
  return session;
}
