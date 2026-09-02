/**
 * The one read layer over the content database, shared by every view.
 *
 * - The device views (iPod, iTunes) reach it through the /api routes, which
 *   are thin wrappers around these functions.
 * - The main site's server components call these functions directly.
 *
 * Either way the same SQLite file and the same queries answer, so a seed
 * change shows up in all three views at once. Live refreshes (YouTube RSS,
 * Substack RSS, Spotify previews) are additive and staleness-gated, and they
 * run here so both paths benefit identically.
 */
import { asc, desc, eq } from 'drizzle-orm';
import { getDb, type Db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import { refreshSpotifyIfStale } from '@/lib/fetchers/spotify';
import { refreshArticlesIfStale } from '@/lib/fetchers/substack';
import { refreshYoutubeIfStale } from '@/lib/fetchers/youtubeRss';

/** Playlists with their (Spotify) tracks nested, ordered by sortOrder. */
function recommendations(db: Db) {
  const playlists = db.select().from(schema.recommendations).orderBy(asc(schema.recommendations.sortOrder)).all();
  return playlists.map((playlist) => ({
    ...playlist,
    tracks:
      playlist.service === 'spotify'
        ? db
            .select()
            .from(schema.recommendationTracks)
            .where(eq(schema.recommendationTracks.recId, playlist.id))
            .orderBy(asc(schema.recommendationTracks.sortOrder))
            .all()
        : [],
  }));
}

function gallery(db: Db, category: string) {
  return db
    .select()
    .from(schema.galleryItems)
    .where(eq(schema.galleryItems.category, category))
    .orderBy(asc(schema.galleryItems.sortOrder))
    .all();
}

export const sections = {
  recommendations,
  guitars: (db: Db) => db.select().from(schema.guitars).orderBy(asc(schema.guitars.sortOrder)).all(),
  mugs: (db: Db) => db.select().from(schema.mugs).orderBy(asc(schema.mugs.sortOrder)).all(),
  photos: (db: Db) => gallery(db, 'profile'),
  kitchen: (db: Db) => gallery(db, 'kitchen'),
  alison: (db: Db) => gallery(db, 'alison'),
  recipes: (db: Db) => db.select().from(schema.recipes).orderBy(asc(schema.recipes.sortOrder)).all(),
  spiceBlends: (db: Db) => db.select().from(schema.spiceBlends).orderBy(asc(schema.spiceBlends.sortOrder)).all(),
  concerts: (db: Db) => db.select().from(schema.concerts).orderBy(asc(schema.concerts.sortOrder)).all(),
  wifi: (db: Db) => db.select().from(schema.wifiNames).orderBy(asc(schema.wifiNames.sortOrder)).all(),
  list: (db: Db) => db.select().from(schema.listItems).orderBy(asc(schema.listItems.sortOrder)).all(),
  timeline: (db: Db) => db.select().from(schema.timelineEntries).orderBy(asc(schema.timelineEntries.sortOrder)).all(),
  links: (db: Db) => db.select().from(schema.links).orderBy(asc(schema.links.sortOrder)).all(),
  // Most recent episode first; the menu groups these into year sub-lists.
  ugg: (db: Db) => db.select().from(schema.uggEpisodes).orderBy(desc(schema.uggEpisodes.episode)).all(),
  // Scraped pennguytweets, newest first, by the account's own numbering.
  tweets: (db: Db) => db.select().from(schema.tweets).orderBy(desc(schema.tweets.number)).all(),
  projects: (db: Db) =>
    db
      .select()
      .from(schema.projects)
      .orderBy(asc(schema.projects.sortOrder))
      .all()
      .map((p) => ({ ...p, links: JSON.parse(p.linksJson) as ProjectLink[] })),
  education: (db: Db) => db.select().from(schema.education).orderBy(asc(schema.education.sortOrder)).all(),
} satisfies Record<string, (db: Db) => unknown[]>;

export type ContentSection = keyof typeof sections;
export type SectionRows<K extends ContentSection> = ReturnType<(typeof sections)[K]>;

export interface ProjectLink {
  label: string;
  url?: string;
  /** Link to another view of this site instead of an external URL. */
  view?: 'main' | 'ipod' | 'itunes';
}

export function isContentSection(name: string): name is ContentSection {
  return Object.prototype.hasOwnProperty.call(sections, name);
}

/** Rows for one section, after any staleness-gated live refresh that applies to it. */
export async function getSection<K extends ContentSection>(key: K, db: Db = getDb()): Promise<SectionRows<K>> {
  // Additive, keyless Spotify track refresh; failures fall back to the seed.
  if (key === 'recommendations') await refreshSpotifyIfStale(db);
  return sections[key](db) as SectionRows<K>;
}

export type ArticleSummary = Pick<typeof schema.articles.$inferSelect, 'slug' | 'title' | 'publishedLabel' | 'sourceLabel' | 'sourceUrl'>;

/** Newest first. Pulls new Substack posts additively when stale. */
export async function listArticles(db: Db = getDb()): Promise<ArticleSummary[]> {
  await refreshArticlesIfStale(db);
  return db
    .select({
      slug: schema.articles.slug,
      title: schema.articles.title,
      publishedLabel: schema.articles.publishedLabel,
      sourceLabel: schema.articles.sourceLabel,
      sourceUrl: schema.articles.sourceUrl,
    })
    .from(schema.articles)
    .orderBy(desc(schema.articles.sortOrder))
    .all();
}

export function getArticle(slug: string, db: Db = getDb()) {
  return db.select().from(schema.articles).where(eq(schema.articles.slug, slug)).get() ?? null;
}

/** Newest first. Merges the channel RSS when stale. */
export async function listYoutube(db: Db = getDb()) {
  await refreshYoutubeIfStale(db);
  return db.select().from(schema.youtubeVideos).orderBy(desc(schema.youtubeVideos.publishedAt)).all();
}

/** Fallback SoundCloud rows; clients prefer the live widget's track list. */
export function listSoundcloud(db: Db = getDb()) {
  return db.select().from(schema.soundcloudTracks).orderBy(asc(schema.soundcloudTracks.sortOrder)).all();
}
