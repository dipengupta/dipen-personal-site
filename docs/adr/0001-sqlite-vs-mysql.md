# ADR 0001: SQLite over MySQL (or Postgres)

Status: accepted, September 2026

## Context

The site needs one content database read by three views (main site, iPod,
iTunes) from a single Node process on one Fly machine. Content changes arrive
through git (seed JSON + a fingerprinted sync on boot) plus small additive
background refreshes (YouTube RSS, Substack RSS, Spotify previews). There is
no admin UI, no concurrent editors, and no user-generated writes.

The old Django site had an empty `DATABASES` block and a vestigial
`mysql_setup.py` from a PythonAnywhere MySQL era; the iPod repo already runs
on SQLite via better-sqlite3 + Drizzle.

## Options

| | SQLite (file on the volume) | MySQL / Postgres (managed or a second Fly app) |
| --- | --- | --- |
| Reads from server components | synchronous, sub-millisecond, in-process | network round trip, connection pool, async everywhere |
| Ops | none; the file lives on the `/data` volume | a second service to run, patch, back up, pay for |
| Cost on Fly | 0 extra | a second machine + volume (or an external provider) |
| Migrations | Drizzle SQL files, already in repo | same tooling, over the network |
| Backups | copy one file (`scripts/db/backup.sh`) | dumps / provider snapshots |
| Scaling out | one machine only (fine: content site, seconds of downtime on deploy is acceptable) | multiple app machines possible |
| Concurrency | one writer at a time (WAL) | many writers |
| Dev setup | `npm run seed` | run a database locally or in Docker |

## Decision

SQLite. Every property that would favour a client-server database (many
writers, multiple app machines, an admin UI with concurrent editors) is absent,
and every cost it adds is paid immediately.

Concretely: `better-sqlite3` + Drizzle, WAL mode, file at
`DATABASE_PATH` (`./data/site.db` locally, `/data/site.db` on the Fly volume),
migrations applied and seeds synced by the container entrypoint on every boot.

## Consequences

- Never scale the Fly app past one machine.
- Backups: `scripts/db/backup.sh` pulls the file with `fly ssh sftp`; the
  content itself is also fully reproducible from the committed seed files.
- Revisit if any of these appear: a second app machine, an in-browser
  editor with multiple users, write-heavy features (comments, analytics).
  The Drizzle schema ports to Postgres with mechanical changes.
