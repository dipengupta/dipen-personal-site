import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/main/PageHeader';
import { getArticle } from '@/lib/content/queries';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const article = getArticle((await params).slug);
  return { title: article?.title ?? 'Article' };
}

export default async function ArticlePage({ params }: Params) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  return (
    <article>
      <PageHeader eyebrow={{ label: 'Articles', href: '/collections/articles' }} title={article.title} />
      <p className="article-meta">
        {article.publishedLabel}.{' '}
        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
          {article.sourceLabel}
        </a>
      </p>
      {/* bodyHtml is sanitized when stored (src/lib/content/sanitize.ts). */}
      <div className="prose" data-testid="article-body" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
    </article>
  );
}
