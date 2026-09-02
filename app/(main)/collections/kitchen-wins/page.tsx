import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import PhotoGrid from '@/components/main/PhotoGrid';
import { pictureData } from '@/components/main/Picture';
import { getSection } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'Kitchen Wins' };
export const dynamic = 'force-dynamic';

export default async function KitchenWinsPage() {
  const items = await getSection('kitchen');
  return (
    <>
      <PageHeader eyebrow={{ label: 'Collections', href: '/collections' }} title="Kitchen Wins" intro="A rotating set of things I made that came out well." />
      <PhotoGrid items={items.map((k) => ({ ...pictureData(k.imagePath), id: `dish-${k.id}`, alt: k.description || k.title, caption: k.title }))} sizes="(min-width: 900px) 280px, 45vw" />
    </>
  );
}
