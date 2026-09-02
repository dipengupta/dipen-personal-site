'use client';

import { useState } from 'react';
import type { PictureData } from './Picture';
import { blurStyle } from './Picture';

export interface UggCardProps {
  episode: number;
  name: string;
  date: string;
  duration: string;
  caption: string;
  videoSrc: string;
  poster: PictureData | null;
}

/**
 * A UGG Chronicles episode as a poster card; the <video> is created when the
 * visitor presses play (the page has up to 80 episodes a year). The first
 * lines of the Instagram caption show under the title; the rest unfolds.
 */
export default function UggCard({ episode, name, date, duration, caption, videoSrc, poster }: UggCardProps) {
  const [playing, setPlaying] = useState(false);
  // Captions open with the episode title; the card already shows it.
  const snippet = caption
    .replace(/^\s*UGG Chronicles\s+Ep\.?\s*\d+[^\n]*\n?/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  return (
    <article className="card video-card" id={`ugg-${episode}`}>
      <div className="card-media portrait">
        {playing ? (
          <video controls autoPlay playsInline src={videoSrc} aria-label={`Episode ${episode}: ${name}`} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
        ) : (
          <button type="button" className="yt-thumb" onClick={() => setPlaying(true)} aria-label={`Play episode ${episode}: ${name}`}>
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster.src} srcSet={poster.srcSet} sizes="(min-width: 900px) 200px, 100vw" width={poster.width} height={poster.height} alt="" loading="lazy" decoding="async" style={blurStyle(poster.blur)} />
            ) : (
              <span className="poster-empty">Ep. {episode}</span>
            )}
            <span className="yt-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <div className="card-body">
        <h3>
          Ep. {episode}: {name}
        </h3>
        <p>
          {date}
          {duration && ` / ${duration}`}
        </p>
        {snippet && (
          <details className="desc">
            <summary className="clamp-2">{snippet}</summary>
            <p style={{ whiteSpace: 'pre-line', marginTop: '0.5rem' }}>{caption}</p>
          </details>
        )}
      </div>
    </article>
  );
}
