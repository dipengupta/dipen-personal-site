# CLAUDE.md

Dipen's personal website: one Next.js 15 app (App Router, TypeScript), one
SQLite database (better-sqlite3 + Drizzle), three views: the main site at `/`,
the iPod Classic at `/ipod`, iTunes at `/itunes` (subdomains in production).
Read `docs/architecture.md` before structural changes.

## Commands

```bash
npm run dev          # dev server (seed first if data/site.db is missing)
npm run seed         # migrate + seed SQLite; seed:force to wipe and reseed
npm run db:generate  # regenerate drizzle/ migrations after editing schema.ts
npm test             # vitest unit + integration (fast, no network)
npm run e2e          # playwright; builds (.next-e2e) + seeds + serves by itself
npm run typecheck    # tsc --noEmit
npm run media:check  # references vs manifest vs files in MEDIA_DIR
docker compose up --build
```

## Hard rules

- **The iPod and iTunes views are finished.** Do not restyle or restructure
  `src/components/ipod/**`, `src/components/itunes/**`, `src/lib/menu/**`,
  `src/lib/store/**`, `src/lib/players/**`, `src/lib/itunes/**`. Data-layer
  changes flow to them through `src/lib/content/queries.ts` and the `/api`
  routes; only cross-view links and shared static content are wired to the
  new site.
- **One data spine.** Every view reads `src/lib/content/queries.ts` (server)
  or the `/api/...` routes (client). Never query the DB from a page or
  component directly.
- **Main-site copy: no em-dashes, no en-dashes, no emoji** in
  `app/(main)/**`, `src/components/main/**`, `src/content/**`,
  `src/lib/main/**`, `src/data/seed/academic.json`
  (`tests/unit/mainCopy.test.ts` fails the build otherwise). Quoted content
  from the database is rendered as written.
- **Media never enters git.** Images go through `npm run media:ingest`
  (WebP 800 base + 400/1600 variants, manifest entry). Reference them as
  `/media/images/<collection>/<name>.webp`. `tests/unit/mediaManifest.test.ts`
  fails on a reference with no manifest entry.
- **Every feature change updates its tests and docs in the same change.**
  Main-site page: `e2e/main.spec.ts` + `src/lib/main/routes.ts`. Schema:
  `npm run db:generate`, seed data, `tests/integration/*`. Routing:
  `tests/unit/siteViews.test.ts` + `e2e/hostRouting.spec.ts`.
- **The URL decides the view.** No device sniffing beyond the single
  iTunes-on-a-portrait-phone fallback in `src/lib/device/viewRouting.ts`.
  Cross-view links go through `viewHref()` (`src/lib/site/views.ts`) and are
  plain `<a>` elements.
- **Never hardcode secrets.** Env vars via `.env` (gitignored); document new
  ones in `.env.example` and README. There are no API keys today.
- **Animate transforms/opacity only** (hero crossfade, mosaic, iPod screen).
- **Node 22 everywhere** (`.nvmrc`, Dockerfile): better-sqlite3 and sharp ABIs.

## Layout of interest

- `app/layout.tsx`: the single root layout (html/body, theme attributes)
- `app/(main)/**`: the website (`main.css`, layout with header/footer, pages)
- `app/(devices)/**`: iPod + iTunes (their own CSS reset and viewport rules)
- `middleware.ts` + `src/lib/site/`: host routing, view registry, request config
- `src/lib/content/queries.ts`: the read layer; `src/lib/content/static.ts`: shared static content
- `src/lib/media/`: `MEDIA_DIR` paths, file server, manifest helpers
- `src/lib/main/`: main-site route table, search targets, slugs
- `src/content/`: authored copy for the main site
- `src/data/seed/`: committed content; `src/data/media-manifest.json`: image manifest
- `scripts/`: seed, migrate, media ingest/check/sync, content helpers, deploy
- `docs/`: architecture, ADRs, runbooks, tasks

## Gotchas

- `getDb()` is a `globalThis` singleton (survives dev hot reload); tests
  inject an in-memory DB via `tests/integration/helpers.ts#injectAppDb`.
- Article `slug`s are derived from titles at seed time (shared `slugify`);
  recipe and spice blend URLs slugify the title at request time.
- `next dev` and the e2e server use different build dirs (`.next`,
  `.next-e2e`), so both can run at once. The e2e server runs with
  `SITE_DOMAIN=site.localhost` (subdomain tests) while `localhost:3000` stays
  in path mode.
- Next relativizes a redirect whose host equals its own hostname, so on a dev
  server `www.localhost` -> `localhost` loops; production hosts never match
  the container's 0.0.0.0. Do not bind the server to 127.0.0.1: that breaks
  host-based rewrites in `next start`.
- The `.gitignore` rule for local data is `/data/` and `/media/`
  (root-anchored); a bare `data/` would also ignore `src/data/`.
- Search ids double as DOM ids for deep links (`#guitar-3`, `#tweet-702`);
  keep `src/lib/search/searchContent.ts` and `src/lib/main/searchTargets.ts` in step.
- Tweets must all have a date (`posted_at` NOT NULL; the seeder throws).
