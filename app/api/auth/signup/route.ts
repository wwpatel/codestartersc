import { NextResponse } from 'next/server';
import { handleSignup } from '@/lib/auth/signup';
import { getClientIp } from '@/lib/auth/rate-limit';
import { readJson } from '@/lib/http';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (body === null) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const result = await handleSignup(body, getClientIp(request));
  return NextResponse.json(result.body, { status: result.status });
}
