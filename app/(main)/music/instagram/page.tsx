import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/main/PageHeader';
import { MUSIC } from '@/content/music';
import { getSection } from '@/lib/content/queries';

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
      <PageHeader eyebrow={{ label: 'Music', href: '/music' }} title={MUSIC.instagram.heading} intro={MUSIC.instagram.blurb}>
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
      <p className="muted">
        {shown.length} episodes in {year}, newest first. Videos stream from this site and start when you press play.
      </p>
      <div className="grid grid-3" data-testid="ugg-grid">
        {shown.map((e) => (
          <article key={e.episode} className="card video-card" id={`ugg-${e.episode}`}>
            <video controls preload="none" playsInline src={`/api/video/${e.filename}`} aria-label={`Episode ${e.episode}: ${e.name}`} />
            <div className="card-body">
              <h3>
                Ep. {e.episode}: {e.name}
              </h3>
              <p>
                {e.postedAt.slice(0, 10)}
                {e.durationSec ? ` / ${mmss(e.durationSec)}` : ''}
              </p>
              {e.caption && (
                <details className="desc">
                  <summary>Caption</summary>
                  <p style={{ whiteSpace: 'pre-line', marginTop: '0.5rem' }}>{e.caption}</p>
                </details>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
