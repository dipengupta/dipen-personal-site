# Architecture

One Next.js 15 (App Router) app, one SQLite content database, one Docker
container, three front-ends over the same data:

```
                       middleware.ts (host -> view)            next.config.ts (security headers)
  dipengupta.com/  ----------------------------> app/(main)/**        the website
  ipod.dipengupta.com/  -> rewrite /ipod  -----> app/(devices)/ipod    iPod Classic (client, Zustand)
  itunes.dipengupta.com/ -> rewrite /itunes ---> app/(devices)/itunes  iTunes window (client)
                                                   |                     |
   server components ----> src/lib/content/queries.ts <---- app/api/**  (thin wrappers, used by the device views)
                                    |
                              Drizzle ORM -> SQLite  DATABASE_PATH   (data/site.db, /data/site.db on Fly)
                                    ^
                   fetchers (YouTube RSS, Substack RSS, Spotify previews), staleness-gated, additive

  /media/**  -> app/media/[...path]/route.ts -> MEDIA_DIR (media/, /data/media on Fly)   images + videos
  /api/video/[file] -> same file server                                                   UGG episodes (Range)
```

`docs/adr/` records the three structural decisions (SQLite, media outside
git, URL-chosen views). `docs/runbooks/` has the step-by-step tasks.

## Views and routing

- **Registry**: `src/lib/site/views.ts` lists every view with its subdomain
  label and path prefix. `viewHref(view, siteConfig)` renders a cross-view
  link as an absolute subdomain URL when the visitor is on `SITE_DOMAIN`
  (or `localhost`), otherwise as the path prefix.
- **Middleware**: `middleware.ts` adapts the pure rules in
  `src/lib/site/host.ts`: subdomain roots rewrite to the view path, `www.`
  is dropped, unknown subdomains go to the apex, and with `SITE_DOMAIN` set
  the apex's `/ipod` and `/itunes` redirect to their canonical subdomains.
  `SITE_DOMAIN` defaults to `localhost` in development (subdomains recognised,
  nothing redirected away from paths) and to path mode in production when
  unset (fly.dev).
- **Request config**: `src/lib/site/request.ts` reads host + forwarded
  headers; `SiteConfigProvider` carries it to client components so links
  render identically on server and client.
