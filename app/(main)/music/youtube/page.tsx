import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import YouTubeCard from '@/components/main/YouTubeCard';
import { MUSIC } from '@/content/music';
import { listYoutube } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'YouTube' };
export const dynamic = 'force-dynamic';

export default async function YouTubePage() {
  const videos = await listYoutube();
  const years = new Map<string, typeof videos>();
  for (const v of videos) {
    const y = v.publishedAt.slice(0, 4);
    years.set(y, [...(years.get(y) ?? []), v]);
  }
  return (
    <>
      <PageHeader eyebrow={{ label: 'Music', href: '/music' }} title={MUSIC.youtube.heading} intro={MUSIC.youtube.blurb}>
        <a className="btn btn-sm" href={MUSIC.youtube.channelUrl} target="_blank" rel="noopener noreferrer">
          {MUSIC.youtube.cta}
        </a>
      </PageHeader>
      <nav className="pill-row" aria-label="Years">
        {[...years.keys()].map((y) => (
          <a key={y} className="pill" href={`#year-${y}`}>
            {y}
          </a>
        ))}
      </nav>
      {[...years.entries()].map(([year, list]) => (
        <section key={year} className="section" id={`year-${year}`} aria-label={year}>
          <div className="section-head">
            <h2>{year}</h2>
            <span className="muted">{list.length} videos</span>
          </div>
          <div className="grid grid-3">
            {list.map((v) => (
              <YouTubeCard key={v.videoId} videoId={v.videoId} title={v.title} date={v.publishedAt.slice(0, 10)} description={v.description} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
