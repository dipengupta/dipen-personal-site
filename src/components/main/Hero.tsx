'use client';

import { useEffect, useState } from 'react';
import type { PictureData } from './Picture';
import { blurStyle } from './Picture';

export interface HeroImage extends PictureData {
  alt: string;
  caption: string;
}

/**
 * The homepage hero: one photo at a time, crossfading every `intervalMs`.
 * Only the current and the next image are mounted (the next one loads during
 * the interval), transitions are opacity-only, and the cycle pauses under
 * prefers-reduced-motion or while the tab is hidden.
 */
export default function Hero({ images, intervalMs = 8000, children }: { images: HeroImage[]; intervalMs?: number; children?: React.ReactNode }) {
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
    const start = () => {
      stop();
      timer = setInterval(() => setIndex((i) => (i + 1) % images.length), intervalMs);
    };
    const stop = () => timer && clearInterval(timer);
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [images.length, intervalMs, reduced]);

  if (images.length === 0) return <div className="hero hero-empty">{children}</div>;
  const next = (index + 1) % images.length;
  const shown = images.length > 1 ? [index, next] : [index];

  return (
    <div className="hero" data-testid="hero">
      <div className="hero-stage" aria-live="off">
        {shown.map((i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={images[i].src}
            src={images[i].src}
            srcSet={images[i].srcSet}
            sizes="100vw"
            width={images[i].width}
            height={images[i].height}
            alt={images[i].alt}
            loading={i === index ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={i === index ? 'high' : 'low'}
            className={`hero-img ${i === index ? 'is-current' : ''}`}
            style={blurStyle(images[i].blur)}
          />
        ))}
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">{children}</div>
      <p className="hero-caption">{images[index].caption}</p>
      <ol className="hero-dots" aria-label="Hero photos">
        {images.map((img, i) => (
          <li key={img.src}>
            <button type="button" aria-label={`Show ${img.caption}`} aria-current={i === index || undefined} onClick={() => setIndex(i)} />
          </li>
        ))}
      </ol>
    </div>
  );
}
