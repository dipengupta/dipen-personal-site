#!/usr/bin/env bash
# Pull a consistent copy of the production SQLite database.
#   scripts/db/backup.sh [--app <name>]
# Uses better-sqlite3's online backup API on the machine (safe with WAL), then
# downloads the snapshot to backups/site-<timestamp>.db (gitignored).
set -euo pipefail
cd "$(dirname "$0")/../.."
APP="${FLY_APP:-$(sed -n 's/^app = "\(.*\)"/\1/p' fly.toml)}"
[[ "${1:-}" == "--app" ]] && APP="$2"
mkdir -p backups
OUT="backups/site-$(date -u +%Y%m%dT%H%M%SZ).db"
fly ssh console -a "$APP" -C "node -e \"require('better-sqlite3')(process.env.DATABASE_PATH||'/data/site.db',{readonly:true}).backup('/tmp/site-backup.db').then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})\""
fly ssh sftp get -a "$APP" /tmp/site-backup.db "$OUT"
echo "saved $OUT"
