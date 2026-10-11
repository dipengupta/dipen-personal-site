import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import PhotoGrid from '@/components/main/PhotoGrid';
import { pictureData } from '@/components/main/Picture';
import { ABOUT } from '@/content/site';
import { getSection } from '@/lib/content/queries';
import { photoMosaicRows, shufflePhotos } from '@/lib/main/photos';

export const metadata: Metadata = { title: 'Photos' };
export const dynamic = 'force-dynamic';

export default async function PhotosPage() {
  const photos = shufflePhotos(await getSection('photos'));
  const items = photos.map((photo) => ({
    ...pictureData(photo.imagePath),
    id: `photo-${photo.id}`,
    alt: photo.title,
    caption: photo.title,
    sub: photo.description || undefined,
  }));
  return (
    <>
      <PageHeader eyebrow="About" title="Photos" intro={ABOUT.photosIntro} />
      <PhotoGrid items={items} fit="mosaic" rowLengths={photoMosaicRows(items.length)} sizes="(min-width: 1160px) 420px, (min-width: 900px) 36vw, 90vw" />
    </>
  );
}
