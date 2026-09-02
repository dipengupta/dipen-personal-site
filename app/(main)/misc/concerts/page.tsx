import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import { getSection } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Concerts Seen' };
export const dynamic = 'force-dynamic';

export default async function ConcertsPage() {
  const concerts = await getSection('concerts');
  const years = new Map<string, typeof concerts>();
  for (const c of concerts) years.set(c.year, [...(years.get(c.year) ?? []), c]);
  const ordered = [...years.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  return (
    <>
      <PageHeader eyebrow={{ label: 'Misc', href: '/misc' }} title="Concerts Seen" intro={`${concerts.length} shows and events over the years, newest first.`} />
      {ordered.map(([year, rows]) => (
        <section key={year} className="section" style={{ marginBlock: '2rem' }}>
          <div className="section-head">
            <h2>{year}</h2>
            <span className="muted">{rows.length}</span>
          </div>
          <ul className="list-plain">
            {rows.map((c) => (
              <li key={c.id} id={`concert-${c.id}`} className="row">
                <span className="row-title">{c.name}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
