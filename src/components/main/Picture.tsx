import type { CSSProperties } from 'react';
import { imageInfo, largestUrl, srcSet } from '@/lib/media/manifest';

/**
 * A responsive <img> for images in the media manifest: srcset over every
 * variant on disk, intrinsic width/height (no layout shift) and a blurred
 * placeholder painted behind the image while it loads (which also stands in
 * gracefully when the file is missing on a fresh clone).
 */
export interface PictureData {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  blur?: string;
  /** Largest variant, for lightboxes and hero backgrounds. */
  large: string;
}

/** Everything a client component needs to render the same image. */
export function pictureData(src: string): PictureData {
  const info = imageInfo(src);
  return {
    src,
    srcSet: srcSet(src),
    width: info?.width ?? 800,
    height: info?.height ?? 600,
    blur: info?.blur,
    large: largestUrl(src),
  };
}

export interface PictureProps {
  src: string;
  alt: string;
  /** The `sizes` hint; defaults to a full-width image capped at the container. */
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function blurStyle(blur?: string): CSSProperties | undefined {
  return blur ? { backgroundImage: `url(${blur})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined;
}

export default function Picture({ src, alt, sizes = '(min-width: 1160px) 1120px, 100vw', priority, className, style }: PictureProps) {
  const data = pictureData(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={data.src}
      srcSet={data.srcSet}
      sizes={sizes}
      width={data.width}
      height={data.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      className={className}
      style={{ ...blurStyle(data.blur), ...style }}
    />
  );
}
