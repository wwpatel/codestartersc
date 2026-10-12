import { loginSchema, firstIssue } from '@/lib/validation/auth';
import { usernameToEmail } from '@/lib/auth/username';
import { createClient } from '@/lib/supabase/server';
import { jsonError, jsonOk, readJson } from '@/lib/http';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, firstIssue(parsed.error));
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(parsed.data.username),
    password: parsed.data.password,
  });

  if (error) {
    return jsonError(401, 'Wrong username or password.');
  }
  return jsonOk({ ok: true });
}
