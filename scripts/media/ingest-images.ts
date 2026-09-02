/**
 * Image ingest: the one way photos enter the site.
 *
 *   npm run media:ingest -- --source <dir> --collection <name> [options]
 *
 * For every image in <dir> (jpg/jpeg/png/webp/tif/heic) it writes to
 * MEDIA_DIR/images/<collection>/:
 *   <stem>.webp        800px long edge, q80  (the base URL; the iPod's format)
 *   <stem>-400.webp    400px long edge       (mobile grids)
 *   <stem>-1600.webp   1600px long edge      (hero / lightbox; only if the source is larger than 800px)
 * and records dimensions, variants, a blurred placeholder and the EXIF capture
 * time in src/data/media-manifest.json (committed). Originals are never
 * modified or deleted.
 *
 * Options:
 *   --gallery <category>   also append new rows to src/data/seed/gallery.json
 *                          (title from --title or a humanized file name;
 *                          description = capture "Month YYYY" when --caption exif-date)
 *   --title <text>         fixed title for --gallery rows (Alison uses "Alison")
 *   --caption exif-date    description = capture month/year (default for alison), or none
 *   --slugify              kebab-case the output stems (default: keep the file stem)
 *   --force                regenerate variants that already exist
 *   --dry-run              report what would happen, write nothing
 *
 * Idempotent: existing outputs are skipped (unless --force), manifest entries
 * are refreshed, and gallery rows are only added for paths not already listed.
 * HEIC sources are converted through macOS `sips` first (sharp has no HEIF).
 * See docs/runbooks/add-images.md.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import exifReader from 'exif-reader';
import sharp from 'sharp';
import { imagesDir } from '../../src/lib/media/paths';

const REPO = process.cwd();
const MANIFEST_PATH = path.join(REPO, 'src', 'data', 'media-manifest.json');
const GALLERY_PATH = path.join(REPO, 'src', 'data', 'seed', 'gallery.json');
const SOURCE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic', '.heif']);
const BASE_EDGE = 800;
const VARIANT_EDGES = [400, 1600] as const;
const QUALITY = 80;
const BLUR_EDGE = 16;

interface Args {
  source: string;
  collection: string;
  gallery?: string;
  title?: string;
  caption: 'exif-date' | 'none';
  slugify: boolean;
  force: boolean;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const has = (flag: string) => argv.includes(flag);
  const source = get('--source');
  const collection = get('--collection');
  if (!source || !collection) {
    console.error('usage: npm run media:ingest -- --source <dir> --collection <name> [--gallery <category>] [--title <t>] [--caption exif-date|none] [--slugify] [--force] [--dry-run]');
    process.exit(1);
  }
  if (!/^[a-z0-9][a-z0-9/_-]*$/.test(collection)) {
    console.error(`collection must be a lowercase path like "music" or "travel/pins", got "${collection}"`);
    process.exit(1);
  }
  const gallery = get('--gallery');
  const captionArg = get('--caption');
  const caption = captionArg === 'exif-date' || (!captionArg && gallery === 'alison') ? 'exif-date' : 'none';
  return {
    source: path.resolve(source),
    collection,
    gallery,
    title: get('--title'),
    caption,
    slugify: has('--slugify'),
    force: has('--force'),
    dryRun: has('--dry-run'),
  };
}

function slugify(stem: string): string {
  return stem
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function humanize(stem: string): string {
  return stem
    .replace(/^\d+[_-]/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function variantName(stem: string, edge: number | null): string {
  return edge ? `${stem}-${edge}.webp` : `${stem}.webp`;
}

/** Convert HEIC to a temporary JPEG with sips (macOS). */
function heicToJpeg(file: string, tmpDir: string): string {
  const out = path.join(tmpDir, `${path.basename(file, path.extname(file))}.jpg`);
  execFileSync('sips', ['-s', 'format', 'jpeg', file, '--out', out], { stdio: 'ignore' });
  return out;
}

function exifDate(meta: sharp.Metadata): string | undefined {
  if (!meta.exif) return undefined;
  try {
    const exif = exifReader(meta.exif);
    const d = exif.Photo?.DateTimeOriginal ?? exif.Image?.DateTime;
    if (d instanceof Date && !Number.isNaN(d.getTime())) return d.toISOString();
    if (typeof d === 'string') {
      // "YYYY:MM:DD HH:MM:SS"
      const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(d);
      if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])).toISOString();
    }
  } catch {
    /* unreadable EXIF is not an error */
  }
  return undefined;
}

function monthYear(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

interface ManifestImage {
  width: number;
  height: number;
  source: { width: number; height: number };
  variants: Record<string, { width: number; height: number }>;
  blur?: string;
  takenAt?: string;
}
interface Manifest {
  version: 1;
  images: Record<string, ManifestImage>;
}

function readJson<T>(file: string, fallback: T): T {
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as T) : fallback;
}

