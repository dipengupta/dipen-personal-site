#!/usr/bin/env bash
# Deploy to Fly with the footer date and commit baked in.
#
#   scripts/deploy.sh            preflight (typecheck + tests) then fly deploy
#   scripts/deploy.sh --skip-checks
#
# Media is not part of the image: push new files with scripts/media/push-fly.sh.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ "${1:-}" == "--skip-checks" ]]; then
  shift # consume it: the rest of the arguments are forwarded to fly deploy
else
  npm run typecheck
  npm test
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "warning: uncommitted changes; the footer date comes from the last commit" >&2
fi

BUILD_DATE="$(git log -1 --format=%cI)"
GIT_SHA="$(git rev-parse --short HEAD)"
exec fly deploy --build-arg "BUILD_DATE=$BUILD_DATE" --build-arg "GIT_SHA=$GIT_SHA" "$@"
