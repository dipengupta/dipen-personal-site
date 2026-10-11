'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PictureData } from './Picture';

export interface HeroImage extends PictureData {
  alt: string;
}

type Drag = {
  id: number;
  x: number;
  y: number;
  base: number;
  width: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  axis: 'x' | 'y' | null;
};

const transform = (x: number) => `translate3d(${x}px, 0, 0)`;

/** Three preloaded frames follow the pointer, then settle into place on release. */
export default function Hero({ images, intervalMs = 8000, children }: {
  images: HeroImage[];
  intervalMs?: number;
  children?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const animation = useRef<Animation | null>(null);
  const offset = useRef(0);
  const paintFrame = useRef(0);
  const pausedUntil = useRef(0);

  const paint = useCallback((x: number, immediate = false) => {
    offset.current = x;
    if (immediate) {
      cancelAnimationFrame(paintFrame.current);
      paintFrame.current = 0;
      if (trackRef.current) trackRef.current.style.transform = transform(x);
    } else if (!paintFrame.current) {
      paintFrame.current = requestAnimationFrame(() => {
        paintFrame.current = 0;
        if (trackRef.current) trackRef.current.style.transform = transform(offset.current);
      });
    }
  }, []);

  const settle = useCallback((delta: number) => {
    const track = trackRef.current;
    const width = stageRef.current?.getBoundingClientRect().width;
    if (!track || !width) return;
    paint(offset.current, true);
    const target = -delta * width;
    const finish = () => {
      if (delta) {
        // Keep the final frame in place until React recenters all three panes.
        setIndex((i) => (i + delta + images.length) % images.length);
      } else {
        animation.current?.cancel();
        animation.current = null;
        paint(0, true);
      }
    };
    if (reduced || Math.abs(target - offset.current) < 1) {
      paint(target, true);
      finish();
      return;
    }
    const motion = track.animate(
      [{ transform: transform(offset.current) }, { transform: transform(target) }],
      { duration: delta ? 320 : 240, easing: 'cubic-bezier(0.22, 0.75, 0.16, 1)', fill: 'forwards' },
    );
    animation.current = motion;
    motion.finished.then(() => {
      if (animation.current === motion) finish();
    }).catch(() => { /* A new gesture can interrupt the settling animation. */ });
  }, [images.length, paint, reduced]);

  const go = useCallback((delta: number, manual = true) => {
    if (images.length < 2 || drag.current || animation.current) return;
    if (manual) pausedUntil.current = Date.now() + intervalMs * 2;
    settle(delta);
  }, [images.length, intervalMs, settle]);

  useLayoutEffect(() => {
    animation.current?.cancel();
    animation.current = null;
    paint(0, true);
  }, [index, paint]);

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
        if (Date.now() >= pausedUntil.current) go(1, false);
      }, intervalMs);
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [go, images.length, intervalMs, reduced, hovered, focused]);

  useEffect(() => {
    // Decode both neighbors ahead of a swipe, including the backwards frame.
    trackRef.current?.querySelectorAll('img').forEach((img) => { void img.decode().catch(() => {}); });
  }, [index, images]);

  useEffect(() => {
    const reset = () => {
      drag.current = null;
      setDragging(false);
      animation.current?.cancel();
      animation.current = null;
      paint(0, true);
    };
    const observer = new ResizeObserver(reset);
    if (stageRef.current) observer.observe(stageRef.current);
    return () => {
      observer.disconnect();
      animation.current?.cancel();
      cancelAnimationFrame(paintFrame.current);
    };
  }, [paint]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (images.length < 2 || drag.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const track = trackRef.current;
    if (!track) return;
    const matrix = getComputedStyle(track).transform;
    const current = matrix === 'none' ? 0 : new DOMMatrixReadOnly(matrix).m41;
    animation.current?.cancel();
    animation.current = null;
    paint(current, true);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, base: current, width: e.currentTarget.getBoundingClientRect().width, lastX: e.clientX, lastTime: e.timeStamp, velocity: 0, axis: null };
    pausedUntil.current = Date.now() + intervalMs * 2;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.axis && Math.max(Math.abs(dx), Math.abs(dy)) >= 6) {
      d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (d.axis !== 'x') return;
    d.velocity = d.velocity * 0.6 + (e.clientX - d.lastX) / Math.max(16, e.timeStamp - d.lastTime) * 0.4;
    d.lastX = e.clientX;
    d.lastTime = e.timeStamp;
    paint(Math.max(-d.width, Math.min(d.width, d.base + dx)));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    const velocity = e.timeStamp - d.lastTime > 100 ? 0 : Math.max(-2.5, Math.min(2.5, d.velocity));
    const projected = offset.current + velocity * 140;
    const commit = d.axis === 'x' && Math.abs(offset.current) > 16 && projected * offset.current > 0 && Math.abs(projected) >= Math.min(90, d.width * 0.2);
    settle(commit ? (projected < 0 ? 1 : -1) : 0);
  };

  const cancelDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    settle(0);
  };

  if (images.length === 0) return <div className="hero">{children}</div>;
  const panes = images.length === 1 ? [{ i: index, position: 0 }] : [-1, 0, 1].map((position) => ({
    i: (index + position + images.length) % images.length, position,
  }));

  return (
    <div
      className={`hero ${dragging ? 'is-dragging' : ''}`}
      data-testid="hero"
      data-orientation={images[index].width < images[index].height ? 'portrait' : 'landscape'}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false); }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          go(e.key === 'ArrowRight' ? 1 : -1);
        }
      }}
      tabIndex={images.length > 1 ? 0 : undefined}
      role={images.length > 1 ? 'group' : undefined}
      aria-label={images.length > 1 ? 'Photos; swipe or use the arrow keys' : undefined}
    >
      <div ref={stageRef} className="hero-stage" aria-live="off" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag}>
        <div ref={trackRef} className="hero-track">
          {panes.map(({ i, position }) => (
            <div key={images.length === 2 ? `${images[i].src}-${position}` : images[i].src} className={`hero-slide ${position === 0 ? 'is-current' : ''}`} style={{ transform: `translate3d(${position * 100}%, 0, 0)` }} aria-hidden={position !== 0}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[i].src} srcSet={images[i].srcSet} sizes="(min-width: 1160px) 560px, (min-width: 900px) 48vw, 90vw" width={images[i].width} height={images[i].height} alt={images[i].alt} loading="eager" decoding="async" fetchPriority={position === 0 ? 'high' : 'low'} className="hero-img" draggable={false} />
            </div>
          ))}
        </div>
      </div>
      <div className="hero-content">{children}</div>
    </div>
  );
}
