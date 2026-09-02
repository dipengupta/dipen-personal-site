import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import SectionOverview from '@/components/main/SectionOverview';
import { MUSIC } from '@/content/music';
import { OCTAVIUM } from '@/lib/content/static';
import { sectionById } from '@/lib/main/routes';

export const metadata: Metadata = { title: 'Music' };

export default function MusicPage() {
  return (
    <>
      <PageHeader title="Music" intro={MUSIC.intro} />
      <SectionOverview
        section={sectionById('music')}
        images={{
          '/music/guitars': { src: '/media/images/music/0_GuitarRack.webp', alt: 'The guitar rack' },
          '/music/youtube': { src: '/media/images/music/2024_youtube.webp', alt: 'The YouTube channel' },
          '/music/instagram': { src: '/media/images/music/2024_insta.webp', alt: 'UGG Chronicles on Instagram' },
          '/music/soundcloud': { src: '/media/images/music/soundcloud.webp', alt: 'The Side Project on SoundCloud' },
          '/music/octavium': { src: OCTAVIUM.imagePath, alt: 'Octavium' },
        }}
      />
    </>
  );
}
