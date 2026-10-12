import { z } from 'zod';
import { USERNAME_RE, normalizeUsername } from '@/lib/auth/username';

const usernameSchema = z
  .string()
  .transform(normalizeUsername)
  .pipe(z.string().regex(USERNAME_RE, 'Usernames are 3 to 24 characters: lowercase letters, numbers and underscores.'));

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be 72 characters or fewer.');

export const signupSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  role: z.enum(['admin', 'student']),
  adminCode: z.string().max(200).optional(),
});

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'Enter your password.'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Invalid input.';
}
