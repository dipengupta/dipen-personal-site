import { NextResponse } from 'next/server';
import { listYoutube } from '@/lib/content/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ items: await listYoutube() });
}
