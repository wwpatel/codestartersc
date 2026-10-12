import type { LucideIcon } from 'lucide-react';
import { Bot, CodeXml, Sparkles } from 'lucide-react';

export const SECTOR_META: Record<string, { blurb: string; icon: LucideIcon }> = {
  ai: {
    blurb: 'Modern AI, from first prompts to working agents.',
    icon: Sparkles,
  },
  robotics: {
    blurb: 'Design, build and program robots.',
    icon: Bot,
  },
  python: {
    blurb: 'Hands-on programming with small apps and exercises.',
    icon: CodeXml,
  },
};

export function sectorMeta(slug: string) {
  return SECTOR_META[slug] ?? { blurb: '', icon: CodeXml };
}
