'use client';

import { useMemo, useState } from 'react';

export interface TweetCardData {
  number: number | null;
  text: string;
  date: string;
  url: string | null;
}

const PAGE = 60;

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The pennguytweets archive: newest first, or shuffled; reveals more on demand. */
export default function TweetFeed({ tweets, handle }: { tweets: TweetCardData[]; handle: string }) {
  const [mode, setMode] = useState<'latest' | 'shuffle'>('latest');
  const [seed, setSeed] = useState(0);
  const [shown, setShown] = useState(PAGE);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ordered = useMemo(() => (mode === 'latest' ? tweets : shuffle(tweets)), [mode, seed, tweets]);
  const visible = ordered.slice(0, shown);
  return (
    <>
      <div className="pill-row" role="group" aria-label="Order">
        <button type="button" className="pill" aria-current={mode === 'latest' || undefined} onClick={() => setMode('latest')}>
          Newest first
        </button>
        <button
          type="button"
          className="pill"
          aria-current={mode === 'shuffle' || undefined}
          onClick={() => {
            setMode('shuffle');
            setSeed((s) => s + 1);
            setShown(PAGE);
          }}
        >
          Shuffle
        </button>
      </div>
      <ol className="tweets" data-testid="tweet-feed">
        {visible.map((t) => (
          <li key={t.number ?? t.text} className="tweet" id={t.number != null ? `tweet-${t.number}` : undefined}>
            <div className="tweet-head">
              <strong>{handle}</strong>
              {t.number != null && <span className="muted">#{t.number}</span>}
            </div>
            <p>{t.text}</p>
            <div className="tweet-foot muted">
              <time dateTime={t.date}>{new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</time>
              {t.url && (
                <a href={t.url} target="_blank" rel="noopener noreferrer">
                  View on X
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
      {shown < ordered.length && (
        <p style={{ textAlign: 'center' }}>
          <button type="button" className="btn" onClick={() => setShown((n) => n + PAGE)}>
            Show more ({ordered.length - shown} left)
          </button>
        </p>
      )}
    </>
  );
}
