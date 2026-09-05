# dipen-personal-site

Dipen Gupta's personal website, served three ways from one app and one
database:

| View | Where | What |
| --- | --- | --- |
| Main site | `/` (dipengupta.com) | A regular, fast website: music, collections, about, misc, global search |
| iPod | `/ipod` (ipod.dipengupta.com) | A 1:1 iPod Classic with a click wheel; works on phones |
| iTunes | `/itunes` (itunes.dipengupta.com) | An iTunes-7 window; desktop only |

All three read the same SQLite file, so a new recipe, photo, tweet or video
shows up everywhere at once. Media (photos, videos) lives outside the repo.

## Quickstart

```bash
nvm use            # Node 22 (see .nvmrc)
npm install
npm run seed       # creates + fills data/site.db from src/data/seed
npm run dev        # http://localhost:3000
```

Photos and videos are not in git. Put them in `./media` (`scripts/media/pull-fly.sh`
restores from production, or re-ingest originals with `npm run media:ingest`);
without them pages render with soft placeholders. `npm run media:check` reports
what is missing.

Subdomain mode in development: `http://ipod.localhost:3000/` and
`http://itunes.localhost:3000/` work in Chrome and Safari without any DNS setup.

### Docker

```bash
docker compose up --build   # http://localhost:3000, ./media mounted read-only
```

### Production

One Fly machine, one volume (`/data`: database + media). `scripts/deploy.sh`
runs the checks and `fly deploy`; `scripts/media/push-fly.sh` copies new media
to the volume. See `docs/runbooks/deploy.md`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev server / production build / serve the build |
| `npm run seed` / `seed:force` | Migrate + sync seed data (only changed tables) / wipe and rebuild |
| `npm run db:generate` | Generate a Drizzle migration after editing `src/lib/db/schema.ts` |
| `npm test` / `test:watch` | Vitest unit + integration (offline, ~2 s) |
| `npm run e2e` / `e2e:ui` | Playwright: builds into `.next-e2e`, seeds, serves, tests all three views |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run media:ingest` | Normalize photos into `media/` + the manifest (see runbook) |
| `npm run media:check` | Verify references vs manifest vs files on disk |
| `npm run media:posters` | Extract a poster frame per UGG episode (ffmpeg) |
| `npm run content:recipe` / `content:article` / `content:tweets` | Add content to the seed files |
| `npm run import:ugg:instagram` | Import new UGG Chronicles episodes from an Instagram export |
| `npm run import:spotify` | Refresh the committed Spotify preview seed |

## Routine tasks

Each has a runbook in `docs/runbooks/`:
[add a recipe](docs/runbooks/add-recipe.md),
[add photos](docs/runbooks/add-images.md),
[add Alison photos](docs/runbooks/add-alison-photos.md),
[add an article](docs/runbooks/add-article.md),
[add tweets](docs/runbooks/add-tweets.md),
[import UGG videos](docs/runbooks/import-ugg.md),
[sync media](docs/runbooks/media-sync.md),
[deploy](docs/runbooks/deploy.md),
[add a view](docs/runbooks/add-view.md),
[add a content section](docs/runbooks/add-section.md).

## Environment

Copy `.env.example` to `.env` for overrides. `DATABASE_PATH` (SQLite file),
`MEDIA_DIR` (media root), `SITE_DOMAIN` (enables subdomain routing and
canonical redirects), `SITE_URL` (sitemap origin when there is no domain),
`CSP_ENFORCE=1` (turn the report-only Content Security Policy into an
enforced one). No API keys are needed anywhere.

## Where things are

- `docs/architecture.md`: how it fits together (read before structural changes)
- `docs/adr/`: why SQLite, why media is outside git, why the URL picks the view
- `docs/tasks.md`: backlog
- `CLAUDE.md` / `AGENTS.md`: rules and checklists for coding agents
