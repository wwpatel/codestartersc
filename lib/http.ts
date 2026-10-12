import { NextResponse } from 'next/server';

export function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk<T>(data: T) {
  return NextResponse.json(data, { status: 200 });
}

export async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function handleRouteError(err: unknown) {
  if (err instanceof HttpError) {
    return jsonError(err.status, err.message);
  }
  console.error(err);
  return jsonError(500, 'Something went wrong.');
}
