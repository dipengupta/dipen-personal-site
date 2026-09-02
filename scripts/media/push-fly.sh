#!/usr/bin/env bash
# Copy new or changed media files from ./media (or $MEDIA_DIR) to the Fly
# volume at /data/media. Compares by relative path + size, then streams only
# the difference as one tar over `fly ssh console`.
#
#   scripts/media/push-fly.sh [--dry-run] [--app <name>]
#
# Requires `fly auth login` and a running machine (fly machine start if the
# app is scaled to zero). Fallback when ssh streaming misbehaves:
#   fly ssh sftp shell   then   put media/images/x.webp /data/media/images/x.webp
set -euo pipefail
cd "$(dirname "$0")/../.."

APP="${FLY_APP:-$(sed -n 's/^app = "\(.*\)"/\1/p' fly.toml)}"
LOCAL="${MEDIA_DIR:-./media}"
REMOTE=/data/media
DRY=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY=1 ;;
    --app) APP="$2"; shift ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
  shift
done

[[ -d "$LOCAL" ]] || { echo "no media directory at $LOCAL" >&2; exit 1; }

echo "app: $APP  local: $LOCAL  remote: $REMOTE"
remote_list="$(mktemp)"; local_list="$(mktemp)"; trap 'rm -f "$remote_list" "$local_list"' EXIT

# "size path" lines, sorted by path, for both sides.
fly ssh console -a "$APP" -C "sh -c 'mkdir -p $REMOTE && cd $REMOTE && find . -type f -printf \"%s %p\\n\"'" \
  | tr -d '\r' | sort -k2 > "$remote_list" || true
(cd "$LOCAL" && find . -type f ! -name '.DS_Store' -exec stat -f '%z %N' {} + 2>/dev/null || (cd "$LOCAL" && find . -type f ! -name '.DS_Store' -printf '%s %p\n')) \
  | sort -k2 > "$local_list"

# Files whose "size path" line is missing remotely: new or changed.
todo="$(comm -23 "$local_list" "$remote_list" | cut -d' ' -f2-)"
count="$(printf '%s' "$todo" | grep -c . || true)"
if [[ "$count" -eq 0 ]]; then echo "remote is up to date"; exit 0; fi

total="$(printf '%s\n' "$todo" | (cd "$LOCAL" && xargs -I{} stat -f '%z' {} 2>/dev/null || true) | awk '{s+=$1} END {printf "%.1f MB", s/1048576}')"
echo "$count file(s) to push ($total):"
printf '%s\n' "$todo" | head -20
[[ "$count" -gt 20 ]] && echo "  ..."
[[ "$DRY" -eq 1 ]] && { echo "[dry-run] nothing sent"; exit 0; }

printf '%s\n' "$todo" | (cd "$LOCAL" && tar -cf - -T -) \
  | fly ssh console -a "$APP" -C "sh -c 'cd $REMOTE && tar -xf -'"
echo "done: pushed $count file(s)"
