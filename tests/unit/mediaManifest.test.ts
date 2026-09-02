import { describe, expect, it } from 'vitest';
import { imageInfo, largestUrl, mediaManifest, srcSet, variantUrl } from '@/lib/media/manifest';
import { referencedImageUrls } from '@/lib/media/references';

describe('media manifest', () => {
  it('covers every image the site references (ingest new photos with npm run media:ingest)', () => {
    const missing = referencedImageUrls().filter((url) => !imageInfo(url));
    expect(missing).toEqual([]);
  });

  it('only contains /media/images/ URLs with positive dimensions', () => {
    for (const [url, info] of Object.entries(mediaManifest.images)) {
      expect(url).toMatch(/^\/media\/images\/[A-Za-z0-9/_.-]+\.webp$/);
      expect(info.width).toBeGreaterThan(0);
      expect(info.height).toBeGreaterThan(0);
      expect(Math.max(info.width, info.height)).toBeLessThanOrEqual(800);
    }
  });

  it('builds srcset / largest URLs from the variants', () => {
    expect(variantUrl('/media/images/home/main.webp', '1600')).toBe('/media/images/home/main-1600.webp');
    const url = Object.keys(mediaManifest.images)[0];
    expect(url).toBeDefined();
    expect(srcSet(url)).toContain(`${url} ${imageInfo(url)!.width}w`);
    expect(largestUrl('/media/images/nope.webp')).toBe('/media/images/nope.webp');
  });
});
