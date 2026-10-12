import { requireUser } from '@/lib/auth/session';
import { TopNav } from '@/components/nav/TopNav';
import { SiteFooter } from '@/components/nav/SiteFooter';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav username={session.profile.username} role={session.profile.role} />
      <main className="pb-24 pt-28 md:pt-36">{children}</main>
      <SiteFooter />
    </div>
  );
}
