import { z } from 'zod';
import { parseYouTubeId } from '@/lib/youtube';
import { CODE_LANGUAGES } from '@/lib/code-languages';

const LANGUAGE_VALUES = CODE_LANGUAGES.map((l) => l.value) as [string, ...string[]];

export const unitCreateSchema = z.object({
  sectorId: z.string().uuid(),
  title: z.string().trim().min(1, 'Give the unit a title.').max(120),
  description: z.string().trim().max(1000).default(''),
});

export const unitUpdateSchema = z.object({
  title: z.string().trim().min(1, 'Give the unit a title.').max(120),
  description: z.string().trim().max(1000).default(''),
});

const youtubeUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => parseYouTubeId(v) !== null, {
    message: 'Paste a valid YouTube link (youtube.com/watch, youtu.be or embed).',
  });

export const lessonCreateSchema = z.object({
  unitId: z.string().uuid(),
  title: z.string().trim().min(1, 'Give the lesson a title.').max(160),
  description: z.string().trim().max(4000).default(''),
  youtubeUrl: youtubeUrlSchema,
});

export const lessonUpdateSchema = z.object({
  title: z.string().trim().min(1, 'Give the lesson a title.').max(160),
  description: z.string().trim().max(4000).default(''),
  youtubeUrl: youtubeUrlSchema,
});

const noteShape = {
  type: z.literal('note'),
  title: z.string().trim().max(160).optional(),
  body: z.string().trim().min(1, 'Write the note.').max(20000),
};

const codeShape = {
  type: z.literal('code'),
  title: z.string().trim().max(160).optional(),
  language: z.enum(LANGUAGE_VALUES),
  body: z.string().min(1, 'Paste the code.').max(50000),
};

const linkShape = {
  type: z.literal('link'),
  title: z.string().trim().min(1, 'Give the link a label.').max(160),
  url: z
    .string()
    .trim()
    .max(2000)
    .refine(
      (v) => {
        if (!v.startsWith('https://')) return false;
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Links must start with https://' },
    ),
};

export const blockCreateSchema = z.discriminatedUnion('type', [
  z.object({ lessonId: z.string().uuid(), ...noteShape }),
  z.object({ lessonId: z.string().uuid(), ...codeShape }),
  z.object({ lessonId: z.string().uuid(), ...linkShape }),
]);

export const blockUpdateSchema = z.discriminatedUnion('type', [
  z.object(noteShape),
  z.object(codeShape),
  z.object(linkShape),
]);

export const reorderSchema = z.object({
  parentId: z.string().uuid(),
  ids: z.array(z.string().uuid()).min(1).max(500),
});

export type UnitCreateInput = z.infer<typeof unitCreateSchema>;
export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
export type BlockCreateInput = z.infer<typeof blockCreateSchema>;
export type ReorderInput = z.infer<typeof reorderSchema>;
