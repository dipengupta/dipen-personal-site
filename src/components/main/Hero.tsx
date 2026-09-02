'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PictureData } from './Picture';
import { blurStyle } from './Picture';

export interface HeroImage extends PictureData {
  alt: string;
}

const SWIPE_PX = 40;

/**
 * One photo at a time, crossfading every `intervalMs`. Swipe (or drag with a
 * mouse) left/right to move between photos; arrow keys work when the hero is
 * focused. Only the current and the next image are mounted (the next one
 * loads during the interval), transitions are opacity-only, and the cycle
 * pauses under prefers-reduced-motion, while the tab is hidden, and for a
 * while after a manual swipe. Each photo is shown complete (object-fit:
 * contain) over a blurred, enlarged copy of itself.
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
  const [dragging, setDragging] = useState(false);
  const pausedUntil = useRef(0);
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (images.length < 2) return;
      setIndex((i) => (i + delta + images.length) % images.length);
      pausedUntil.current = Date.now() + intervalMs * 2;
    },
    [images.length, intervalMs],
  );

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
      timer = setInterval(() => {
        if (Date.now() < pausedUntil.current) return;
        setIndex((i) => (i + 1) % images.length);
      }, intervalMs);
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [images.length, intervalMs, reduced]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    setDragging(true);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };

  if (images.length === 0) return <div className={`hero ${compact ? 'hero-compact' : ''}`}>{children}</div>;
  const next = (index + 1) % images.length;
  const shown = images.length > 1 ? [index, next] : [index];

  return (
    <div
      className={`hero ${compact ? 'hero-compact' : ''} ${dragging ? 'is-dragging' : ''}`}
      data-testid="hero"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current = null;
        setDragging(false);
      }}
      onKeyDown={onKeyDown}
      tabIndex={images.length > 1 ? 0 : undefined}
      role={images.length > 1 ? 'group' : undefined}
      aria-label={images.length > 1 ? 'Photos; swipe or use the arrow keys' : undefined}
    >
      <div className="hero-stage" aria-live="off">
        {shown.map((i) => (
          <div key={images[i].src} className={`hero-slide ${i === index ? 'is-current' : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[i].src} sizes="100vw" width={images[i].width} height={images[i].height} alt="" aria-hidden="true" className="hero-bg" loading="lazy" decoding="async" draggable={false} style={blurStyle(images[i].blur)} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[i].src}
              srcSet={images[i].srcSet}
              sizes="100vw"
              width={images[i].width}
              height={images[i].height}
              alt={images[i].alt}
              loading="lazy"
              decoding="async"
              fetchPriority={i === index ? 'high' : 'low'}
              className="hero-img"
              draggable={false}
            />
          </div>
        ))}
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">{children}</div>
      <ol className="hero-dots" aria-label="Photos">
        {images.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              aria-label={`Photo ${i + 1}`}
              aria-current={i === index || undefined}
              onClick={() => {
                setIndex(i);
                pausedUntil.current = Date.now() + intervalMs * 2;
              }}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
