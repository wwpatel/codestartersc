import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleSignup, type SignupDeps } from '@/lib/auth/signup';
import { verifyAdminCode } from '@/lib/auth/admin-code';
import { rateLimit, resetRateLimits } from '@/lib/auth/rate-limit';

function makeDeps(overrides?: {
  createUserError?: { code?: string; message: string } | null;
  insertError?: { code?: string; message: string } | null;
  signInError?: { message: string } | null;
}) {
  const createUser = vi.fn(async () => ({
    data: { user: { id: 'user-1' } },
    error: overrides?.createUserError ?? null,
  }));
  const deleteUser = vi.fn(async () => ({ data: {}, error: null }));
  const insert = vi.fn(async () => ({ error: overrides?.insertError ?? null }));
  const from = vi.fn(() => ({ insert }));
  const signInWithPassword = vi.fn(async () => ({
    error: overrides?.signInError ?? null,
  }));

  const adminClient = {
    auth: { admin: { createUser, deleteUser } },
    from,
  };
  const serverClient = { auth: { signInWithPassword } };

  const deps: SignupDeps = {
    createAdminClient: () => adminClient as never,
    createClient: () => serverClient as never,
    verifyAdminCode,
    rateLimit,
  };

  return { deps, createUser, deleteUser, insert, from, signInWithPassword };
}

const ip = '203.0.113.1';

beforeEach(() => resetRateLimits());

describe('handleSignup', () => {
  it('rejects an admin with a wrong code before creating a user', async () => {
    const { deps, createUser } = makeDeps();
    const res = await handleSignup(
      { username: 'amy', password: 'password123', role: 'admin', adminCode: 'wrong' },
      ip,
      deps,
    );
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('That admin ID is not right.');
    expect(createUser).not.toHaveBeenCalled();
  });

  it('rejects an admin with a missing code', async () => {
    const { deps, createUser } = makeDeps();
    const res = await handleSignup(
      { username: 'amy', password: 'password123', role: 'admin' },
      ip,
      deps,
    );
    expect(res.status).toBe(403);
    expect(createUser).not.toHaveBeenCalled();
  });

  it('creates an admin with the right code', async () => {
    const { deps, createUser, insert, signInWithPassword } = makeDeps();
    const res = await handleSignup(
      {
        username: 'amy',
        password: 'password123',
        role: 'admin',
        adminCode: 'test-admin-code',
      },
      ip,
      deps,
    );
    expect(res.status).toBe(200);
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'amy@cs-dashboard.example',
        password: 'password123',
        email_confirm: true,
      }),
    );
    expect(insert).toHaveBeenCalledWith({ id: 'user-1', username: 'amy', role: 'admin' });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'amy@cs-dashboard.example',
      password: 'password123',
    });
  });

  it('creates a student without consulting the admin code', async () => {
    const { deps, createUser, insert } = makeDeps();
    const spy = vi.fn(verifyAdminCode);
    const res = await handleSignup(
      { username: 'bob', password: 'password123', role: 'student' },
      ip,
      { ...deps, verifyAdminCode: spy },
    );
    expect(res.status).toBe(200);
    expect(createUser).toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith({ id: 'user-1', username: 'bob', role: 'student' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('rate limits after 5 failed admin attempts from the same IP', async () => {
    const { deps } = makeDeps();
    const body = {
      username: 'amy',
      password: 'password123',
      role: 'admin',
      adminCode: 'wrong',
    };
    for (let i = 0; i < 5; i++) {
      const res = await handleSignup(body, ip, deps);
      expect(res.status).toBe(403);
    }
    const sixth = await handleSignup(body, ip, deps);
    expect(sixth.status).toBe(429);
    expect(sixth.body.error).toBe('Too many attempts. Try again in a few minutes.');

    const otherIp = await handleSignup(body, '198.51.100.9', deps);
    expect(otherIp.status).toBe(403);
  });

  it('rejects an invalid username', async () => {
    const { deps, createUser } = makeDeps();
    const res = await handleSignup(
      { username: 'x', password: 'password123', role: 'student' },
      ip,
      deps,
    );
    expect(res.status).toBe(400);
    expect(createUser).not.toHaveBeenCalled();
  });

  it('returns 409 when the user already exists', async () => {
    const { deps } = makeDeps({
      createUserError: { code: 'email_exists', message: 'User already registered' },
    });
    const res = await handleSignup(
      { username: 'amy', password: 'password123', role: 'student' },
      ip,
      deps,
    );
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('That username is taken.');
  });

  it('deletes the auth user and returns 500 when the profile insert fails', async () => {
    const { deps, deleteUser } = makeDeps({
      insertError: { code: '42501', message: 'permission denied' },
    });
    const res = await handleSignup(
      { username: 'amy', password: 'password123', role: 'student' },
      ip,
      deps,
    );
    expect(res.status).toBe(500);
    expect(deleteUser).toHaveBeenCalledWith('user-1');
  });
});
