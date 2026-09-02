/**
 * Poster frames for the UGG Chronicles videos (`npm run media:posters`).
 *
 * For every episode in src/data/seed/ugg.json without a poster at
 * MEDIA_DIR/images/ugg/ugg-<n>.webp, grabs one frame with ffmpeg (1.5 s in,
 * where the clip has usually settled) into a temp folder and hands the frames
 * to the image ingest, so posters get the same variants + manifest entries as
 * every other photo. Run after importing new episodes; idempotent.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { imagesDir, videosDir } from '../../src/lib/media/paths';

const ugg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/seed/ugg.json'), 'utf8')) as Array<{ episode: number; filename: string }>;
const outDir = path.join(imagesDir(), 'ugg');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'posters-'));
let extracted = 0;
let missing = 0;

for (const ep of ugg) {
  const poster = path.join(outDir, `ugg-${ep.episode}.webp`);
  if (fs.existsSync(poster) && !process.argv.includes('--force')) continue;
  const video = path.join(videosDir(), ep.filename);
  if (!fs.existsSync(video)) {
    missing++;
    continue;
  }
  const frame = path.join(tmp, `ugg-${ep.episode}.jpg`);
  try {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '1.5', '-i', video, '-frames:v', '1', '-q:v', '3', frame], { stdio: 'ignore' });
    extracted++;
  } catch {
    // Very short clips: fall back to the first frame.
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-frames:v', '1', '-q:v', '3', frame], { stdio: 'ignore' });
    extracted++;
  }
}

if (extracted === 0) {
  console.log(`posters up to date (${missing} videos missing locally)`);
} else {
  const r = spawnSync('npx', ['tsx', '--tsconfig', 'tsconfig.scripts.json', 'scripts/media/ingest-images.ts', '--source', tmp, '--collection', 'ugg', ...(process.argv.includes('--force') ? ['--force'] : [])], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log(`${extracted} poster(s) extracted${missing ? `, ${missing} videos missing locally` : ''}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