function writeJson(file: string, value: unknown) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function sortedRecord<T>(rec: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(rec).sort(([a], [b]) => a.localeCompare(b)));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(args.source)) {
    console.error(`source not found: ${args.source}`);
    process.exit(1);
  }
  const outDir = path.join(imagesDir(), ...args.collection.split('/'));
  const urlBase = `/media/images/${args.collection}`;
  const manifest = readJson<Manifest>(MANIFEST_PATH, { version: 1, images: {} });
  const gallery = readJson<Array<{ title: string; description: string; imagePath: string; category: string }>>(GALLERY_PATH, []);
  const galleryPaths = new Set(gallery.map((g) => g.imagePath));

  const files = fs
    .readdirSync(args.source, { withFileTypes: true })
    .filter((e) => e.isFile() && SOURCE_EXTS.has(path.extname(e.name).toLowerCase()) && !e.name.startsWith('.'))
    // Skip our own variant outputs when re-ingesting an output folder in place.
    .filter((e) => !/-(400|1600)\.webp$/i.test(e.name))
    .map((e) => path.join(args.source, e.name))
    .sort();
  if (files.length === 0) {
    console.log(`no images in ${args.source}`);
    return;
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ingest-'));
  if (!args.dryRun) fs.mkdirSync(outDir, { recursive: true });
  let written = 0;
  let added = 0;
  const newRows: typeof gallery = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const stemRaw = path.basename(file, path.extname(file));
    const stem = args.slugify ? slugify(stemRaw) : stemRaw;
    const input = ext === '.heic' || ext === '.heif' ? heicToJpeg(file, tmpDir) : file;
    const image = sharp(input, { failOn: 'none' }).rotate();
    const meta = await image.metadata();
    if (!meta.width || !meta.height) {
      console.warn(`skip (unreadable): ${file}`);
      continue;
    }
    // .rotate() applies EXIF orientation, so swap for 90/270 degree photos.
    const rotated = (meta.orientation ?? 1) >= 5;
    const srcW = rotated ? meta.height : meta.width;
    const srcH = rotated ? meta.width : meta.height;
    const longEdge = Math.max(srcW, srcH);
    const takenAt = exifDate(meta);

    const targets: Array<{ edge: number | null; max: number }> = [{ edge: null, max: BASE_EDGE }];
    for (const edge of VARIANT_EDGES) {
      if (edge < BASE_EDGE || longEdge > BASE_EDGE) targets.push({ edge, max: edge });
    }

    const entry: ManifestImage = {
      width: 0,
      height: 0,
      source: { width: srcW, height: srcH },
      variants: {},
      ...(takenAt ? { takenAt } : {}),
    };

    for (const t of targets) {
      const outFile = path.join(outDir, variantName(stem, t.edge));
      const inPlace = path.resolve(outFile) === path.resolve(file);
      const exists = fs.existsSync(outFile);
      if (!exists || (args.force && !inPlace)) {
        if (!args.dryRun) {
          await sharp(input, { failOn: 'none' })
            .rotate()
            .resize(t.max, t.max, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: QUALITY })
            .toFile(outFile);
        }
        written++;
      }
      let dims: { width: number; height: number };
      if (args.dryRun && !exists) {
        const scale = Math.min(1, t.max / longEdge);
        dims = { width: Math.round(srcW * scale), height: Math.round(srcH * scale) };
      } else {
        const m = await sharp(outFile).metadata();
        dims = { width: m.width ?? 0, height: m.height ?? 0 };
      }
      if (t.edge === null) {
        entry.width = dims.width;
        entry.height = dims.height;
      } else {
        entry.variants[String(t.edge)] = dims;
      }
    }

    const blurBuf = await sharp(input, { failOn: 'none' })
      .rotate()
      .resize(BLUR_EDGE, BLUR_EDGE, { fit: 'inside' })
      .webp({ quality: 40 })
      .toBuffer();
    entry.blur = `data:image/webp;base64,${blurBuf.toString('base64')}`;

    const url = `${urlBase}/${stem}.webp`;
    manifest.images[url] = entry;

    if (args.gallery && !galleryPaths.has(url)) {
      const row = {
        title: args.title ?? humanize(stem),
        description: args.caption === 'exif-date' && takenAt ? monthYear(takenAt) : '',
        imagePath: url,
        category: args.gallery,
      };
      newRows.push(row);
      galleryPaths.add(url);
      added++;
    }
    console.log(`${path.basename(file)} -> ${url} (${srcW}x${srcH}${takenAt ? `, ${takenAt.slice(0, 10)}` : ''})`);
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });
  if (args.dryRun) {
    console.log(`\n[dry-run] would write ${written} files, add ${added} gallery rows`);
    return;
  }
  manifest.images = sortedRecord(manifest.images);
  writeJson(MANIFEST_PATH, manifest);
  if (newRows.length) {
    // Gallery photos are ordered oldest -> newest by capture date within a category.
    newRows.sort((a, b) => (manifest.images[a.imagePath].takenAt ?? '').localeCompare(manifest.images[b.imagePath].takenAt ?? ''));
    writeJson(GALLERY_PATH, [...gallery, ...newRows]);
  }
  console.log(`\n${written} files written, ${added} gallery rows added, manifest has ${Object.keys(manifest.images).length} images`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
