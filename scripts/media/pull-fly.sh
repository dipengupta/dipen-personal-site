#!/usr/bin/env bash
# Restore ./media from the Fly volume (fresh machine, or a lost local copy).
#   scripts/media/pull-fly.sh [--images-only] [--app <name>]
set -euo pipefail
cd "$(dirname "$0")/../.."
APP="${FLY_APP:-$(sed -n 's/^app = "\(.*\)"/\1/p' fly.toml)}"
LOCAL="${MEDIA_DIR:-./media}"
SUBDIR=.
while [[ $# -gt 0 ]]; do
  case "$1" in
    --images-only) SUBDIR=images ;;
    --app) APP="$2"; shift ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
  shift
done
mkdir -p "$LOCAL"
echo "pulling $SUBDIR from $APP:/data/media into $LOCAL"
fly ssh console -a "$APP" -C "sh -c 'cd /data/media && tar -cf - $SUBDIR'" | tar -C "$LOCAL" -xf -
echo "done"
