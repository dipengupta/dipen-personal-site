import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import PhotoGrid, { type PhotoItem } from '@/components/main/PhotoGrid';
import { pictureData } from '@/components/main/Picture';
import { MUSIC } from '@/content/music';
import { getSection } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Guitars' };
export const dynamic = 'force-dynamic';

export default async function GuitarsPage() {
  const guitars = await getSection('guitars');
  const items: PhotoItem[] = guitars.map((g) => ({
    ...pictureData(g.imagePath),
    id: `guitar-${g.id}`,
    alt: g.name,
    caption: g.name,
    sub: g.year || undefined,
  }));
  return (
    <>
      <PageHeader eyebrow={{ label: 'Music', href: '/music' }} title="Guitars" intro={MUSIC.guitars.blurb} />
      <PhotoGrid items={items} sizes="(min-width: 900px) 280px, 45vw" />
      <section className="section">
        <ul className="list-plain">
          {guitars.map((g) => (
            <li key={g.id} className="row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span className="row-title">{g.name}</span>
                {g.year && <span className="row-meta">{g.year}</span>}
              </div>
              <p className="muted" style={{ margin: 0 }}>
                {g.description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
