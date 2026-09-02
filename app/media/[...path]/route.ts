import fs from 'node:fs';
import path from 'node:path';
import { isSafeSegment, mediaDir } from '@/lib/media/paths';
import { serveFile } from '@/lib/media/serveFile';

export const dynamic = 'force-dynamic';

/**
 * Serves MEDIA_DIR (images, videos) at /media/... for every view.
 *
 * Hardening: each segment must match a conservative allowlist (no dotfiles,
 * no traversal), the extension must be a known media type, and both the
 * resolved path and its realpath must stay inside MEDIA_DIR (a symlink cannot
 * point out of the tree). Anything else is a plain 404.
 */
const CONTENT_TYPES: Record<string, string> = {
  webp: 'image/webp',
  avif: 'image/avif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  pdf: 'application/pdf',
};

const notFound = () => new Response('not found', { status: 404 });

async function resolveInsideRoot(root: string, segments: string[]): Promise<string | null> {
  let rootReal: string;
  try {
    rootReal = await fs.promises.realpath(root);
  } catch {
    return null; // no media directory at all (fresh clone)
  }
  const target = path.resolve(rootReal, ...segments);
  if (!target.startsWith(rootReal + path.sep)) return null;
  try {
    const real = await fs.promises.realpath(target);
    if (!real.startsWith(rootReal + path.sep)) return null;
    return real;
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  if (!Array.isArray(segments) || segments.length === 0 || !segments.every(isSafeSegment)) return notFound();
  const ext = path.extname(segments[segments.length - 1]).slice(1).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) return notFound();

  const filePath = await resolveInsideRoot(mediaDir(), segments);
  if (!filePath) return notFound();
  return serveFile(request, filePath, { contentType });
}

export { GET as HEAD };
