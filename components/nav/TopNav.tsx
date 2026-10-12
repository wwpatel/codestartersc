import Image from 'next/image';
import Link from 'next/link';
import { Tag } from '@/components/ui/Tag';
import { NavLinks } from './NavLinks';
import { SignOutButton } from './SignOutButton';
import type { Role } from '@/lib/supabase/types';

export function TopNav({ username, role }: { username: string; role: Role }) {
  return (
    <header className="nav-glass fixed left-3 right-3 top-3 z-50 flex items-center justify-between rounded-2xl px-4 py-3 md:left-10 md:right-10 md:top-6 md:px-6 md:py-4">
      <Link href="/learn" className="flex items-center gap-2.5">
        <Image
          src="/cs-logo.png"
          alt="CodeStarters"
          width={28}
          height={28}
          className="rounded-sm brightness-0 invert"
          priority
        />
        <span className="text-lg font-bold">CodeStarters</span>
      </Link>
      <NavLinks />
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-muted sm:inline">{username}</span>
        {role === 'admin' ? <Tag variant="sky">Admin</Tag> : null}
        <SignOutButton />
      </div>
    </header>
  );
}
