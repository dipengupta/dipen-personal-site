import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/main/PageHeader';
import { listArticles } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Articles' };
export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
  const articles = await listArticles();
  return (
    <>
      <PageHeader
        eyebrow={{ label: 'Collections', href: '/collections' }}
        title="Articles"
        intro="Writing has always been cathartic for me. Everything here was written by hand, and the full text is saved on this site in case the original links ever break."
      />
      <ul className="list-plain" data-testid="article-list">
        {articles.map((a) => (
          <li key={a.slug} className="row">
            <Link href={`/collections/articles/${a.slug}`} className="row-title">
              {a.title}
            </Link>
            <span className="row-meta">{a.publishedLabel.replace(/^Published\s+/, '')}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
