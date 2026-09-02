# ADR 0002: Media lives outside the repository

Status: accepted, September 2026

## Context

Photos and videos dwarf the code: 2.9 GB of UGG Chronicles MP4s, ~18 MB of
responsive WebP images today, and both grow every year. The old sites either
committed full-resolution camera JPEGs (90 MB in git history) or kept videos
out of git by hand. Object storage was ruled out for now (cost); the Fly
volume that already holds the database has room.

## Decision

- All media lives in one tree, `MEDIA_DIR` (`./media` locally, `/data/media`
  on the Fly volume), gitignored. Layout:
  `images/<collection>/<name>[-400|-1600].webp` and `videos/ugg/ugg-N.mp4`.
- The app serves it through `app/media/[...path]/route.ts` (allowlisted
  segments and extensions, realpath confined to `MEDIA_DIR`, ETag, Range,
  immutable caching). The historical `/api/video/[file]` URL is a thin wrapper
  over the same file server so the device views are unchanged.
- The repo commits a small **manifest** (`src/data/media-manifest.json`)
  written by `npm run media:ingest`: dimensions, which variants exist, a
  16px blur placeholder and the EXIF capture time for every image. Pages
  render correct aspect ratios and `srcset`s without touching the files, and
  a unit test fails the build if a seed row references an image that was
  never ingested.
- Images are standardized by the ingest script: WebP, 800px base (the iPod's
  format and the URL every view uses), 400px and 1600px variants, quality 80,
  EXIF orientation baked in, metadata stripped. Originals stay wherever the
  owner keeps them; the script never modifies or deletes them.
- Sync to production is a file copy: `scripts/media/push-fly.sh` streams new
  or changed files onto the volume over `fly ssh`.

## Consequences

- A fresh clone renders with placeholders until `media/` is populated (pull
  from Fly with `scripts/media/pull-fly.sh` or re-ingest from originals).
- The manifest is the contract between content and files: adding a photo is
  always `media:ingest` (which may also append the gallery row) and a commit.
- Moving to object storage later means changing `serveFile` to proxy or
  redirect; URLs and the manifest stay the same.
