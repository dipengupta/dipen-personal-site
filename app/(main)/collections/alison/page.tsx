import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import PhotoGrid from '@/components/main/PhotoGrid';
import { pictureData } from '@/components/main/Picture';
import { getSection } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Alison' };
export const dynamic = 'force-dynamic';

export default async function AlisonPage() {
  const items = await getSection('alison');
  return (
    <>
      <PageHeader eyebrow="Collections" title="Alison" />
      <PhotoGrid items={items.map((a) => ({ ...pictureData(a.imagePath), id: `alison-${a.id}`, alt: `${a.title}, ${a.description}`, caption: a.description }))} size="sm" sizes="(min-width: 900px) 180px, 33vw" />
    </>
  );
}
