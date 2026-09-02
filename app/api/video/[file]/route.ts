import path from 'node:path';
import { videosDir } from '@/lib/media/paths';
import { serveFile } from '@/lib/media/serveFile';

export const dynamic = 'force-dynamic';

/**
 * Streams the UGG Chronicles episodes (MEDIA_DIR/videos/ugg, outside git; see
 * scripts/import-ugg*.ts) with HTTP Range support via the shared media file
 * server. Kept at its historical URL so the iPod and iTunes views are
 * unchanged; the main site uses the same route.
 */
// Strict allowlist; also rules out any path traversal.
const FILENAME = /^ugg-\d{1,4}\.mp4$/;

export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!FILENAME.test(file)) {
    return new Response('not found', { status: 404 });
  }
  return serveFile(request, path.join(videosDir(), file), { contentType: 'video/mp4' });
}
