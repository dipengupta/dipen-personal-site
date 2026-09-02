import { beforeAll, describe, expect, it, vi } from 'vitest';
import { getArticle, getSection, isContentSection, listArticles, listYoutube, sections } from '@/lib/content/queries';
import type { Db } from '@/lib/db/client';
import { makeTestDb } from './helpers';

let db: Db;

beforeAll(() => {
  db = makeTestDb({ seed: true });
  // Live refreshes are staleness-gated and additive; keep tests offline.
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')));
});

describe('content query layer (shared by the API routes and the main site)', () => {
  it('serves every registered section from the same database', async () => {
    for (const key of Object.keys(sections)) {
      expect(isContentSection(key)).toBe(true);
      const rows = await getSection(key as keyof typeof sections, db);
      expect(rows.length, key).toBeGreaterThan(0);
    }
    expect(isContentSection('locations')).toBe(false);
  });

  it('seeds the Academic page: projects newest first with parsed links, and education', async () => {
    const projects = await getSection('projects', db);
    expect(projects[0].title).toBe('This website');
    expect(projects[0].links.some((l) => l.view === 'ipod')).toBe(true);
    const parallelPad = projects.find((p) => p.title === 'ParallelPad');
    expect(parallelPad?.imagePath).toBe('/media/images/academic/ParallelPad.webp');
    expect(parallelPad?.links[0]).toMatchObject({ label: 'Project', url: expect.stringContaining('github.com') });
    const education = await getSection('education', db);
    expect(education.map((e) => e.degree)).toEqual(['MS in Computer Science', 'B.Tech in Information Technology', 'Schooling']);
  });

  it('lists articles newest first without bodies, and fetches one with a sanitized body', async () => {
    const items = await listArticles(db);
    expect(items.length).toBeGreaterThanOrEqual(10);
    expect(items[0]).not.toHaveProperty('bodyHtml');
    const article = getArticle(items[0].slug, db);
    expect(article?.bodyHtml).toContain('<p>');
    expect(article?.bodyHtml).not.toMatch(/<script/i);
    expect(getArticle('does-not-exist', db)).toBeNull();
  });

  it('lists YouTube videos newest first even when the feed is unreachable', async () => {
    const videos = await listYoutube(db);
    expect(videos.length).toBeGreaterThan(50);
    expect(videos[0].publishedAt >= videos[videos.length - 1].publishedAt).toBe(true);
  });
});
