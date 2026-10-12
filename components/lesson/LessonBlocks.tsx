import { ExternalLink } from 'lucide-react';
import { Tag } from '@/components/ui/Tag';
import { CodeBlock } from './CodeBlock';
import type { LessonBlock } from '@/lib/supabase/types';

function LinkBlock({ block }: { block: LessonBlock }) {
  if (!block.url?.startsWith('https://')) return null;
  let host = '';
  try {
    host = new URL(block.url).hostname;
  } catch {
    return null;
  }
  return (
    <a
      href={block.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-card p-5 transition-colors hover:border-sky-400/35"
    >
      <div>
        <Tag variant="sky">Link</Tag>
        <p className="mt-3 font-semibold">{block.title ?? block.url}</p>
        <p className="mt-1 text-xs text-muted">{host}</p>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted" />
    </a>
  );
}

export function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  if (blocks.length === 0) return null;
  return (
    <div className="mt-10 space-y-6">
      {blocks.map((block) => {
        if (block.type === 'note') {
          return (
            <section key={block.id} className="rounded-2xl border border-white/10 bg-card p-6">
              <Tag variant="neutral">Note</Tag>
              {block.title ? (
                <h3 className="mt-4 text-lg font-semibold">{block.title}</h3>
              ) : null}
              {block.body ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/85">
                  {block.body}
                </p>
              ) : null}
            </section>
          );
        }
        if (block.type === 'code') {
          return (
            <CodeBlock
              key={block.id}
              code={block.body ?? ''}
              language={block.language}
              title={block.title}
            />
          );
        }
        return <LinkBlock key={block.id} block={block} />;
      })}
    </div>
  );
}