- **Root layouts**: `app/layout.tsx` is the single root layout (it must exist
  for Next's implicit 404 route). `app/(main)/layout.tsx` adds the website's
  fonts, stylesheet and chrome; `app/(devices)/layout.tsx` adds the device
  views' reset (`devices.css`), no-zoom viewport and the site-config
  provider. Switching views is a full page load, so neither group's CSS
  leaks into the other.
- **Device rule**: exactly one remains (`src/lib/device/viewRouting.ts`): a
  portrait phone cannot use iTunes and is sent to the iPod before paint by an
  inline script in `app/(devices)/itunes/page.tsx`. Everything else follows
  the URL. There is no pinned preference and no tilt switching any more.

## The main site (`app/(main)`)

- **Information architecture** lives in `src/lib/main/routes.ts`: four
  sections (Music, Collections, About, Misc) with their pages and blurbs.
  Sections have no landing page (a top-level nav item links to its first page
  and opens the dropdown); `REDIRECTS` keeps the section and retired URLs
  working. Header, mobile sheet, footer, sitemap and the home page's Explore
  cards all render from the table.
- **Pages** are server components calling `src/lib/content/queries.ts`
  (`force-dynamic`: the DB is local and reads are sub-millisecond, and the
  live fetchers stay in the request path). Client components are limited to
  what needs state: hero crossfade, photo lightbox, YouTube click-to-embed,
  tweet feed, search dialog, theme toggle, header menu, hash focus.
- **Copy** is in `src/content/` (plain strings; no em-dashes/emoji, enforced
  by `tests/unit/mainCopy.test.ts`). Quoted content (articles, captions,
  tweets, video descriptions) is rendered as stored.
- **Images**: `src/components/main/Picture.tsx` renders `srcset` from the
  media manifest with intrinsic dimensions and a blur placeholder;
  `pictureData()` hands the same fields to client components.
- **About**: two pages over three tables. `/about/journey` merges
  `timeline_entries` (jobs) and `education` (schools) onto one line with
  `src/lib/main/journey.ts`, which parses the start of each authored span
  ("Feb '25 - Present") to interleave them newest first. No cards: every row is
  one two-column grid, the heading block (kind, title, organisation) left of the
  centre line and the dates plus description across the dot from it. Work and
  school are told apart by the dot, filled or hollow, not by side. `/about/projects` renders the
  `projects` table. The DOM ids stay `job-<id>`, `education-<id>` and
  `project-<id>` so search deep links keep working.
- **Search**: header dialog (Cmd/Ctrl+K) and `/search` both use
  `searchContent(db, q, { scope: 'main' })`; `src/lib/main/searchTargets.ts`
  maps a result's group + id to a page URL with a `#id` that
  `FocusHash` scrolls to and highlights. The `academic` group is the one that
  splits across two pages (schools to Journey, projects to Projects).
  iTunes keeps its own `entryId` path.
- **URLs**: articles use slugs derived from their titles at seed time;
  recipes and spice blends slugify the title at request time
  (`src/lib/main/recipes.ts`).
- **Footer date**: `next.config.ts` reads the last commit date from git (or
  `BUILD_DATE`/`GIT_SHA` build args on Fly) into `NEXT_PUBLIC_BUILD_DATE`.
- **Theme**: light/dark from `prefers-color-scheme`, overridable with the
  footer toggle (`data-site-theme` on `<html>`, localStorage + cookie,
  applied pre-hydration by the root layout's inline script).

## The data spine

- **Schema** (`src/lib/db/schema.ts`, Drizzle, SQLite): articles, tweets,
  ugg_episodes, guitars, locations (unused by any view), mugs,
  gallery_items (profile/kitchen/alison), recipes, spice_blends,
  timeline_entries, youtube_videos, soundcloud_tracks, recommendations (+
  tracks), links, concerts, wifi_names, list_items, projects, education,
  fetch_meta, seed_meta. Migrations are SQL files in `drizzle/`.
- **Seeding** (`src/lib/seed/seedDb.ts`): per-table `SeedUnit`s with a
  fingerprint of their committed source; `syncSeed` runs on every boot and
  re-seeds only units whose fingerprint changed (`seed_meta`), so a content
  commit lands on the next deploy with no manual step. `--force` rebuilds.
  Article HTML is sanitized when parsed (`src/lib/content/sanitize.ts`).
- **Queries** (`src/lib/content/queries.ts`): the one read layer. `sections`
  maps a key to a query; `getSection`, `listArticles`, `getArticle`,
  `listYoutube`, `listSoundcloud`. The `/api/content/[section]`,
  `/api/articles[/slug]`, `/api/youtube`, `/api/soundcloud` routes wrap
  these for the device views.
- **Static content** (`src/lib/content/static.ts`): Octavium, Vinyls,
  Fridge Magnets text + image, imported by all three views. Each view keeps
  its own About text (it explains that view).
- **Live fetchers** (`src/lib/fetchers/`): YouTube channel RSS (6h),
  Substack RSS (24h, sanitized), Spotify playlist previews (6h, keyless).
  All are additive with the seed as a complete fallback, and they run in the
  background (`refreshInBackground` in queries.ts): a request is answered
  from the database at once and the next one sees the merged rows.
- **Search** (`src/lib/search/searchContent.ts`): case-insensitive
  substring scan over every table plus static pages; `scope` selects the
  iTunes or main-site result set (Academic is main-only, Playlists
  iTunes-only). `/api/search` caps the query at 100 chars and rate-limits.

## Media

- `MEDIA_DIR` (`src/lib/media/paths.ts`) holds `images/<collection>/` and
  `videos/ugg/`. `app/media/[...path]/route.ts` serves it: per-segment
  allowlist, extension allowlist, realpath confined to the root, ETag /
  If-None-Match, Range/206, immutable caching (`src/lib/media/serveFile.ts`).
  `/api/video/[file]` keeps its historical URL for the device views.
- `scripts/media/ingest-images.ts` writes WebP variants (800 base, 400,
  1600) and `src/data/media-manifest.json` (dimensions, variants, blur,
  EXIF date); with `--gallery` it appends gallery rows.
  `scripts/media/video-posters.ts` grabs a frame per UGG episode with ffmpeg
  and feeds it to the same ingest (`images/ugg/ugg-<n>.webp`), so the
  Instagram page has thumbnails and plays the video on demand.
  `scripts/media/check.ts` and `tests/unit/mediaManifest.test.ts` keep
  references, manifest and files consistent. `push-fly.sh` / `pull-fly.sh`
  sync with the volume.

## The iPod and iTunes views

Unchanged from their original repo apart from cross-view links. In short:

- **iPod** (`src/components/ipod/**`, `src/lib/{menu,store,input,players,audio}`):
  a 320x240 logical screen scaled by `Screen.tsx`; the menu tree in
  `src/lib/menu/tree.ts` is the site structure; `ipodStore` holds the frame
  stack and playback; players (YouTube, SoundCloud, Spotify previews, local
  UGG video) are created once and survive navigation; wheel math is pure and
  unit-tested; settings (theme, font, haptics, shuffle, fullscreen, click
  sound) persist in localStorage + cookies.
- **iTunes** (`src/components/itunes/**`, `src/lib/itunes/**`): an iTunes-7
  window over the same `/api` routes with its own loaders, catalog (sidebar),
  Grid / Cover Flow, track table, video pane, reading pane, tweets, global
  search opening the exact item, and iTunes-local playback.
- Links between them and back to the main site go through the view registry
  (`Ipod.tsx` corner pills, the iTunes DEVICES rows with `viewId`).

## Security

`src/lib/site/securityHeaders.ts` (applied to every response): CSP admitting
the YouTube / SoundCloud / Spotify embeds the device views need (report-only
until `CSP_ENFORCE=1`), HSTS, nosniff, `X-Frame-Options: DENY`, referrer and
permissions policies. Media and video routes allowlist paths and confine to
the media root; search is length-capped and rate-limited; article HTML is
sanitized at ingest; there is no admin surface (content changes are commits);
the container runs as a non-root user; no secrets exist in the codebase.

## Testing

- **Unit** (`tests/unit/`): wheel math, store, menu tree, article parsing,
  feeds, iTunes loaders/catalog/coverflow, view registry + host rules,
  device fallback, media manifest references, sanitizer, search targets and
  route table, main-site copy hygiene.
- **Integration** (`tests/integration/`, in-memory SQLite, network stubbed):
  seeding, fetchers, API routes, the content query layer, search scopes,
  the video route.
- **E2E** (`e2e/`, Playwright, desktop + iPhone projects; builds into
  `.next-e2e` with `SITE_DOMAIN=localhost`): iPod, iTunes, mobile touch,
  device fallback, subdomain routing on `*.localhost`, and the main site
  (every page renders, detail pages, search deep links, lightbox, theme,
  mobile menu, no horizontal overflow).

## Docker and Fly

Multi-stage `Dockerfile` on `node:22-bookworm-slim`; the runner holds the
standalone build, migrations, seed JSON and the bundled seed script, runs as
user `site`, and mounts `/data` (database + media). `docker-entrypoint.sh`
migrates + syncs seeds, then starts the server. `fly.toml`: app
`dipen-personal-site`, one machine, volume `site_data`, `MEDIA_DIR` and
`DATABASE_PATH` on the volume, health check on `/api/content/links`.
`scripts/deploy.sh` passes the commit date/sha as build args. Domain and
certificate steps are in `docs/runbooks/deploy.md`.
