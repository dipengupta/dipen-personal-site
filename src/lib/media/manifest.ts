import manifestJson from '@/data/media-manifest.json';

/**
 * The committed media manifest (src/data/media-manifest.json) describes every
 * image the site references without needing the files themselves: dimensions
 * (so layouts never shift), the responsive variants that exist, and a tiny
 * blurred placeholder. `npm run media:ingest` writes it; `npm run media:check`
 * and tests/unit/mediaManifest.test.ts keep it honest.
 */
export interface ImageVariant {
  width: number;
  height: number;
}

export interface ImageInfo {
  /** Dimensions of the base file (the URL itself, 800px long edge). */
  width: number;
  height: number;
  /** Dimensions of the original the variants were cut from. */
  source: ImageVariant;
  /** Extra sizes on disk, keyed by long-edge label: "400", "1600". */
  variants: Record<string, ImageVariant>;
  /** data: URI of a ~16px WebP, for a blurred placeholder while loading. */
  blur?: string;
  /** EXIF capture time (ISO 8601) when the original carried one. */
  takenAt?: string;
}

export interface MediaManifest {
  version: 1;
  images: Record<string, ImageInfo>;
}

export const mediaManifest = manifestJson as MediaManifest;

export function imageInfo(url: string): ImageInfo | undefined {
  return mediaManifest.images[url];
}

/** `/media/images/x/y.webp` + "400" -> `/media/images/x/y-400.webp`. */
export function variantUrl(url: string, label: string): string {
  const dot = url.lastIndexOf('.');
  return `${url.slice(0, dot)}-${label}${url.slice(dot)}`;
}

/** A srcset covering every size on disk, base included, ascending by width. */
export function srcSet(url: string): string | undefined {
  const info = imageInfo(url);
  if (!info) return undefined;
  const entries: Array<[string, number]> = [[url, info.width]];
  for (const [label, v] of Object.entries(info.variants)) {
    if (v.width !== info.width) entries.push([variantUrl(url, label), v.width]);
  }
  entries.sort((a, b) => a[1] - b[1]);
  return entries.map(([u, w]) => `${u} ${w}w`).join(', ');
}

/** The largest file available for `url` (hero images, lightboxes). */
export function largestUrl(url: string): string {
  const info = imageInfo(url);
  if (!info) return url;
  let best: [string, number] = [url, info.width];
  for (const [label, v] of Object.entries(info.variants)) {
    if (v.width > best[1]) best = [variantUrl(url, label), v.width];
  }
  return best[0];
}
