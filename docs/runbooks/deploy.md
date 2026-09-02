# Deploy

Production is one Fly machine running the Docker image, with a volume
mounted at `/data` holding the SQLite file and all media. `fly.toml` is the
config; `scripts/deploy.sh` wraps `fly deploy` so the footer date and commit
are baked in.

## Every deploy

```bash
scripts/deploy.sh            # typecheck + tests, then fly deploy with BUILD_DATE/GIT_SHA
fly logs                     # the entrypoint runs migrations + seed sync on boot
```

The seed sync re-seeds only tables whose committed seed file changed, so a
deploy is safe on top of live-fetched data already on the volume.

## First-time setup

```bash
fly auth login
fly apps create dipen-personal-site
fly volumes create site_data --region iad --size 10      # room for videos
fly secrets set SITE_DOMAIN=dipengupta.com               # once the domain exists
scripts/deploy.sh
scripts/media/push-fly.sh                                # images + videos onto the volume
```

`fly.toml` ships with `min_machines_running = 1` and `auto_stop_machines =
"off"` (no cold starts). Never scale past one machine: SQLite on a volume.

## Domain and certificates

DNS (all DNS-only, no proxy, so Fly can issue certificates):

| Record | Name | Value |
| --- | --- | --- |
| A / AAAA | `@` | IPs from `fly ips list` |
| CNAME | `www` | `dipen-personal-site.fly.dev` |
| CNAME | `ipod` | `dipen-personal-site.fly.dev` |
| CNAME | `itunes` | `dipen-personal-site.fly.dev` |

```bash
fly certs add dipengupta.com
fly certs add www.dipengupta.com
fly certs add ipod.dipengupta.com
fly certs add itunes.dipengupta.com
fly certs check dipengupta.com
```

(Or one wildcard: `fly certs add "*.dipengupta.com"` plus the apex; it needs
the `_acme-challenge` CNAME Fly prints.) With `SITE_DOMAIN` set the app
serves the device views on their subdomains, redirects `www.`, and sends the
apex `/ipod` and `/itunes` paths to the subdomains. Without it (fly.dev) the
paths just work.

## Cutover from the old sites

- pythonanywhere (Django): replace the app with a redirect to the new domain,
  or let the account lapse.
- `dipen-ipod-classic.fly.dev`: keep the app for a while with a redirect, or
  `fly apps destroy` once links are updated. Its volume holds nothing the new
  app needs (media was re-ingested from originals).

## Backups

`scripts/db/backup.sh` pulls a consistent snapshot of the database into
`backups/`. Media is backed up by keeping originals and the local `media/`
copy; `scripts/media/pull-fly.sh` restores from the volume.
