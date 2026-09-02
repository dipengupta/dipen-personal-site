# Tasks

A lightweight backlog. Move items between the lists as they change; keep the
Done list to the last few releases and prune it.

## In progress

- (nothing)

## Backlog

- **Domain + certs**: buy dipengupta.com, set `SITE_DOMAIN`, `fly certs add`
  for the apex, `www`, `ipod`, `itunes` (or a wildcard), DNS records, then cut
  over from pythonanywhere and dipen-ipod-classic.fly.dev (redirects there).
- **Rotate old secrets**: the archived Django repo has Twitter/X API keys and
  a Django SECRET_KEY committed in `personalSite/settings.py`. Revoke them.
- **Places page**: the seeded `locations` table (27 visited places with trip
  notes) has no view. A simple list under Misc would surface it; the old Map
  Room is deliberately not coming back.
- **Kitchen Wins / Photos captions**: the profile and kitchen galleries have
  one-line descriptions; consider richer captions now that the main site shows them large.
- **Lighthouse budget in CI**: run Lighthouse CI against the built app for
  `/`, `/music/guitars`, `/collections/recipes` and fail under 90 performance.
- **Content Security Policy**: currently report-only; enforce once the
  device views have been exercised in production for a while.
- **Video posters**: generate a poster frame per UGG episode at import time
  (ffmpeg) so the Instagram page has thumbnails instead of neutral cards.
- **Article ingest from Substack export**: `scripts/content/new-article.ts`
  takes a saved HTML file; a fetch-by-URL mode would remove a manual step.

## Done

- 2026-09: New repo. Main site + iPod + iTunes in one Next.js app, one SQLite
  database, media on a volume, subdomain routing, ingest/check scripts,
  runbooks, CI, Docker/Fly config.
