import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { MAX_QUERY, searchContent, type SearchScope } from '@/lib/search/searchContent';

export const dynamic = 'force-dynamic';

/**
 * Global search. `?q=` (2..100 chars) and `?scope=itunes|main` (default
 * itunes). A small per-client token bucket keeps a runaway client from
 * turning the substring scan into a CPU sink; everything else is unauthenticated
 * read-only content.
 */
const BUCKET_SIZE = 30;
const REFILL_PER_SEC = 5;
const buckets = new Map<string, { tokens: number; at: number }>();

function allow(key: string): boolean {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: BUCKET_SIZE, at: now };
  b.tokens = Math.min(BUCKET_SIZE, b.tokens + ((now - b.at) / 1000) * REFILL_PER_SEC);
  b.at = now;
  if (b.tokens < 1) {
    buckets.set(key, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(key, b);
  if (buckets.size > 5000) buckets.clear(); // bounded memory; a reset is harmless
  return true;
}

export async function GET(request: Request) {
  const client = request.headers.get('fly-client-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (!allow(client)) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429, headers: { 'Retry-After': '2' } });
  }
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') ?? '').slice(0, MAX_QUERY);
  const scope: SearchScope = url.searchParams.get('scope') === 'main' ? 'main' : 'itunes';
  return NextResponse.json(searchContent(getDb(), q, { scope }));
}
