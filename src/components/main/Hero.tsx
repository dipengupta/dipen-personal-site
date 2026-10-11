'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PictureData } from './Picture';

export interface HeroImage extends PictureData {
  alt: string;
}

const SWIPE_PX = 40;

/**
 * One photo at a time, crossfading every `intervalMs`. Swipe (or drag with a
 * mouse) left/right to move between photos; arrow keys work when the hero is
 * focused. The next image loads during the interval and the previous one
 * stays mounted through the crossfade. Transitions are opacity-only; the cycle
 * pauses under prefers-reduced-motion, while the tab is hidden, and for a
 * while after a manual swipe or when hovered/focused. Each photo is shown
 * complete (object-fit: contain) beside the intro on the page background.
 */
export default function Hero({
  images,
  intervalMs = 8000,
  children,
}: {
  images: HeroImage[];
  intervalMs?: number;
  children?: React.ReactNode;
}) {
  const [{ index, previous }, setSlide] = useState<{ index: number; previous: number | null }>({ index: 0, previous: null });
  const [reduced, setReduced] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const pausedUntil = useRef(0);
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (images.length < 2) return;
      setSlide(({ index: i }) => ({ index: (i + delta + images.length) % images.length, previous: i }));
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
    if (reduced || hovered || focused || images.length < 2) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => timer && clearInterval(timer);
    const start = () => {
      stop();
      timer = setInterval(() => {
        if (Date.now() < pausedUntil.current) return;
        setSlide(({ index: i }) => ({ index: (i + 1) % images.length, previous: i }));
      }, intervalMs);
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [images.length, intervalMs, reduced, hovered, focused]);

  useEffect(() => {
    if (previous === null) return;
    const timer = setTimeout(() => setSlide((slide) => ({ ...slide, previous: null })), reduced ? 0 : 1600);
    return () => clearTimeout(timer);
  }, [index, previous, reduced]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (drag.current) return;
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      go(e.key === 'ArrowRight' ? 1 : -1);
    }
  };

  if (images.length === 0) return <div className="hero">{children}</div>;
  const next = (index + 1) % images.length;
  const shown = [...new Set([...(previous === null ? [] : [previous]), index, next])];
  const isPortrait = images[index].width < images[index].height;

  return (
    <div
      className={`hero ${dragging ? 'is-dragging' : ''}`}
      data-testid="hero"
      data-orientation={isPortrait ? 'portrait' : 'landscape'}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false); }}
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
          <div key={images[i].src} className={`hero-slide ${i === previous ? 'is-previous' : ''} ${i === index ? 'is-current' : ''}`} aria-hidden={i !== index}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[i].src}
              srcSet={images[i].srcSet}
              sizes="(min-width: 1160px) 560px, (min-width: 900px) 48vw, 90vw"
              width={images[i].width}
              height={images[i].height}
              alt={images[i].alt}
              loading="eager"
              decoding="async"
              fetchPriority={i === index ? 'high' : 'low'}
              className="hero-img"
              draggable={false}
            />
          </div>
        ))}
      </div>
      <div className="hero-content">{children}</div>
    </div>
  );
}
