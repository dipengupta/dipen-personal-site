import { afterEach, describe, expect, it, vi } from 'vitest';
import { photoMosaicRows, shufflePhotos } from '@/lib/main/photos';

afterEach(() => vi.restoreAllMocks());

describe('shufflePhotos', () => {
  it('changes the order without losing, duplicating, or mutating photos', () => {
    const photos = Object.freeze([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const shuffled = shufflePhotos(photos);
    expect(shuffled.map((p) => p.id)).toEqual([2, 3, 4, 1]);
    expect(new Set(shuffled)).toEqual(new Set(photos));
    expect(photos.map((p) => p.id)).toEqual([1, 2, 3, 4]);
  });

  it('handles empty and single-photo collections', () => {
    expect(shufflePhotos([])).toEqual([]);
    expect(shufflePhotos(['only'])).toEqual(['only']);
  });
});

describe('photoMosaicRows', () => {
  it('keeps every photo and avoids a short final row across different compositions', () => {
    for (const random of [0, 0.4, 0.99]) {
      vi.spyOn(Math, 'random').mockReturnValue(random);
      for (let count = 3; count < 80; count++) {
        const rows = photoMosaicRows(count);
        expect(rows.reduce((sum, row) => sum + row, 0)).toBe(count);
        expect(rows.every((row) => row >= 3 && row <= 7)).toBe(true);
      }
      vi.restoreAllMocks();
    }
  });

  it('varies the row sizes and handles small galleries', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const sparse = photoMosaicRows(37);
    vi.mocked(Math.random).mockReturnValue(0.99);
    expect(photoMosaicRows(37)).not.toEqual(sparse);
    expect(photoMosaicRows(0)).toEqual([]);
    expect(photoMosaicRows(2)).toEqual([2]);
  });
});
