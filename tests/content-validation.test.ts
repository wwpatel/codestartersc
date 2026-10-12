import { describe, expect, it } from 'vitest';
import {
  blockCreateSchema,
  blockUpdateSchema,
  lessonCreateSchema,
  unitCreateSchema,
} from '@/lib/validation/content';

const uuid = '11111111-1111-4111-8111-111111111111';

describe('link blocks', () => {
  const link = (url: string) => ({
    type: 'link',
    lessonId: uuid,
    title: 'Read more',
    url,
  });

  it('rejects http, javascript and ftp URLs', () => {
    for (const url of ['http://example.com', 'javascript:alert(1)', 'ftp://x.com/a']) {
      expect(blockCreateSchema.safeParse(link(url)).success, url).toBe(false);
    }
  });

  it('accepts https', () => {
    expect(blockCreateSchema.safeParse(link('https://arxiv.org/abs/1706.03762')).success).toBe(true);
  });
});

describe('code blocks', () => {
  it('rejects unknown languages and accepts known ones', () => {
    const base = { type: 'code', lessonId: uuid, body: 'x = 1' };
    expect(blockCreateSchema.safeParse({ ...base, language: 'cobol' }).success).toBe(false);
    expect(blockCreateSchema.safeParse({ ...base, language: 'python' }).success).toBe(true);
  });
});

describe('unit schema', () => {
  it('requires and trims the title', () => {
    expect(
      unitCreateSchema.safeParse({ sectorId: uuid, title: '  ', description: 'x' }).success,
    ).toBe(false);
    const res = unitCreateSchema.safeParse({ sectorId: uuid, title: '  Intro  ' });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.title).toBe('Intro');
      expect(res.data.description).toBe('');
    }
  });
});

describe('lesson schema', () => {
  it('rejects a non-YouTube URL', () => {
    expect(
      lessonCreateSchema.safeParse({
        unitId: uuid,
        title: 'L',
        youtubeUrl: 'https://vimeo.com/123',
      }).success,
    ).toBe(false);
  });

  it('accepts a youtube url and defaults description', () => {
    const res = lessonCreateSchema.safeParse({
      unitId: uuid,
      title: 'L',
      youtubeUrl: 'https://youtu.be/aircAruvnKk',
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.description).toBe('');
  });
});

describe('block update schema', () => {
  it('does not require lessonId', () => {
    expect(
      blockUpdateSchema.safeParse({ type: 'note', title: 't', body: 'hello' }).success,
    ).toBe(true);
  });
});
