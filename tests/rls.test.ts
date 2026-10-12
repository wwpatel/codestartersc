import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';

const MIGRATION = readFileSync(
  join(__dirname, '..', 'supabase', 'migrations', '20261012000000_init.sql'),
  'utf8',
);

const ADMIN_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const STUDENT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

let db: PGlite;

async function as(userId: string | null, fn: () => Promise<unknown>) {
  const role = userId ? 'authenticated' : 'anon';
  await db.query(`set role ${role}`);
  if (userId) {
    await db.query(`select set_config('request.jwt.claim.sub', '${userId}', false)`);
  } else {
    await db.query(`select set_config('request.jwt.claim.sub', '', false)`);
  }
  try {
    return await fn();
  } finally {
    await db.query('reset role').catch(() => {});
  }
}

function queryAs(userId: string | null, sql: string) {
  return as(userId, () => db.query(sql)) as Promise<{ rows: Record<string, unknown>[]; affectedRows?: number }>;
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create schema if not exists auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid
      language sql stable
      as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create role authenticated nologin;
    create role anon nologin;
  `);
  await db.exec(MIGRATION);
  await db.exec(`
    grant usage on schema public to authenticated, anon;
    grant all on all tables in schema public to authenticated, anon;
  `);
  await db.query(
    `insert into auth.users (id) values ('${ADMIN_ID}'), ('${STUDENT_ID}')`,
  );
  await db.query(
    `insert into profiles (id, username, role) values ('${ADMIN_ID}', 'boss', 'admin'), ('${STUDENT_ID}', 'amy', 'student')`,
  );
});

afterAll(async () => {
  await db.close();
});

describe('RLS policies', () => {
  it('a student can select the seeded sectors', async () => {
    const res = await queryAs(STUDENT_ID, 'select slug from sectors order by sort_order');
    expect(res.rows.map((r) => r.slug)).toEqual(['ai', 'robotics', 'python']);
  });

  it('an anonymous user sees no sectors', async () => {
    const res = await queryAs(null, 'select * from sectors');
    expect(res.rows).toHaveLength(0);
  });

  it('a student cannot insert a unit (RLS)', async () => {
    const sector = await db.query<{ id: string }>(`select id from sectors where slug = 'ai'`);
    const sectorId = sector.rows[0].id as string;
    await expect(
      queryAs(STUDENT_ID, `insert into units (sector_id, title) values ('${sectorId}', 'nope')`),
    ).rejects.toThrow();
  });

  it('an admin can insert a unit', async () => {
    const sector = await db.query<{ id: string }>(`select id from sectors where slug = 'ai'`);
    const sectorId = sector.rows[0].id as string;
    const res = await queryAs(
      ADMIN_ID,
      `insert into units (sector_id, title) values ('${sectorId}', 'Admin unit') returning id`,
    );
    expect(res.rows).toHaveLength(1);
  });

  it('a student UPDATE/DELETE of the unit affects 0 rows', async () => {
    const unit = await db.query<{ id: string }>(`select id from units where title = 'Admin unit'`);
    const unitId = unit.rows[0].id as string;
    const upd = await queryAs(STUDENT_ID, `update units set title = 'hacked' where id = '${unitId}'`);
    expect(upd.affectedRows ?? 0).toBe(0);
    const del = await queryAs(STUDENT_ID, `delete from units where id = '${unitId}'`);
    expect(del.affectedRows ?? 0).toBe(0);
    const still = await db.query<{ title: string }>(`select title from units where id = '${unitId}'`);
    expect(still.rows[0].title).toBe('Admin unit');
  });

  it('a student cannot change their own role', async () => {
    await queryAs(
      STUDENT_ID,
      `update profiles set role = 'admin' where id = '${STUDENT_ID}'`,
    );
    const res = await db.query<{ role: string }>(`select role from profiles where id = '${STUDENT_ID}'`);
    expect(res.rows[0].role).toBe('student');
  });

  it('a student sees only their own profile', async () => {
    const own = await queryAs(STUDENT_ID, `select id from profiles where id = '${STUDENT_ID}'`);
    expect(own.rows).toHaveLength(1);
    const other = await queryAs(STUDENT_ID, `select id from profiles where id = '${ADMIN_ID}'`);
    expect(other.rows).toHaveLength(0);
  });

  it('an admin can insert a lesson, block and quiz; a student cannot insert a quiz', async () => {
    const unit = await db.query<{ id: string }>(`select id from units where title = 'Admin unit'`);
    const unitId = unit.rows[0].id as string;
    const lesson = await queryAs(
      ADMIN_ID,
      `insert into lessons (unit_id, title, youtube_url, youtube_id)
       values ('${unitId}', 'L1', 'https://youtu.be/aircAruvnKk', 'aircAruvnKk') returning id`,
    );
    const lessonId = lesson.rows[0].id;
    const block = await queryAs(
      ADMIN_ID,
      `insert into lesson_blocks (lesson_id, type, body) values ('${lessonId}', 'note', 'hi') returning id`,
    );
    expect(block.rows).toHaveLength(1);
    const quiz = await queryAs(
      ADMIN_ID,
      `insert into quizzes (lesson_id, status) values ('${lessonId}', 'ready') returning id`,
    );
    expect(quiz.rows).toHaveLength(1);

    const lesson2 = await queryAs(
      ADMIN_ID,
      `insert into lessons (unit_id, title, youtube_url, youtube_id)
       values ('${unitId}', 'L2', 'https://youtu.be/aircAruvnKk', 'aircAruvnKk') returning id`,
    );
    const lesson2Id = lesson2.rows[0].id;
    await expect(
      queryAs(STUDENT_ID, `insert into quizzes (lesson_id, status) values ('${lesson2Id}', 'ready')`),
    ).rejects.toThrow();
  });
});
