/**
 * Media integrity check (`npm run media:check`):
 *   1. every image URL referenced by seed data / static content is in the manifest
 *   2. every manifest entry (base + variants) exists under MEDIA_DIR
 *   3. every UGG episode in ugg.json has its MP4 under MEDIA_DIR/videos/ugg
 * Exits 1 when anything is missing. Run it before `fly deploy` and after a
 * media sync. The manifest half (1) also runs as a unit test, so CI without
 * media files still catches a dangling reference.
 */
import fs from 'node:fs';
import path from 'node:path';
import { referencedImageUrls } from '../../src/lib/media/references';
import { mediaDir, mediaPathFromUrl, videosDir } from '../../src/lib/media/paths';

interface Manifest {
  images: Record<string, { variants: Record<string, unknown> }>;
}

const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/media-manifest.json'), 'utf8')) as Manifest;
const problems: string[] = [];

for (const url of referencedImageUrls()) {
  if (!manifest.images[url]) problems.push(`referenced but not in manifest: ${url}`);
}

for (const [url, info] of Object.entries(manifest.images)) {
  const base = mediaPathFromUrl(url);
  if (!base) {
    problems.push(`manifest key is not a media URL: ${url}`);
    continue;
  }
  if (!fs.existsSync(base)) problems.push(`missing file: ${url}`);
  for (const label of Object.keys(info.variants)) {
    const v = base.replace(/\.webp$/, `-${label}.webp`);
    if (!fs.existsSync(v)) problems.push(`missing variant: ${url} (${label})`);
  }
}

const ugg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/seed/ugg.json'), 'utf8')) as Array<{ filename: string }>;
for (const ep of ugg) {
  if (!fs.existsSync(path.join(videosDir(), ep.filename))) problems.push(`missing video: ${ep.filename}`);
}

if (problems.length) {
  console.error(`${problems.length} problem(s) under ${mediaDir()}:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`media ok: ${Object.keys(manifest.images).length} images, ${ugg.length} videos under ${mediaDir()}`);
