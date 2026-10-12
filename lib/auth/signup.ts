import { signupSchema, firstIssue } from '@/lib/validation/auth';
import { usernameToEmail } from '@/lib/auth/username';
import { verifyAdminCode } from '@/lib/auth/admin-code';
import { rateLimit } from '@/lib/auth/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export interface SignupResult {
  status: number;
  body: { ok?: boolean; error?: string };
}

export interface SignupDeps {
  createAdminClient: typeof createAdminClient;
  createClient: typeof createClient;
  verifyAdminCode: typeof verifyAdminCode;
  rateLimit: typeof rateLimit;
}

const defaultDeps: SignupDeps = {
  createAdminClient,
  createClient,
  verifyAdminCode,
  rateLimit,
};

function isDuplicateError(error: { code?: string; message?: string }) {
  return error.code === 'email_exists' || (error.message ?? '').includes('already');
}

export async function handleSignup(
  body: unknown,
  ip: string,
  deps: SignupDeps = defaultDeps,
): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { error: firstIssue(parsed.error) } };
  }
  const { username, password, role, adminCode } = parsed.data;

  if (role === 'admin') {
    const limited = deps.rateLimit(`admin-signup:${ip}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) {
      return {
        status: 429,
        body: { error: 'Too many attempts. Try again in a few minutes.' },
      };
    }
    if (!deps.verifyAdminCode(adminCode)) {
      return { status: 403, body: { error: 'That admin ID is not right.' } };
    }
  }

  const admin = deps.createAdminClient();
  const email = usernameToEmail(username);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (createError || !created.user) {
    if (createError && isDuplicateError(createError)) {
      return { status: 409, body: { error: 'That username is taken.' } };
    }
    return { status: 500, body: { error: 'Could not create the account.' } };
  }

  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: created.user.id, username, role });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    if (profileError.code === '23505') {
      return { status: 409, body: { error: 'That username is taken.' } };
    }
    return { status: 500, body: { error: 'Could not create the account.' } };
  }

  const supabase = deps.createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return { status: 500, body: { error: 'Account created, but sign in failed. Try signing in.' } };
  }

  return { status: 200, body: { ok: true } };
}
