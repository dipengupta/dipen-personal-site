import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/main/PageHeader';
import { getDb } from '@/lib/db/client';
import { searchResultHref } from '@/lib/main/searchTargets';
import { searchContent } from '@/lib/search/searchContent';

export const metadata: Metadata = { title: 'Search' };
export const dynamic = 'force-dynamic';

/** Server-rendered search (the header dialog is the fast path; this works without JS). */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const result = q ? searchContent(getDb(), q, { scope: 'main' }) : null;
  return (
    <>
      <PageHeader title="Search" />
      <form action="/search" method="get" role="search" style={{ marginBottom: '2rem' }}>
        <input className="search-input" style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }} type="search" name="q" defaultValue={q} placeholder="Search recipes, guitars, articles, tweets, anything" aria-label="Search" />
      </form>
      {result && (
        <p className="muted">
          {result.total} result{result.total === 1 ? '' : 's'} for "{result.query}"
        </p>
      )}
      {result?.groups.map((g) => (
        <section key={g.type} className="section" style={{ marginBlock: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem' }}>{g.label}</h2>
          <ul className="list-plain">
            {g.results.map((r) => (
              <li key={`${g.type}-${r.id}`} className="row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.1rem' }}>
                <Link href={searchResultHref(g.type, r.id, r.title)} className="row-title">
                  {r.title}
                </Link>
                {r.snippet && <span className="muted">{r.snippet}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
