import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import Picture from '@/components/main/Picture';
import { getSection } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Mug Collection' };
export const dynamic = 'force-dynamic';

const GROUPS: Array<{ key: 'state' | 'city' | 'country' | 'special'; label: string }> = [
  { key: 'state', label: 'States' },
  { key: 'city', label: 'Cities' },
  { key: 'country', label: 'Countries' },
  { key: 'special', label: 'Special' },
];

export default async function MugsPage() {
  const mugs = await getSection('mugs');
  return (
    <>
      <PageHeader eyebrow={{ label: 'Collections', href: '/collections' }} title="Mug Collection" intro={`${mugs.length} mugs, and the people who brought them.`} />
      <Picture src="/media/images/travel/mugs.webp" alt="The mug shelf" priority style={{ borderRadius: 'var(--radius)', marginBottom: '2rem' }} />
      {GROUPS.map((g) => {
        const rows = mugs.filter((m) => m.category === g.key);
        if (!rows.length) return null;
        return (
          <section key={g.key} className="mug-group" aria-labelledby={`mugs-${g.key}`}>
            <div className="section-head">
              <h2 id={`mugs-${g.key}`}>{g.label}</h2>
              <span className="muted">{rows.length}</span>
            </div>
            <ul className="mug-list">
              {rows.map((m) => (
                <li key={m.id} id={`mug-${m.id}`}>
                  {m.title}
                  {(m.giftedBy || m.detail) && (
                    <span className="muted">
                      {m.giftedBy && `from ${m.giftedBy}`}
                      {m.giftedBy && m.detail && ', '}
                      {m.detail}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
