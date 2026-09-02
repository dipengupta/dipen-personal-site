import { NextResponse } from 'next/server';
import { getSection, isContentSection, type ContentSection } from '@/lib/content/queries';

export const dynamic = 'force-dynamic';

export type { ContentSection };

/** `{ items }` for one content section; the queries live in src/lib/content/queries.ts. */
export async function GET(_request: Request, { params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!isContentSection(section)) {
    return NextResponse.json({ error: `unknown section: ${section}` }, { status: 404 });
  }
  return NextResponse.json({ items: await getSection(section) });
}
