import fs from 'node:fs';
import path from 'node:path';
import { OCTAVIUM, MAGNETS, VINYLS } from '@/lib/content/static';
import { allNodes } from '@/lib/menu/tree';

/**
 * Every image URL the site can render, collected from seed data and in-code
 * content. Used by the media check and the manifest unit test so a photo can
 * never be referenced without being ingested.
 */
export function referencedImageUrls(seedDir = path.join(process.cwd(), 'src', 'data', 'seed')): string[] {
  const urls = new Set<string>();
  const read = <T>(name: string): T => JSON.parse(fs.readFileSync(path.join(seedDir, name), 'utf8')) as T;

  for (const row of read<Array<{ imagePath: string }>>('gallery.json')) urls.add(row.imagePath);
  for (const row of read<Array<{ imagePath: string }>>('guitars.json')) urls.add(row.imagePath);
  const travel = read<{ visitedLocations?: Array<{ photos?: Array<{ path: string }> }> }>('travel.json');
  for (const loc of travel.visitedLocations ?? []) for (const p of loc.photos ?? []) urls.add(p.path);
  if (fs.existsSync(path.join(seedDir, 'academic.json'))) {
    const academic = read<{ projects?: Array<{ imagePath?: string }> }>('academic.json');
    for (const p of academic.projects ?? []) if (p.imagePath) urls.add(p.imagePath);
  }
  for (const s of [OCTAVIUM, VINYLS, MAGNETS]) urls.add(s.imagePath);
  for (const node of allNodes()) {
    if (node.previewImage) urls.add(node.previewImage);
    const payload = node.payload as { imagePath?: string } | undefined;
    if (payload?.imagePath) urls.add(payload.imagePath);
  }
  return [...urls].sort();
}
