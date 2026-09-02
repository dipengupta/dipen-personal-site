# Import new UGG Chronicles episodes

Videos live in `MEDIA_DIR/videos/ugg/ugg-<episode>.mp4` (outside git); the
episode list is `src/data/seed/ugg.json` (committed).

1. Request an Instagram data export (JSON format) and unzip it.
2. Import only the episodes newer than what is seeded (copies the MP4s, never
   touches the export):

   ```bash
   npm run import:ugg:instagram -- --source ~/Downloads/instagram-export
   npm run media:posters        # thumbnail per new episode (needs ffmpeg)
   npm run media:check          # every episode has its file
   npm run seed && npm test
   git add src/data/seed/ugg.json && git commit -m "Add UGG Chronicles #219-224"
   ```

3. Push the new files to the volume, then deploy:

   ```bash
   scripts/media/push-fly.sh    # only new/changed files are sent
   scripts/deploy.sh
   ```

`ffprobe` on the PATH gives each episode a duration; without it the import
still works. The legacy `npm run import:ugg` handles the original bespoke
"UGG Project" folder layout.
