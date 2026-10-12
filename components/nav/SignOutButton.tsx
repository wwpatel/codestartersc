'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={signOut}>
      Sign out
    </Button>
  );
}
