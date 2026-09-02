import type { Metadata } from 'next';
import GuitarTimeline from '@/components/main/GuitarTimeline';
import PageHeader from '@/components/main/PageHeader';
import Picture from '@/components/main/Picture';
import { MUSIC } from '@/content/music';
import { getSection } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Guitars' };
export const dynamic = 'force-dynamic';

export default async function GuitarsPage() {
  const guitars = await getSection('guitars');
  const rack = guitars.find((g) => !g.year);
  const dated = guitars.filter((g) => g.year).sort((a, b) => Number(b.year) - Number(a.year) || b.sortOrder - a.sortOrder);
  return (
    <>
      <PageHeader eyebrow="Music" title="Guitars" intro={MUSIC.guitars.blurb} />
      {rack && (
        <figure className="gtl-hero">
          <Picture src={rack.imagePath} alt={rack.name} priority sizes="(min-width: 1160px) 1120px, 100vw" />
          <figcaption className="muted">{rack.description}</figcaption>
        </figure>
      )}
      <GuitarTimeline guitars={dated} />
    </>
  );
}
