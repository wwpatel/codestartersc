import { describe, expect, it } from 'vitest';
import {
  extractJson,
  parseQuizOutput,
  quizOutputSchema,
  quizQuestionsSchema,
} from '@/lib/quiz/schema';

const question = (i = 0) => ({
  question: `Question ${i}?`,
  options: ['A one', 'B two', 'C three', 'D four'],
  correctIndex: 1,
  explanation: 'Because B.',
});

const validOutput = () => ({ questions: [0, 1, 2, 3, 4].map(question) });

describe('quizQuestionsSchema', () => {
  it('accepts a valid set of five', () => {
    expect(quizQuestionsSchema.safeParse(validOutput().questions).success).toBe(true);
  });

  it('rejects 4 and 6 questions', () => {
    expect(quizQuestionsSchema.safeParse([0, 1, 2, 3].map(question)).success).toBe(false);
    expect(quizQuestionsSchema.safeParse([0, 1, 2, 3, 4, 5].map(question)).success).toBe(false);
  });

  it('rejects 3 and 5 options', () => {
    const q3 = { ...question(), options: ['a', 'b', 'c'] };
    const q5 = { ...question(), options: ['a', 'b', 'c', 'd', 'e'] };
    expect(quizQuestionsSchema.safeParse([...validOutput().questions.slice(0, 4), q3]).success).toBe(false);
    expect(quizQuestionsSchema.safeParse([...validOutput().questions.slice(0, 4), q5]).success).toBe(false);
  });

  it('rejects out-of-range and non-integer correctIndex', () => {
    for (const correctIndex of [4, -1, 1.5]) {
      const q = { ...question(), correctIndex };
      expect(quizQuestionsSchema.safeParse([...validOutput().questions.slice(0, 4), q]).success).toBe(false);
    }
  });

  it('rejects a missing explanation and duplicate options', () => {
    const noExpl = { ...question(), explanation: '' };
    const dup = { ...question(), options: ['Same', 'same', 'Other', 'Fourth'] };
    for (const q of [noExpl, dup]) {
      expect(quizQuestionsSchema.safeParse([...validOutput().questions.slice(0, 4), q]).success).toBe(false);
    }
  });
});

describe('extractJson', () => {
  it('handles fences and surrounding prose', () => {
    const raw = validOutput();
    const fenced = 'Here you go:\n```json\n' + JSON.stringify(raw) + '\n```\nDone.';
    expect(extractJson(fenced)).toEqual(raw);
    expect(extractJson('no json here')).toBeNull();
    expect(extractJson('{broken')).toBeNull();
  });
});

describe('parseQuizOutput', () => {
  it('maps options/correctIndex to choices/answer_index', () => {
    const res = parseQuizOutput(validOutput());
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.questions).toHaveLength(5);
      expect(res.questions[0]).toEqual({
        question: 'Question 0?',
        choices: ['A one', 'B two', 'C three', 'D four'],
        answer_index: 1,
        explanation: 'Because B.',
      });
    }
  });

  it('returns ok:false with a message for bad input', () => {
    expect(parseQuizOutput(null).ok).toBe(false);
    const res = parseQuizOutput({ questions: [] });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.length).toBeGreaterThan(0);
  });
});

describe('quizOutputSchema', () => {
  it('accepts the full output', () => {
    expect(quizOutputSchema.safeParse(validOutput()).success).toBe(true);
  });
});
