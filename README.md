# CodeStarters Curriculum Dashboard

A learning site for [CodeStarters](https://codestarters.org). Students sign in and work through video lessons in three programs — AI, Robotics and Python. Admins add the content. There are no grades and no progress tracking.

## Features

- Username/password sign-in with two roles: student and admin. Admin accounts also need the universal admin ID at sign-up.
- Three fixed programs, each made of ordered units and lessons.
- Lesson pages with a YouTube video, a description, notes, syntax-highlighted code blocks with a copy button, and links (https only).
- A five-question quiz generated from the video transcript. It appears when the video ends, scores instantly, can be retaken any time, and is never saved.
- Admin tools to add, edit, reorder and delete units, lessons and blocks, and to regenerate a quiz.

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS 4
- Supabase (Auth + Postgres with row level security) via `@supabase/ssr`
- Anthropic API for quiz generation
- `youtube-transcript` for video captions
- Vitest
- Deploys to Vercel

## Setup

1. Requirements: Node 20+, a Supabase project, an Anthropic API key.
2. Install dependencies:

   ```
   npm install
   ```

3. Database: open `supabase/migrations/20261012000000_init.sql`, copy the whole file, then in the Supabase dashboard go to SQL Editor → New query, paste it and click Run. It creates the tables, the `is_admin()` helper, all RLS policies, and seeds the three sectors — AI, Robotics, Python — with no other content.

   If you prefer the terminal and have the Supabase CLI installed, this does the same thing:

   ```
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
4. Turn off email confirmation: Authentication → Sign In / Providers → Email → disable "Confirm email". Accounts use usernames; the server maps each username to a synthetic address `username@cs-dashboard.example` that is never emailed, so confirmation must be off or sign-in will fail.
5. Environment:

   ```
   cp .env.example .env.local
   ```

   Fill in each variable:

   | Variable | What it is |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service role key. Server only; creates accounts. |
   | `ADMIN_SIGNUP_CODE` | The universal admin ID. Anyone creating an admin account must type it. Pick a long random value and share it only with staff. Checked only on the server. |
   | `ANTHROPIC_API_KEY` | Used to generate quizzes. |
   | `QUIZ_MODEL` | Model for quiz generation. Defaults to `claude-sonnet-5-5`. |

6. Run it:

   ```
   npm run dev
   ```

   Open http://localhost:3000. Create the first admin at `/signup` by choosing Admin and entering the admin ID. Students sign up without a code.

## Deploy to Vercel

Import the repo, add the same six environment variables in Project Settings → Environment Variables, and deploy. Quiz generation runs during the lesson save request, and the routes set `maxDuration = 60`.

## How quizzes work

When an admin saves a lesson with a new YouTube URL (or clicks Regenerate quiz), the server fetches the video's captions, asks the model for exactly five multiple-choice questions based only on the transcript, validates the JSON, and stores it per lesson.

Statuses:

- `ready` — the quiz exists and students see it when the video ends.
- `no_captions` — the video has no captions, so no quiz could be built. Students see no quiz.
- `failed` — generation failed. Admins see the error on the edit page; use Regenerate to try again.

Students never wait on generation.

Troubleshooting: videos must have captions (auto-generated captions count). YouTube often blocks caption requests from cloud hosting (including Vercel), which shows up as `no_captions` even for videos that have captions. When that happens, open the video on YouTube, click "Show transcript" in the description, copy it, and paste it into the Transcript box on the lesson's edit page to build the quiz. A `failed` status whose error mentions the model usually means `QUIZ_MODEL` or `ANTHROPIC_API_KEY` is wrong.

## Roles and security

- The admin ID is verified on the server with a constant-time comparison and rate limited per IP.
- Accounts are created with the service role and the role is written server side. Clients can never set or change a role.
- Every admin write goes through server routes that check the caller's role, and RLS enforces the same rules in Postgres.
- All content is rendered as text (code blocks included), and link blocks accept https URLs only.
- Logged-out visitors can only reach `/login` and `/signup`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Start the production build |
| `npm run lint` | Lint |
| `npm test` | Unit tests, plus an in-process Postgres (PGlite) run of the migration that checks the RLS policies |

## Project structure

```
app/            routes: (auth) login/signup, (app)/learn pages, api/auth, api/admin
components/     UI kit, nav, auth forms, lesson blocks, admin tools
lib/            auth, data, quiz, supabase clients, validation
supabase/       migrations/
tests/          vitest suite
```
