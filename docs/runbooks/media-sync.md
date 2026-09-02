# Media sync (local <-> Fly volume)

Media is not in git or in the Docker image. The Fly volume at `/data/media`
is the production copy; your machine holds the working copy (`./media`, or
`MEDIA_DIR`). Keep originals in Photos/iCloud as usual.

| Task | Command |
| --- | --- |
| Push new/changed files to production | `scripts/media/push-fly.sh` (`--dry-run` first) |
| Restore a local copy from production | `scripts/media/pull-fly.sh` (`--images-only` skips 3 GB of video) |
| Check references vs manifest vs files | `npm run media:check` |
| Free space on the volume | `fly volumes list`, then extend with `fly volumes extend` |

`push-fly.sh` diffs by path and size and streams one tar over `fly ssh
console`; the machine must be running (`fly machine start` if it is stopped).
If ssh streaming misbehaves, `fly ssh sftp shell` and `put` the files by hand.

Order of operations for a content change: ingest -> commit -> push media ->
deploy. That way a deployed row never points at a file the volume lacks.
