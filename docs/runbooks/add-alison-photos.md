# Add Alison photos

Alison is a tree. The collection at `/collections/alison` is one long
chronological run of photos of her, one gallery row per photo, captioned with
the capture month. This runbook is the Alison-specific layer on top of
[add photos](add-images.md): where the run currently ends, and what to do with
the next batch.

## Where the collection stands

| | |
| --- | --- |
| Photos | 155 (`alison-001` to `alison-155`) |
| Covers | October 2022 to September 2025, every month |
| Newest photo | `alison-155`, captured **2025-09-19 17:58** |
| Last added | 2026-09-04: 60 photos (`alison-096` to `alison-155`) |

Two different sources so far, which is why the frames are not all the same
shape:

- `alison-001` to `alison-095`: phone originals from `~/Desktop/Alison`,
  3:4, no text on the image.
- `alison-096` to `alison-155`: recovered from the Instagram export
  `instagram-dipengupta-2025-09-21-EHEZIIlw` (story archive), 9:16, and about
  half carry a caption burned into the image.

**Outstanding:** the Instagram export used here was taken on 2025-09-21, so
anything after that is not on the site yet. Request a fresh export covering
**2025-09-20 to today** and run the batch through the section below. At the
observed rate of roughly 3 photos a month that window holds ~30 photos, and it
contains a full autumn.

## A new batch of phone originals

The easy case. Name the files so the stems continue the run
(`alison-156.jpeg`, `alison-157.jpeg`, ...), point the ingest at the folder and
let EXIF do the work:

```bash
npm run media:ingest -- --source ~/Pictures/alison-new --collection alison --gallery alison --title Alison
```

Capture dates come from EXIF, the description becomes "Month YYYY", and the new
gallery rows are appended in capture order. Skip to [Ship it](#ship-it).

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

Number the staged files from the current end of the run (`alison-156` next) in
chronological order, then ingest as above and confirm the reported dates look
right before committing.

## Captions burned into the image

Many story frames carry their caption as pixels. Nothing needs doing: the
Alison grid renders whole frames rather than square crops
(`fit="natural"` on `PhotoGrid`), so the text stays readable in the grid and in
the lightbox. Do not crop these to match the older 3:4 photos; the mixed
heights are deliberate, and rows stay in chronological order.

## Counts to update

Three assertions hardcode the number of Alison photos and fail until they are
updated in the same change:

| File | Assertion |
| --- | --- |
| `tests/integration/seed.test.ts` | gallery rows in category `alison` |
| `tests/integration/routes.test.ts` | `alison.items` from the content route |
| `e2e/main.spec.ts` | the lightbox counter, `2 / 155` |

## Ship it

```bash
npm run media:check     # every reference has a manifest entry and a file
npm test                # unit + integration
npm run e2e             # the grid and lightbox tests
git add src/data tests e2e && git commit -m "Add Alison photos, <range>"
scripts/media/push-fly.sh --dry-run && scripts/media/push-fly.sh
scripts/deploy.sh
```

Media before deploy, always, so a live row never points at a file the volume
lacks. Then check the page: the tile count should match, and the caption on the
last tile should be the new month.
