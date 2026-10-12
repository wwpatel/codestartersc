import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeFakeSupabase } from './helpers/fake-supabase';

const sessionState: { value: unknown } = { value: null };
let fakeSupabase: ReturnType<typeof makeFakeSupabase>;

vi.mock('@/lib/auth/session', () => ({
  getSessionForApi: vi.fn(async () => sessionState.value),
  getSession: vi.fn(async () => sessionState.value),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => fakeSupabase),
}));

vi.mock('@/lib/quiz/generate', () => ({
  generateAndStoreQuiz: vi.fn(async () => ({ status: 'ready', questions: [] })),
}));

import { POST as createUnit } from '@/app/api/admin/units/route';
import { PATCH as patchUnit, DELETE as deleteUnit } from '@/app/api/admin/units/[id]/route';
import { POST as createLesson } from '@/app/api/admin/lessons/route';
import { POST as createBlock } from '@/app/api/admin/blocks/route';
import { POST as regenQuiz } from '@/app/api/admin/lessons/[id]/quiz/route';

const uuid = '11111111-1111-4111-8111-111111111111';

function req(body: unknown, method = 'POST') {
  return new Request('http://localhost/api', {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const CTX = { params: { id: uuid } };

const student = {
  user: { id: 'u-student' },
  profile: { id: 'u-student', username: 'amy', role: 'student' },
};
const admin = {
  user: { id: 'u-admin' },
  profile: { id: 'u-admin', username: 'boss', role: 'admin' },
};

const bodies = {
  unit: { sectorId: uuid, title: 'Unit one', description: 'd' },
  unitPatch: { title: 'Renamed', description: 'd' },
  lesson: { unitId: uuid, title: 'L', youtubeUrl: 'https://youtu.be/aircAruvnKk' },
  block: { type: 'note', lessonId: uuid, title: 't', body: 'hello' },
};

const cases: { name: string; call: () => Promise<Response> }[] = [
  { name: 'POST units', call: () => createUnit(req(bodies.unit), CTX) },
  { name: 'PATCH units/[id]', call: () => patchUnit(req(bodies.unitPatch, 'PATCH'), CTX) },
  { name: 'DELETE units/[id]', call: () => deleteUnit(req({}, 'DELETE'), CTX) },
  { name: 'POST lessons', call: () => createLesson(req(bodies.lesson), CTX) },
  { name: 'POST blocks', call: () => createBlock(req(bodies.block), CTX) },
  { name: 'POST lessons/[id]/quiz', call: () => regenQuiz(req({}), CTX) },
];

beforeEach(() => {
  sessionState.value = null;
  fakeSupabase = makeFakeSupabase({ data: { id: uuid } });
});

describe('admin role rules', () => {
  for (const c of cases) {
    it(`${c.name}: 401 without a session`, async () => {
      sessionState.value = null;
      const res = await c.call();
      expect(res.status).toBe(401);
      expect(fakeSupabase.calls.tables).toHaveLength(0);
    });

    it(`${c.name}: 403 for a student and no db access`, async () => {
      sessionState.value = student;
      const res = await c.call();
      expect(res.status).toBe(403);
      expect(fakeSupabase.calls.tables).toHaveLength(0);
    });

    it(`${c.name}: not 401/403 for an admin`, async () => {
      sessionState.value = admin;
      const res = await c.call();
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    });
  }
});
