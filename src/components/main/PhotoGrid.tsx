'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PictureData } from './Picture';
import { blurStyle } from './Picture';

export interface PhotoItem extends PictureData {
  id: string;
  alt: string;
  caption?: string;
  sub?: string;
}

/**
 * A tile grid with a lightbox: click (or Enter) opens the largest variant in
 * a <dialog>; arrows move between photos, Escape closes. Tiles carry `id`s so
 * search deep links can land on a specific photo.
 *
 * `fit` decides how a tile frames its photo. `square` (the default) crops to
 * a uniform grid. `natural` gives every tile the photo's own aspect ratio, so
 * nothing is cropped; rows keep their left-to-right order and go ragged along
 * the bottom, which is the price of showing whole frames. Alison uses
 * `natural`: many of those photos carry a caption burned into the image that
 * a square crop cuts off.
 */
export default function PhotoGrid({ items, sizes = '(min-width: 900px) 220px, 45vw', size = 'md', fit = 'square' }: { items: PhotoItem[]; sizes?: string; size?: 'sm' | 'md' | 'lg'; fit?: 'square' | 'natural' }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? null : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, step]);

  const current = open !== null ? items[open] : null;
  return (
    <>
      <div className={`photo-grid ${size === 'lg' ? 'photo-grid-lg' : size === 'sm' ? 'photo-grid-sm' : ''} ${fit === 'natural' ? 'photo-grid-natural' : ''}`} data-testid="photo-grid">
        {items.map((item, i) => (
          <figure
            key={item.id}
            id={item.id}
            className="photo-tile"
            style={fit === 'natural' && item.width && item.height ? { margin: 0, aspectRatio: `${item.width} / ${item.height}` } : { margin: 0 }}
          >
            <button type="button" onClick={() => setOpen(i)} aria-label={`Open ${item.caption ?? item.alt}`} style={{ all: 'unset', display: 'block', width: '100%', height: '100%', cursor: 'zoom-in' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} srcSet={item.srcSet} sizes={sizes} width={item.width} height={item.height} alt={item.alt} loading="lazy" decoding="async" style={blurStyle(item.blur)} />
            </button>
            {item.caption && (
              <figcaption>
                {item.caption}
                {item.sub && <span className="muted"> {item.sub}</span>}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      <dialog ref={dialogRef} className="lightbox" onClose={() => setOpen(null)} onClick={(e) => e.target === dialogRef.current && setOpen(null)} aria-label="Photo">
        {current && (
          <div className="lightbox-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={current.id} src={current.large} alt={current.alt} decoding="async" />
            <p className="lightbox-caption">
              {current.caption ?? current.alt}
              {current.sub && <span>{current.sub}</span>}
              <span>
                {open! + 1} / {items.length}
              </span>
            </p>
            {items.length > 1 && (
              <>
                <button type="button" className="lightbox-btn lightbox-prev" onClick={() => step(-1)} aria-label="Previous photo">
                  &#8249;
                </button>
                <button type="button" className="lightbox-btn lightbox-next" onClick={() => step(1)} aria-label="Next photo">
                  &#8250;
                </button>
              </>
            )}
            <button type="button" className="lightbox-close" onClick={() => setOpen(null)} aria-label="Close">
              &#215;
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
