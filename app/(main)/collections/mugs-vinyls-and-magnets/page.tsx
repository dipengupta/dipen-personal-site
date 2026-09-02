import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import Picture from '@/components/main/Picture';
import { getSection } from '@/lib/content/queries';
import { MAGNETS, VINYLS } from '@/lib/content/static';

export const metadata: Metadata = { title: 'Mugs, Vinyls and Magnets' };
export const dynamic = 'force-dynamic';

const GROUPS: Array<{ key: 'state' | 'city' | 'country' | 'special'; label: string }> = [
  { key: 'state', label: 'States' },
  { key: 'city', label: 'Cities' },
  { key: 'country', label: 'Countries' },
  { key: 'special', label: 'Special' },
];

export default async function CollectiblesPage() {
  const mugs = await getSection('mugs');
  return (
    <>
      <PageHeader eyebrow="Collections" title="Mugs, Vinyls and Magnets" />
      <nav className="pill-row" aria-label="On this page">
        <a className="pill" href="#mugs">
          Mugs
        </a>
        <a className="pill" href="#vinyls">
          Vinyls
        </a>
        <a className="pill" href="#magnets">
          Fridge Magnets
        </a>
      </nav>

      <section id="mugs" className="section" aria-labelledby="mugs-heading">
        <h2 id="mugs-heading">Mug Collection</h2>
        <Picture src="/media/images/travel/mugs.webp" alt="The mug shelf" priority style={{ borderRadius: 'var(--radius)', marginBottom: '1.5rem' }} />
        {GROUPS.map((g) => {
          const rows = mugs.filter((m) => m.category === g.key);
          if (!rows.length) return null;
          return (
            <div key={g.key}>
              <div className="group-head">
                <h2 style={{ fontSize: '1.25rem' }}>{g.label}</h2>
                <span className="muted">{rows.length}</span>
              </div>
              <ul className="compact-list">
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
            </div>
          );
        })}
      </section>

      {[VINYLS, MAGNETS].map((s) => (
        <section key={s.title} className="section static-photo" id={s.title === 'Vinyls' ? 'vinyls' : 'magnets'}>
          <Picture src={s.imagePath} alt={s.title} sizes="(min-width: 900px) 660px, 100vw" />
          <div>
            <h2>{s.title}</h2>
            <p className="lead">{s.text}</p>
          </div>
        </section>
      ))}
    </>
  );
}
