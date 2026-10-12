import { cn } from '@/lib/cn';

export interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
  className?: string;
}

export function SectionHeading({
  label,
  title,
  description,
  align = 'left',
  as: Heading = 'h2',
  className,
}: SectionHeadingProps) {
  const trimmed = title.trim();
  const lastSpace = trimmed.lastIndexOf(' ');
  const head = lastSpace === -1 ? '' : trimmed.slice(0, lastSpace + 1);
  const tail = lastSpace === -1 ? trimmed : trimmed.slice(lastSpace + 1);

  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      {label ? (
        <p className="text-xs uppercase tracking-[3px] text-muted">{label}</p>
      ) : null}
      <Heading className="mt-3 text-4xl font-medium tracking-[-1px] md:text-5xl">
        {head}
        <span className="font-serif font-normal italic">{tail}</span>
      </Heading>
      {description ? (
        <p className={cn('mt-4 max-w-xl text-sm leading-6 text-muted', align === 'center' && 'mx-auto')}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
