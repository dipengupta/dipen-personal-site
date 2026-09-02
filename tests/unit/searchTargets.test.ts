import { describe, expect, it } from 'vitest';
import { searchResultHref } from '@/lib/main/searchTargets';
import { ALL_PAGES, REDIRECTS, SECTIONS } from '@/lib/main/routes';
import { slugify } from '@/lib/main/slug';

describe('slugify', () => {
  it('produces stable URL slugs', () => {
    expect(slugify("Grandma's Khao Soi & Rice")).toBe('grandmas-khao-soi-and-rice');
    expect(slugify('  Café  au Lait ')).toBe('cafe-au-lait');
  });
});

describe('searchResultHref', () => {
  it('maps every search group to a main-site page that exists', () => {
    const cases: Array<[string, string, string]> = [
      ['tweets', 'tweet-702', ''],
      ['articles', 'on-paper', ''],
      ['recipes', 'recipe-3', 'Chicken Rice'],
      ['spiceBlends', 'spice-1', 'Indian Everyday Masala'],
      ['videos', 'yt-abc', ''],
      ['videos', 'ugg-204', ''],
      ['guitars', 'guitar-2', ''],
      ['photos', 'photo-1', ''],
      ['photos', 'dish-1', ''],
      ['photos', 'alison-1', ''],
      ['mugs', 'mug-4', ''],
      ['timeline', 'job-1', ''],
      ['academic', 'project-1', ''],
      ['concerts', 'concert-1', ''],
      ['links', 'link-1', ''],
      ['wifi', 'wifi-1', ''],
      ['list', 'list-1', ''],
      ['pages', 'about', ''],
      ['pages', 'octavium', ''],
      ['pages', 'vinyls', ''],
    ];
    const known = new Set(['/', ...ALL_PAGES.map((p) => p.href)]);
    for (const [type, id, title] of cases) {
      const href = searchResultHref(type, id, title);
      const base = href.split('#')[0];
      const page = base.replace(/\/[^/]+$/, (m) => (known.has(base) ? m : ''));
      expect(known.has(base) || known.has(page), `${type}/${id} -> ${href}`).toBe(true);
    }
    expect(searchResultHref('recipes', 'recipe-3', 'Chicken Rice')).toBe('/collections/recipes/chicken-rice');
    expect(searchResultHref('videos', 'ugg-204', '')).toBe('/music/instagram#ugg-204');
  });
});

describe('main-site route table', () => {
  it('redirects old and section URLs to real pages', () => {
    const known = new Set(ALL_PAGES.map((p) => p.href));
    for (const r of REDIRECTS) {
      expect(known.has(r.source), r.source).toBe(false);
      expect(known.has(r.destination.replace(/\/:slug$/, '')), r.destination).toBe(true);
    }
  });

  it('has the agreed sections and unique hrefs', () => {
    expect(SECTIONS.map((s) => s.label)).toEqual(['Music', 'Collections', 'About', 'Misc']);
    const hrefs = ALL_PAGES.map((p) => p.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const s of SECTIONS) for (const p of s.pages) expect(p.href.startsWith(`/${s.id}/`)).toBe(true);
  });
});
