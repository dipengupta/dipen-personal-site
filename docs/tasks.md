# Tasks

A lightweight backlog. Move items between the lists as they change; keep the
Done list to the last few releases and prune it.

## In progress

- (nothing)

## Backlog

- **Rotate old secrets**: the archived Django repo has Twitter/X API keys and
  a Django SECRET_KEY committed in `personalSite/settings.py`. Revoke them.
- **Alison, Sep 2025 onward**: the collection ends at 2025-09-19 because that
  is where the Instagram export used to fill it stops. Request a fresh export
  covering 2025-09-20 to today (~30 photos, including a full autumn) and run
  it through `docs/runbooks/add-alison-photos.md`.
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

- 2026-09-04: Alison grew from 95 to 155 photos, closing the gap from December
  2023 to September 2025 out of the 2025-09-21 Instagram export. The grid now
  shows whole frames instead of square crops, so the captions burned into the
  story photos stay readable.

- 2026-09-02: dipengupta.com (Porkbun) pointed at the app: A/AAAA on the apex,
  CNAMEs for www/ipod/itunes, four Fly certificates, `SITE_DOMAIN` set.

- 2026-09-02: First production deploy as Fly app `dipen-personal-site`
  (region iad, volume `site_data`), media pushed with `scripts/media/push-fly.sh`;
  the old `dipen-ipod-classic` app destroyed. Code lives at
  https://github.com/dipengupta/dipen-personal-site.

- 2026-09: New repo. Main site + iPod + iTunes in one Next.js app, one SQLite
  database, media on a volume, subdomain routing, ingest/check scripts,
  runbooks, CI, Docker/Fly config.
