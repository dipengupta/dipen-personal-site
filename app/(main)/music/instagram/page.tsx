import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/main/PageHeader';
import { pictureData } from '@/components/main/Picture';
import UggCard from '@/components/main/UggCard';
import { MUSIC } from '@/content/music';
import { getSection } from '@/lib/content/queries';
import { imageInfo } from '@/lib/media/manifest';

export const metadata: Metadata = { title: 'Instagram: UGG Chronicles' };
export const dynamic = 'force-dynamic';

function mmss(sec: number | null): string {
  if (!sec) return '';
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export default async function InstagramPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const [{ year: yearParam }, episodes] = await Promise.all([searchParams, getSection('ugg')]);
  const years = [...new Set(episodes.map((e) => e.year))].sort((a, b) => b - a);
  const year = years.includes(Number(yearParam)) ? Number(yearParam) : years[0];
  const shown = episodes.filter((e) => e.year === year);
  return (
    <>
      <PageHeader eyebrow="Music" title={MUSIC.instagram.heading} intro={MUSIC.instagram.blurb}>
        <a className="btn btn-sm" href={MUSIC.instagram.profileUrl} target="_blank" rel="noopener noreferrer">
          {MUSIC.instagram.cta}
        </a>
      </PageHeader>
      <nav className="pill-row" aria-label="Years">
        {years.map((y) => (
          <Link key={y} className="pill" href={`/music/instagram?year=${y}`} aria-current={y === year || undefined}>
            {y}
          </Link>
        ))}
      </nav>
      <div className="grid grid-3" data-testid="ugg-grid">
        {shown.map((e) => {
          const posterUrl = `/media/images/ugg/ugg-${e.episode}.webp`;
          return (
            <UggCard
              key={e.episode}
              episode={e.episode}
              name={e.name}
              date={e.postedAt.slice(0, 10)}
              duration={mmss(e.durationSec)}
              caption={e.caption}
              videoSrc={`/api/video/${e.filename}`}
              poster={imageInfo(posterUrl) ? pictureData(posterUrl) : null}
            />
          );
        })}
      </div>
    </>
  );
}
