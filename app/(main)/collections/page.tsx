import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import SectionOverview from '@/components/main/SectionOverview';
import { MAGNETS } from '@/lib/content/static';
import { sectionById } from '@/lib/main/routes';

export const metadata: Metadata = { title: 'Collections' };

export default function CollectionsPage() {
  const section = sectionById('collections');
  return (
    <>
      <PageHeader title="Collections" intro={section.blurb} />
      <SectionOverview
        section={section}
        images={{
          '/collections/mugs': { src: '/media/images/travel/mugs.webp', alt: 'The mug shelf' },
          '/collections/vinyls-and-magnets': { src: MAGNETS.imagePath, alt: 'Fridge magnets' },
          '/collections/kitchen-wins': { src: '/media/images/contact/pizza.webp', alt: 'Homemade pizza' },
          '/collections/alison': { src: '/media/images/alison/alison-050.webp', alt: 'Alison' },
        }}
      />
    </>
  );
}
