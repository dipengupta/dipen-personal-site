import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/main/PageHeader';
import TextBody from '@/components/main/TextBody';
import { findRecipeOrBlend } from '@/lib/main/recipes';

export const dynamic = 'force-dynamic';
type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = await findRecipeOrBlend((await params).slug);
  return { title: r?.title ?? 'Recipe' };
}

/** One recipe or spice blend; both live under /collections/recipes/<slug>. */
export default async function RecipePage({ params }: Params) {
  const r = await findRecipeOrBlend((await params).slug);
  if (!r) notFound();
  return (
    <article>
      <PageHeader eyebrow="Recipes and Spice Blends" title={r.title} intro={r.kind === 'blend' ? 'Spice blend' : r.categoryLabel} />
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
