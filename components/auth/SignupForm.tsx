'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

type Role = 'student' | 'admin';

export function SignupForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('student');
  const [username, setUsername] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {
      username: form.get('username'),
      password: form.get('password'),
      role,
    };
    if (role === 'admin') {
      payload.adminCode = form.get('adminCode');
    }

    setPending(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
        return;
      }
      router.replace('/learn');
      router.refresh();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <SectionHeading
        as="h1"
        label="Sign up"
        title="Create your account."
        description="Pick a username. Students need no code."
      />
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <Field
          label="Username"
          htmlFor="username"
          help="3 to 24 characters: lowercase letters, numbers and underscores."
        >
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            minLength={3}
            maxLength={24}
            pattern="[a-z0-9_]{3,24}"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
          />
        </Field>
        <Field label="Password" htmlFor="password" help="At least 8 characters.">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </Field>
        <Field label="Role" htmlFor="role-student">
          <div role="radiogroup" aria-label="Role" className="grid grid-cols-2 gap-2">
            {(['student', 'admin'] as const).map((option) => (
              <button
                key={option}
                id={`role-${option}`}
                type="button"
                role="radio"
                aria-checked={role === option}
                onClick={() => setRole(option)}
                className={cn(
                  'rounded-xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-colors',
                  role === option
                    ? 'border-accent/50 bg-sky-400/10 text-sky-200'
                    : 'border-white/10 bg-white/[0.03] text-muted hover:border-white/20',
                )}
              >
                {option === 'student' ? 'Student' : 'Admin'}
              </button>
            ))}
          </div>
        </Field>
        {role === 'admin' ? (
          <Field
            label="Universal admin ID"
            htmlFor="adminCode"
            help="Ask the CodeStarters team for this ID."
          >
            <Input
              id="adminCode"
              name="adminCode"
              type="password"
              autoComplete="off"
              required
            />
          </Field>
        ) : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
