import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import Picture from '@/components/main/Picture';
import { OCTAVIUM } from '@/lib/content/static';

export const metadata: Metadata = { title: 'Octavium' };

export default function OctaviumPage() {
  return (
    <>
      <PageHeader eyebrow="Music" title={OCTAVIUM.title} />
      <div className="static-photo">
        <Picture src={OCTAVIUM.imagePath} alt="Octavium on stage" priority sizes="(min-width: 900px) 660px, 100vw" />
        <p className="lead">{OCTAVIUM.text}</p>
      </div>
    </>
  );
}
