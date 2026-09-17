import type { Metadata } from 'next';
import AlisonGrid from '@/components/main/AlisonGrid';
import PageHeader from '@/components/main/PageHeader';
import { pictureData } from '@/components/main/Picture';
import { getSection } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Alison' };
export const dynamic = 'force-dynamic';

export default async function AlisonPage() {
  const items = await getSection('alison');
  const photos = items
    .filter((a) => !a.quote)
    .map((a) => ({ ...pictureData(a.imagePath), id: `alison-${a.id}`, alt: `${a.title}, ${a.description}`, caption: a.description }));
  // The quote is on the image already, so it stands in for the caption and
  // becomes the alt text a screen reader would otherwise have no way to reach.
  const quotes = items
    .filter((a) => a.quote)
    .map((a) => ({ ...pictureData(a.imagePath), id: `alison-${a.id}`, alt: a.quote as string }));
  return (
    <>
      <PageHeader eyebrow="Collections" title="Alison" />
      <AlisonGrid photos={photos} quotes={quotes} />
    </>
  );
}
