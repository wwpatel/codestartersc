import { describe, expect, it } from 'vitest';
import { verifyAdminCode } from '@/lib/auth/admin-code';

describe('verifyAdminCode', () => {
  it('returns true for the correct code', () => {
    expect(verifyAdminCode('test-admin-code')).toBe(true);
  });

  it('returns false for a wrong code of the same length', () => {
    expect(verifyAdminCode('test-admin-codf')).toBe(false);
  });

  it('returns false for a code of different length', () => {
    expect(verifyAdminCode('short')).toBe(false);
    expect(verifyAdminCode('test-admin-code-extra')).toBe(false);
  });

  it('returns false for empty, undefined, and non-string input', () => {
    expect(verifyAdminCode('')).toBe(false);
    expect(verifyAdminCode(undefined)).toBe(false);
    expect(verifyAdminCode(null)).toBe(false);
    expect(verifyAdminCode(123)).toBe(false);
    expect(verifyAdminCode({})).toBe(false);
  });

  it('returns false when expected is unset', () => {
    expect(verifyAdminCode('anything', undefined)).toBe(false);
  });

  it('uses the env default when expected is omitted', () => {
    expect(verifyAdminCode('test-admin-code')).toBe(true);
    expect(verifyAdminCode('wrong', 'test-admin-code')).toBe(false);
    expect(verifyAdminCode('test-admin-code', 'test-admin-code')).toBe(true);
  });
});
