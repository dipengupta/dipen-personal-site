'use client';

import { useState } from 'react';

/**
 * A YouTube video as a lightweight thumbnail; the (privacy-enhanced) iframe
 * is only created when the visitor presses play, so a page of 77 videos
 * costs 77 small images rather than 77 players.
 */
export default function YouTubeCard({ videoId, title, date, description }: { videoId: string; title: string; date: string; description: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <article className="card" id={`yt-${videoId}`}>
      <div className="card-media" style={{ aspectRatio: '16 / 9' }}>
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 0 }}
          />
        ) : (
          <button type="button" className="yt-thumb" onClick={() => setPlaying(true)} aria-label={`Play ${title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" width={480} height={360} loading="lazy" decoding="async" />
            <span className="yt-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <div className="card-body">
        <h3>{title}</h3>
        <p>{date}</p>
        {description && (
          <details className="desc">
            <summary>Description</summary>
            <p style={{ whiteSpace: 'pre-line', marginTop: '0.5rem' }}>{description}</p>
          </details>
        )}
      </div>
    </article>
  );
}
