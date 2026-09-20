# Add Alison photos

Alison is a tree. The collection at `/collections/alison` is one long
chronological run of photos of her. The page opens on **Photos**, one gallery
row per picture captioned with the capture month, on an even 3:4 grid; the
**Quotes** half of the switch slides in the frames that carry a quote burned
into the image, at their own 9:16 shape and with no month/year caption,
because the picture already says it. This runbook is the
Alison-specific layer on top of [add photos](add-images.md): where the run
currently ends, and what to do with the next batch.

## Where the collection stands

| | |
| --- | --- |
| Photos | 221 (`alison-001` to `alison-221`) |
| Photos / Quotes split | 170 plain, 51 with a quote on the image |
| Covers | October 2022 to September 2026, 46 of those 48 months |
| Newest photo | `alison-221`, captured **2026-09-16 18:29** |
| Last added | 2026-09-17: 66 photos (`alison-156` to `alison-221`) |

Three sources so far, which is why the frames are not all the same shape:

- `alison-001` to `alison-095`: phone originals from `~/Desktop/Alison`,
  3:4, no text on the image.
- `alison-096` to `alison-155`: recovered from the Instagram export
  `instagram-dipengupta-2025-09-21-EHEZIIlw` (story archive), 9:16. 51 of
  these 60 carry a quote or caption burned in; those are the whole of the
  Quotes half.
- `alison-156` to `alison-221`: phone originals from
  `~/Desktop/Alison/new_alison`, 3:4 (HEIC, plus two JPEGs), no text. This
  batch back-filled November 2023 to September 2025 and extended the run a
  full year past where the Instagram export stopped.

