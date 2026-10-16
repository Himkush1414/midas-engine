import 'server-only';
import { NextResponse } from 'next/server';
import type { ZodType } from 'zod';
import { supabaseAdmin } from './supabase';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function json(data: unknown, status = 200, headers?: Record<string, string>): NextResponse {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

export function errorResponse(e: unknown): NextResponse {
  if (e instanceof HttpError) return json({ error: e.message }, e.status);
  console.error('api error', e);
  return json({ error: 'internal error' }, 500);
}

/** Wraps a route handler with uniform error handling. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<NextResponse>) {
  return async (...args: A): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (e) {
      return errorResponse(e);
    }
  };
}

export async function parseBody<T>(req: Request, schema: ZodType<T>, maxBytes = 512_000): Promise<T> {
  const length = Number(req.headers.get('content-length') ?? 0);
  if (length > maxBytes) throw new HttpError(413, 'payload too large');
  let raw: unknown;
  try {
    const text = await req.text();
    if (text.length > maxBytes) throw new HttpError(413, 'payload too large');
    raw = JSON.parse(text);
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(400, 'invalid JSON');
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new HttpError(400, `invalid request: ${parsed.error.issues[0]?.message ?? 'bad input'}`);
  return parsed.data;
}

export interface AuthedUser {
  id: string;
  isAnonymous: boolean;
}

/** Verifies the Supabase access token sent as `Authorization: Bearer <jwt>`. */
export async function requireUser(req: Request): Promise<AuthedUser> {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new HttpError(401, 'missing token');
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, 'invalid token');
  return { id: data.user.id, isAnonymous: Boolean(data.user.is_anonymous) };
}

export async function optionalUser(req: Request): Promise<AuthedUser | null> {
  if (!req.headers.get('authorization')) return null;
  try {
    return await requireUser(req);
  } catch {
    return null;
  }
}
