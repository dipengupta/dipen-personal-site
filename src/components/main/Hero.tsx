'use client';

import { useEffect, useState } from 'react';
import type { PictureData } from './Picture';
import { blurStyle } from './Picture';

export interface HeroImage extends PictureData {
  alt: string;
}

/**
 * One photo at a time, crossfading every `intervalMs`. Only the current and
 * the next image are mounted (the next one loads during the interval),
 * transitions are opacity-only, and the cycle pauses under
 * prefers-reduced-motion or while the tab is hidden. Each photo is shown
 * complete (object-fit: contain) over a blurred, enlarged copy of itself, so
 * portraits look right on a wide desktop hero and landscapes on a phone.
 */
export default function Hero({
  images,
  intervalMs = 8000,
  compact = false,
  children,
}: {
  images: HeroImage[];
  intervalMs?: number;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduced || images.length < 2) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => timer && clearInterval(timer);
    const start = () => {
      stop();
      timer = setInterval(() => setIndex((i) => (i + 1) % images.length), intervalMs);
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [images.length, intervalMs, reduced]);

  if (images.length === 0) return <div className={`hero ${compact ? 'hero-compact' : ''}`}>{children}</div>;
  const next = (index + 1) % images.length;
  const shown = images.length > 1 ? [index, next] : [index];

  return (
    <div className={`hero ${compact ? 'hero-compact' : ''}`} data-testid="hero">
      <div className="hero-stage" aria-live="off">
        {shown.map((i) => (
          <div key={images[i].src} className={`hero-slide ${i === index ? 'is-current' : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[i].src} sizes="100vw" width={images[i].width} height={images[i].height} alt="" aria-hidden="true" className="hero-bg" loading={i === index ? 'eager' : 'lazy'} decoding="async" style={blurStyle(images[i].blur)} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[i].src}
              srcSet={images[i].srcSet}
              sizes="100vw"
              width={images[i].width}
              height={images[i].height}
              alt={images[i].alt}
              loading={i === index ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={i === index ? 'high' : 'low'}
              className="hero-img"
            />
          </div>
        ))}
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">{children}</div>
      <ol className="hero-dots" aria-label="Photos">
        {images.map((img, i) => (
          <li key={img.src}>
            <button type="button" aria-label={`Photo ${i + 1}`} aria-current={i === index || undefined} onClick={() => setIndex(i)} />
          </li>
        ))}
      </ol>
    </div>
  );
}
