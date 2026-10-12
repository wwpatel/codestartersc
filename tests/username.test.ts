import { describe, expect, it } from 'vitest';
import {
  isValidUsername,
  normalizeUsername,
  usernameToEmail,
} from '@/lib/auth/username';

describe('isValidUsername', () => {
  it('accepts valid usernames', () => {
    expect(isValidUsername('amy')).toBe(true);
    expect(isValidUsername('a_b_c')).toBe(true);
    expect(isValidUsername('student_01')).toBe(true);
    expect(isValidUsername('x'.repeat(24))).toBe(true);
  });

  it('rejects too short and too long', () => {
    expect(isValidUsername('ab')).toBe(false);
    expect(isValidUsername('')).toBe(false);
    expect(isValidUsername('x'.repeat(25))).toBe(false);
  });

  it('rejects uppercase, spaces, and hyphens', () => {
    expect(isValidUsername('Amy')).toBe(false);
    expect(isValidUsername('a b')).toBe(false);
    expect(isValidUsername('a-b')).toBe(false);
  });

  it('accepts uppercase after normalize', () => {
    expect(isValidUsername(normalizeUsername('Amy'))).toBe(true);
    expect(isValidUsername(normalizeUsername('  Amy  '))).toBe(true);
  });
});

describe('normalizeUsername', () => {
  it('trims and lowercases', () => {
    expect(normalizeUsername('  AMY_01 ')).toBe('amy_01');
  });
});

describe('usernameToEmail', () => {
  it('maps to the dashboard domain', () => {
    expect(usernameToEmail('amy')).toBe('amy@cs-dashboard.example');
  });
});
