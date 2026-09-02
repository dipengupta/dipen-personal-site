import { NextResponse } from 'next/server';
import { listSoundcloud } from '@/lib/content/queries';

export const dynamic = 'force-dynamic';

// Fallback track list; the client tries the SoundCloud widget's live
// getSounds() first and only falls back to this when the widget fails.
export async function GET() {
  return NextResponse.json({ items: listSoundcloud() });
}
