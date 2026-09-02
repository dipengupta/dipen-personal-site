import type { PictureData } from './Picture';
import { blurStyle } from './Picture';

export interface MosaicImage extends PictureData {
  alt: string;
  href: string;
}

/**
 * A slow, endless strip of thumbnails (pure CSS marquee; the track is
 * rendered twice so the loop is seamless). Pauses on hover; static and
 * scrollable under prefers-reduced-motion. Each tile links to its section.
 */
export default function Mosaic({ images }: { images: MosaicImage[] }) {
  const track = (ariaHidden: boolean) => (
    <ul className="mosaic-track" aria-hidden={ariaHidden || undefined}>
      {images.map((img, i) => (
        <li key={`${img.src}-${i}`}>
          <a href={img.href} tabIndex={ariaHidden ? -1 : undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} srcSet={img.srcSet} sizes="200px" width={img.width} height={img.height} alt={img.alt} loading="lazy" decoding="async" style={blurStyle(img.blur)} />
          </a>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="mosaic" data-testid="mosaic">
      {track(false)}
      {track(true)}
    </div>
  );
}
