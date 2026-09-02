import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/main/PageHeader';
import TextBody from '@/components/main/TextBody';
import { spiceBlendsWithSlugs } from '@/lib/main/recipes';

export const dynamic = 'force-dynamic';
type Params = { params: Promise<{ slug: string }> };

async function find(slug: string) {
  return (await spiceBlendsWithSlugs()).find((r) => r.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = await find((await params).slug);
  return { title: r?.title ?? 'Spice blend' };
}

export default async function SpiceBlendPage({ params }: Params) {
  const r = await find((await params).slug);
  if (!r) notFound();
  return (
    <article>
      <PageHeader eyebrow={{ label: 'Spice Blends', href: '/collections/spice-blends' }} title={r.title} />
      <TextBody text={r.body} />
      {r.sourceUrl && (
        <p className="article-meta" style={{ marginTop: '2rem' }}>
          <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer">
            {r.sourceLabel ?? 'View original'}
          </a>
        </p>
      )}
    </article>
  );
}
