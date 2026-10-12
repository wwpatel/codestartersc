import { timingSafeEqual } from 'node:crypto';

export function verifyAdminCode(
  input: unknown,
  expected: string | undefined = process.env.ADMIN_SIGNUP_CODE,
): boolean {
  if (typeof input !== 'string' || !expected) return false;
  const a = Buffer.from(input, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}