**Outstanding:** nothing pending. The gap the 2025-09-21 export left is
closed. Note the run is now stems-out-of-order on purpose: `alison-156`+ are
spread through the middle of the collection, not bunched at the end (see
[Keep the run chronological](#keep-the-run-chronological)).

## A new batch of phone originals

The easy case. Name the files so the stems continue the run
(`alison-222.jpeg`, `alison-223.jpeg`, ...), point the ingest at the folder and
let EXIF do the work:

```bash
npm run media:ingest -- --source ~/Pictures/alison-new --collection alison --gallery alison --title Alison
```

Capture dates come from EXIF, the description becomes "Month YYYY", and the new
gallery rows are appended in capture order. HEIC is fine: ingest converts
through macOS `sips` first, and `sips` keeps the EXIF date. Check the
`--dry-run` output reports a date for every file before committing to it, since
a photo with no date gets an empty description and no place in the ordering.

## Drop the ones already on the site

A batch off the phone usually overlaps what is already here, because a story
frame and its phone original are the same shutter press. Match them on the
exact EXIF second: `takenAt` in `src/data/media-manifest.json` is the naive
capture time stamped with a `Z`, which is exactly what `exifDate()` in
`scripts/media/ingest-images.ts` produces, so the strings compare directly.

The rule used for the 2026-09 batch: **import the original only when its twin
already on the site carries a quote.** That keeps a picture on the date in the
Photos half (the quote frame lives in the other half), and avoids showing the
same moment twice where the twin is textless. 32 of those 70 files were
re-captures; 28 had a quote twin and came in, 4 were dropped.

## A new batch from an Instagram export

Stories are the usual source, and they need two fixes before ingest.

**1. Find the Alison photos by looking at them, not by searching captions.**
In the 2025 export, searching story titles for "Alison" was wrong in both
directions: 3 hits were not pictures of her (she was being credited for a
quote), and 20 actual Alison photos had no "Alison" in the title, because the
text was burned into the image rather than stored as a title. Build a contact
sheet of the candidate window and check it by eye. Videos can be skipped
wholesale: all 99 in that window were UGG Chronicles, none were Alison.

**2. Put the capture dates back.** Instagram strips EXIF from the exported
JPEGs, so `media:ingest` would derive no date, give every row an empty
description and leave the ordering to file name. The dates are still in the
export at `your_instagram_activity/media/stories.json`, per story, under
`media_metadata.photo_metadata.exif_data[0].date_time_original`. Write them
back onto the staged copies (56 of 60 had one last time; the rest fall back to
the story's own `creation_timestamp`, which is the same day):

```python
# stage each chosen photo as alison-NNN.jpg, oldest first, with its date
from PIL import Image
im = Image.open(src).convert('RGB')
exif = im.getexif()
exif[0x0132] = date                          # Image.DateTime
exif.get_ifd(0x8769)[0x9003] = date          # Photo.DateTimeOriginal
exif.get_ifd(0x8769)[0x9004] = date          # DateTimeDigitized
im.save(dst, 'JPEG', quality=95, exif=exif)  # date is "YYYY:MM:DD HH:MM:SS"
```

Number the staged files from the current end of the run (`alison-222` next) in
chronological order, then ingest as above and confirm the reported dates look
right before committing.

## Quotes burned into the image

Many story frames carry their caption or a quote as pixels. Two things follow.

**The Quotes grid does not crop them.** That half renders whole frames
(`fit="natural"` on `PhotoGrid`), so the text stays readable in the grid and in
the lightbox. Every story frame is 9:16, so the half is uniform anyway. Do not
switch it to a fixed ratio and do not crop these to 3:4: a crop eats into the
text, which is the whole point of them.

The Photos half is the opposite: `fit="portrait"`, one even 3:4 grid. 160 of
those 170 photos are 3:4 already, and the 10 that are not have no text on them,
so a centre crop costs nothing and the grid stops going ragged.

**Transcribe the text into `quote`.** `gallery_items.quote` is nullable and
holds what the image says, verbatim. It is the whole feature:

- a row with a `quote` is in the **Quotes** half of the page and renders with
  no month/year caption; a row without one is in the **Photos** half and keeps
  its caption. `app/(main)/collections/alison/page.tsx` splits on it and
  `src/components/main/AlisonGrid.tsx` holds the switch (shared
  `Segmented.tsx`) and picks the `fit`.
- it becomes the tile's `alt` and the lightbox caption, so a screen reader can
  reach text that is otherwise only pixels.
- `src/lib/search/searchContent.ts` indexes it, so the quotes are searchable.

Ingest cannot read pixels, so this is a hand edit to `src/data/seed/gallery.json`
after the batch lands. The fastest way to work through 60 frames is a contact
sheet of the `-400.webp` variants, ~10 per sheet, labelled with the stem, then
a full-size look at anything too small to read. House style (no em-dashes, no
emoji) does not apply here: this is quoted content, rendered as written, and
`tests/unit/mainCopy.test.ts` does not scan `gallery.json`.

## Keep the run chronological

`media:ingest` appends new rows to the end of `gallery.json`, and `sortOrder`
is the array index at seed time, so file order is display order. Any batch that
back-fills dates earlier than the current last photo would sit in the wrong
place. Re-sort the `category: "alison"` rows in place afterwards (leaving every
other category where it is) by:

1. `takenAt` from the manifest where there is one, else
2. the month parsed out of `description` ("Month YYYY"), keeping the existing
   relative order inside a month.

`alison-001` to `alison-095` predate the manifest carrying `takenAt`, so they
go through branch 2. Stems stay in ingest order, which is cosmetic; row ids
shift, which moves the `#alison-<id>` anchors, and that is fine since
`src/lib/search/searchContent.ts` derives them from the rows at runtime.

## Counts to update

Four assertions hardcode Alison numbers and fail until they are updated in the
same change:

| File | Assertion |
| --- | --- |
| `tests/integration/seed.test.ts` | total alison rows, and the 170 / 51 split |
| `tests/integration/routes.test.ts` | `alison.items` from the content route |
| `e2e/main.spec.ts` | the lightbox counter and the 3:4 tile count, both the Photos half |
| `e2e/main.spec.ts` | the natural-fit tile count, the Quotes half |
| `e2e/main.spec.ts` | the quote switch test: both halves' counts |

## Ship it

```bash
npm run seed:force      # rebuild data/site.db with the new rows and order
npm run media:check     # every reference has a manifest entry and a file
npm test                # unit + integration
npm run e2e             # the grid, the lightbox and the quote toggle
git add src/data src/lib tests e2e docs && git commit -m "Add Alison photos, <range>"
scripts/media/push-fly.sh --dry-run && scripts/media/push-fly.sh
scripts/deploy.sh
```

Media before deploy, always, so a live row never points at a file the volume
lacks. Then check the page: the tile count should match, the caption on the
last Photos tile should be the new month, and the Quotes half of the switch
should still show only the frames with text.
