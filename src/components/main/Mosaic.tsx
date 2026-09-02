'use client';

import { useEffect, useRef } from 'react';
import type { PictureData } from './Picture';
import { blurStyle } from './Picture';

export interface MosaicImage extends PictureData {
  alt: string;
  href: string;
}

const AUTO_PX_PER_SEC = 22;
const FRICTION = 0.94; // velocity kept per frame after a fling (~60fps)
const DRAG_THRESHOLD = 6;

/**
 * An endless strip of thumbnails you can grab. It drifts slowly on its own,
 * follows the pointer while dragging, keeps the fling momentum with friction
 * (the way lists scroll on iOS), then drifts again. The track is rendered
 * twice so the loop is seamless; a drag never triggers the tile links.
 * Under prefers-reduced-motion it does not drift but still drags.
 */
export default function Mosaic({ images }: { images: MosaicImage[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let offset = 0; // px scrolled to the left
    let velocity = 0; // px per second while flinging
    let dragging = false;
    let dragMoved = false;
    let lastX = 0;
    let lastT = 0;
    let idleSince = 0;
    let raf = 0;
    let last = performance.now();

    const loopWidth = () => track.scrollWidth / 2;
    const apply = () => {
      const w = loopWidth();
      if (w > 0) offset = ((offset % w) + w) % w;
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragging) {
        if (Math.abs(velocity) > 5) {
          offset += velocity * dt;
          velocity *= Math.pow(FRICTION, dt * 60);
        } else {
          velocity = 0;
          const resting = document.hidden || (viewport.matches(':hover') && !dragMoved) || reduced;
          if (!resting && now - idleSince > 900) offset += AUTO_PX_PER_SEC * dt;
        }
        apply();
      }
      raf = requestAnimationFrame(frame);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      dragging = true;
      dragMoved = false;
      velocity = 0;
      lastX = e.clientX;
      lastT = performance.now();
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add('is-dragging');
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const now = performance.now();
      if (Math.abs(dx) > DRAG_THRESHOLD) dragMoved = true;
      offset -= dx;
      const dt = Math.max(1, now - lastT) / 1000;
      velocity = velocity * 0.6 + (-dx / dt) * 0.4;
      lastX = e.clientX;
      lastT = now;
      apply();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      idleSince = performance.now();
      viewport.classList.remove('is-dragging');
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      // If the pointer rested before release, there is no fling.
      if (performance.now() - lastT > 80) velocity = 0;
      setTimeout(() => {
        dragMoved = false;
      }, 0);
    };
    const onClick = (e: MouseEvent) => {
      if (dragMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      offset += e.deltaX;
      idleSince = performance.now();
      apply();
    };

    viewport.addEventListener('pointerdown', onDown);
    viewport.addEventListener('pointermove', onMove);
    viewport.addEventListener('pointerup', onUp);
    viewport.addEventListener('pointercancel', onUp);
    viewport.addEventListener('click', onClick, true);
    viewport.addEventListener('wheel', onWheel, { passive: false });
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      viewport.removeEventListener('pointerdown', onDown);
      viewport.removeEventListener('pointermove', onMove);
      viewport.removeEventListener('pointerup', onUp);
      viewport.removeEventListener('pointercancel', onUp);
      viewport.removeEventListener('click', onClick, true);
      viewport.removeEventListener('wheel', onWheel);
    };
  }, [images.length]);

  const tiles = (ariaHidden: boolean) =>
    images.map((img, i) => (
      <li key={`${img.src}-${i}-${ariaHidden ? 'b' : 'a'}`}>
        <a href={img.href} tabIndex={ariaHidden ? -1 : undefined} draggable={false}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} srcSet={img.srcSet} sizes="240px" width={img.width} height={img.height} alt={img.alt} loading="lazy" decoding="async" draggable={false} style={blurStyle(img.blur)} />
        </a>
      </li>
    ));

  return (
    <div ref={viewportRef} className="mosaic" data-testid="mosaic" aria-label="Photos; drag to scroll">
      <div ref={trackRef} className="mosaic-track-wrap">
        <ul className="mosaic-track">{tiles(false)}</ul>
        <ul className="mosaic-track" aria-hidden="true">
          {tiles(true)}
        </ul>
      </div>
    </div>
  );
}
