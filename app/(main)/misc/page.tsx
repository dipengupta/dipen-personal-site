import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import SectionOverview from '@/components/main/SectionOverview';
import { sectionById } from '@/lib/main/routes';

export const metadata: Metadata = { title: 'Misc' };

export default function MiscPage() {
  const section = sectionById('misc');
  return (
    <>
      <PageHeader title="Misc" intro={section.blurb} />
      <SectionOverview section={section} />
    </>
  );
}
