# Add photos (guitars, Alison, kitchen wins, profile, anything)

Images never go into git. `npm run media:ingest` normalizes them into
`MEDIA_DIR/images/<collection>/` (WebP, 800px base plus 400px and 1600px
variants, EXIF orientation applied, metadata stripped) and records them in
`src/data/media-manifest.json`, which *is* committed. HEIC works on macOS
(converted through `sips`).

## 1. Ingest

```bash
# Alison: one photo = one gallery row, captioned with the capture month/year
npm run media:ingest -- --source ~/Pictures/alison-2026 --collection alison --gallery alison --title Alison

# Kitchen wins / profile photos: gallery rows titled from the file name
npm run media:ingest -- --source ~/Pictures/dinner --collection contact --gallery kitchen --slugify

# A new guitar: just the files; add the row to guitars.json by hand (step 2)
npm run media:ingest -- --source ~/Pictures/new-guitar --collection music
```

Options: `--slugify` (kebab-case file stems), `--force` (regenerate
variants), `--dry-run`, `--caption exif-date|none`.

Keep file names stable: the URL is `/media/images/<collection>/<stem>.webp`
and it is what seed rows reference. Alison files follow `alison-NNN`.

## 2. Reference it

- Gallery sections (`--gallery`) were appended to `src/data/seed/gallery.json`
  already; edit titles/descriptions there if you like.
- Guitars: add a row to `src/data/seed/guitars.json` with the new `imagePath`.
- Anything else: use the same `/media/images/...` path.

## 3. Verify, commit, ship

```bash
npm run media:check     # every reference has a manifest entry and a file
npm test                # includes the manifest reference test
git add src/data && git commit -m "Add Alison photos, Aug 2026"
scripts/media/push-fly.sh --dry-run && scripts/media/push-fly.sh   # copy the files to the volume
scripts/deploy.sh                                                  # ship the seed/manifest change
```

The Alison grid renders whole frames rather than square crops (`fit="natural"`
on `PhotoGrid`), because many of the 2024-25 photos came from Instagram
stories with the caption burned into the image. Tiles take each photo's own
aspect ratio, so nothing is cut off.

Push media before deploying so the new rows never point at missing files.
