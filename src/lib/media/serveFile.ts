import fs from 'node:fs';
import { Readable } from 'node:stream';

/**
 * Stream a local file with the headers browsers need for media: HTTP Range
 * (Safari refuses <video> from endpoints that cannot serve 206), a weak ETag
 * with If-None-Match support, Last-Modified, and immutable caching (media
 * files never change in place; a changed image gets a new name).
 *
 * Callers validate the path; this only checks that it is a regular file.
 */
export interface ServeFileOptions {
  contentType: string;
  /** Default: one year, immutable. */
  cacheControl?: string;
}

const NOT_FOUND = () => new Response('not found', { status: 404 });

export async function serveFile(request: Request, filePath: string, opts: ServeFileOptions): Promise<Response> {
  let stat: fs.Stats;
  try {
    stat = await fs.promises.stat(filePath);
  } catch {
    return NOT_FOUND();
  }
  if (!stat.isFile()) return NOT_FOUND();

  const size = stat.size;
  const etag = `W/"${size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
  const baseHeaders: Record<string, string> = {
    'Content-Type': opts.contentType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': opts.cacheControl ?? 'public, max-age=31536000, immutable',
    ETag: etag,
    'Last-Modified': stat.mtime.toUTCString(),
  };

  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers: baseHeaders });
  }

  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '');
  if (range && (range[1] !== '' || range[2] !== '')) {
    let start: number;
    let end: number;
    if (range[1] === '') {
      // Suffix range: last N bytes.
      const suffix = Math.min(parseInt(range[2], 10), size);
      start = size - suffix;
      end = size - 1;
    } else {
      start = parseInt(range[1], 10);
      end = range[2] === '' ? size - 1 : Math.min(parseInt(range[2], 10), size - 1);
    }
    if (start >= size || start > end) {
      return new Response('range not satisfiable', {
        status: 416,
        headers: { 'Content-Range': `bytes */${size}` },
      });
    }
    const stream = Readable.toWeb(fs.createReadStream(filePath, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: {
        ...baseHeaders,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': String(end - start + 1),
      },
    });
  }

  if (request.method === 'HEAD') {
    return new Response(null, { status: 200, headers: { ...baseHeaders, 'Content-Length': String(size) } });
  }
  const stream = Readable.toWeb(fs.createReadStream(filePath)) as ReadableStream;
  return new Response(stream, { status: 200, headers: { ...baseHeaders, 'Content-Length': String(size) } });
}
