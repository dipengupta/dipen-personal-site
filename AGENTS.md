# AGENTS.md

Guidance for AI coding agents. Same rules as `CLAUDE.md`, summarized;
`docs/architecture.md` has the system design.

## What this is

One Next.js app, one SQLite file, one Docker container, three front-ends over
the same content: the main website (`app/(main)`), an iPod Classic and an
iTunes window (`app/(devices)`). Media lives in `MEDIA_DIR`, not in git.

## Definition of done

1. `npm run typecheck` passes.
2. `npm test` passes (unit + integration; offline).
3. `npm run e2e` passes if you touched UI, navigation, routing or APIs.
4. Tests covering the change were added or updated, not just left green.
5. `docs/architecture.md`, `README.md`, `CLAUDE.md`, the relevant runbook and
   `.env.example` updated if behavior, commands, env vars or structure changed.
6. New migrations committed (`npm run db:generate`) when `schema.ts` changed.
7. `npm run media:check` passes if you touched images or seed image paths.
8. Nothing in `src/components/ipod|itunes/**` was restyled.

## Files to touch, by change type

| Change | Files |
| --- | --- |
| New main-site page | `app/(main)/<section>/<page>/page.tsx`, `src/lib/main/routes.ts`, copy in `src/content/`, `e2e/main.spec.ts` |
| New content section | `src/lib/db/schema.ts`, `drizzle/` (generated), `src/data/seed/`, `src/lib/seed/seedDb.ts`, `src/lib/content/queries.ts`, `src/lib/search/searchContent.ts` + `src/lib/main/searchTargets.ts`, then per-view surfaces (`docs/runbooks/add-section.md`) |
| New view / subdomain | `src/lib/site/views.ts`, `app/(devices)/<view>/`, `tests/unit/siteViews.test.ts`, `e2e/hostRouting.spec.ts` (`docs/runbooks/add-view.md`) |
| Photos | `npm run media:ingest`, seed rows, `src/data/media-manifest.json` (generated) |
| Security headers / CSP | `src/lib/site/securityHeaders.ts` |
| Live data source | `src/lib/fetchers/`, `fetch_meta` staleness, `tests/integration/fetchers.test.ts` + fixture XML |

## Invariants

- Views are chosen by URL; the device views' CSS and viewport rules never
  load under `app/(main)` and vice versa (route-group layouts).
- Fetchers are additive with seeded fallback; seeded content is never
  overwritten or deleted by a feed.
- Article HTML is sanitized when stored; render `bodyHtml` as trusted.
- Main-site copy has no em-dashes or emoji (tested).
- Never scale the Fly app past one machine (SQLite + media on one volume).

## Verifying UI work

`npm run e2e` boots its own seeded production server. For a look:
`npm run seed && npm run dev`, then `npx playwright screenshot --viewport-size=1280,900 http://localhost:3000/ out.png`.
