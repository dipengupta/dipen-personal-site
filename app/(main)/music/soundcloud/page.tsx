import type { Metadata } from 'next';
import PageHeader from '@/components/main/PageHeader';
import { MUSIC } from '@/content/music';
import { listSoundcloud } from '@/lib/content/queries';

export const metadata: Metadata = { title: 'SoundCloud' };
export const dynamic = 'force-dynamic';

export default function SoundCloudPage() {
  const tracks = listSoundcloud();
  const player = `https://w.soundcloud.com/player/?url=${encodeURIComponent(MUSIC.soundcloud.tracksUrl)}&color=%23b3451f&auto_play=false&show_user=true&show_teaser=false`;
  return (
    <>
      <PageHeader eyebrow={{ label: 'Music', href: '/music' }} title={MUSIC.soundcloud.heading} intro={MUSIC.soundcloud.blurb}>
        <a className="btn btn-sm" href={MUSIC.soundcloud.profileUrl} target="_blank" rel="noopener noreferrer">
          {MUSIC.soundcloud.cta}
        </a>
      </PageHeader>
      <iframe className="embed" title="SoundCloud player" height={450} src={player} allow="autoplay" loading="lazy" />
      {tracks.length > 0 && (
        <ul className="list-plain section">
          {tracks.map((t) => (
            <li key={t.id} className="row">
              <a href={t.url} target="_blank" rel="noopener noreferrer">
                {t.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
