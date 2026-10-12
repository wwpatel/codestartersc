import { z } from 'zod';
import type { QuizQuestion } from '@/lib/supabase/types';

export const quizQuestionSchema = z.object({
  question: z.string().trim().min(1).max(500),
  options: z
    .array(z.string().trim().min(1).max(300))
    .length(4)
    .refine((o) => new Set(o.map((s) => s.toLowerCase())).size === 4, {
      message: 'Options must be distinct.',
    }),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().trim().min(1).max(600),
});

export const quizQuestionsSchema = z.array(quizQuestionSchema).length(5);

export const quizOutputSchema = z.object({ questions: quizQuestionsSchema });

export function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function parseQuizOutput(
  raw: unknown,
): { ok: true; questions: QuizQuestion[] } | { ok: false; error: string } {
  const parsed = quizOutputSchema.safeParse(raw);
  if (!parsed.success) {
    const summary = parsed.error.issues
      .map((i) => `${i.path.join('.') || 'output'}: ${i.message}`)
      .join('; ');
    return { ok: false, error: summary };
  }
  return {
    ok: true,
    questions: parsed.data.questions.map((q) => ({
      question: q.question,
      choices: q.options,
      answer_index: q.correctIndex,
      explanation: q.explanation,
    })),
  };
}

export const QUIZ_TOOL_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      minItems: 5,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          options: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: { type: 'string' },
          },
          correctIndex: { type: 'integer', minimum: 0, maximum: 3 },
          explanation: { type: 'string' },
        },
        required: ['question', 'options', 'correctIndex', 'explanation'],
      },
    },
  },
  required: ['questions'],
} as const;
