import path from 'node:path';

/**
 * Where media lives. Media (photos, videos) is deliberately outside the git
 * repo: locally in ./media, in Docker/Fly on the /data volume. Everything that
 * touches files on disk resolves through these helpers so one env var moves
 * the whole tree. See docs/adr/0002-media-outside-repo.md.
 */
export function mediaDir(): string {
  // Read per call so tests and Docker can point elsewhere via env.
  return process.env.MEDIA_DIR ?? path.join(process.cwd(), 'media');
}

export function imagesDir(): string {
  return path.join(mediaDir(), 'images');
}

/** UGG Chronicles episodes. VIDEOS_DIR still overrides for compatibility. */
export function videosDir(): string {
  return process.env.VIDEOS_DIR ?? path.join(mediaDir(), 'videos', 'ugg');
}

/** Public URL prefix the media route serves from. */
export const MEDIA_URL_PREFIX = '/media';

/** Disk path of a public media URL like /media/images/home/main.webp, or null if it is not one. */
export function mediaPathFromUrl(url: string): string | null {
  if (!url.startsWith(`${MEDIA_URL_PREFIX}/`)) return null;
  const rel = url.slice(MEDIA_URL_PREFIX.length + 1);
  if (!rel || rel.split('/').some((seg) => !isSafeSegment(seg))) return null;
  return path.join(mediaDir(), ...rel.split('/'));
}

/** One path segment: no traversal, no hidden files, no separators. */
export function isSafeSegment(seg: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(seg) && seg !== '..' && !seg.endsWith('.');
}
