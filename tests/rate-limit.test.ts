import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { rateLimit, resetRateLimits } from '@/lib/auth/rate-limit';

const opts = { limit: 3, windowMs: 60_000 };

beforeEach(() => resetRateLimits());
afterEach(() => vi.useRealTimers());

describe('rateLimit', () => {
  it('allows up to limit attempts then blocks', () => {
    expect(rateLimit('a', opts).ok).toBe(true);
    expect(rateLimit('a', opts).ok).toBe(true);
    expect(rateLimit('a', opts).ok).toBe(true);
    const fourth = rateLimit('a', opts);
    expect(fourth.ok).toBe(false);
    expect(fourth.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('tracks keys independently', () => {
    rateLimit('a', opts);
    rateLimit('a', opts);
    rateLimit('a', opts);
    expect(rateLimit('a', opts).ok).toBe(false);
    expect(rateLimit('b', opts).ok).toBe(true);
  });

  it('resetRateLimits clears the counters', () => {
    rateLimit('a', opts);
    rateLimit('a', opts);
    rateLimit('a', opts);
    resetRateLimits();
    expect(rateLimit('a', opts).ok).toBe(true);
  });

  it('allows again after the window expires', () => {
    vi.useFakeTimers();
    rateLimit('a', opts);
    rateLimit('a', opts);
    rateLimit('a', opts);
    expect(rateLimit('a', opts).ok).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(rateLimit('a', opts).ok).toBe(true);
  });
});
