import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { buttonClasses } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <SectionHeading
        as="h1"
        align="center"
        label="404"
        title="Page not found."
        description="This page does not exist or you do not have access to it."
      />
      <Link href="/learn" className={buttonClasses('primary', 'md') + ' mt-8'}>
        Back to curriculum
      </Link>
    </div>
  );
}
