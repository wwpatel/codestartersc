'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const LINKS = [
  { href: '/learn', label: 'Learn' },
  { href: '/learn/ai', label: 'AI' },
  { href: '/learn/robotics', label: 'Robotics' },
  { href: '/learn/python', label: 'Python' },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 text-sm md:flex">
      {LINKS.map((link, i) => {
        const active =
          link.href === '/learn'
            ? pathname === '/learn'
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <span key={link.href} className="flex items-center gap-1">
            {i > 0 ? <span className="text-muted/40">•</span> : null}
            <Link
              href={link.href}
              className={cn(
                'px-2.5 py-2 transition-colors',
                active ? 'text-foreground' : 'text-muted hover:text-foreground',
              )}
            >
              {link.label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
