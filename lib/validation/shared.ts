import { z } from 'zod';

export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Invalid input.';
}
