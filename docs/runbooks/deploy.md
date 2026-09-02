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

Done once, on 2026-09-02, for `dipengupta.com` (registered at Porkbun). The
records below are what is live; repeat the shape for any new hostname.

Get the addresses with `fly ips list -a dipen-personal-site`. The IPv4 is a
*shared* Fly address (free): Fly routes it by hostname, which is why the
certificates are what actually make the domain work.

In the Porkbun DNS editor, first delete the parking records the registrar
creates (an `ALIAS` on the root and a `CNAME` for `www`), then add:

| Type | Host | Answer |
| --- | --- | --- |
| A | *(blank = apex)* | `66.241.124.51` (shared IPv4) |
| AAAA | *(blank = apex)* | `2a09:8280:1::181:e31d:0` (dedicated IPv6) |
| CNAME | `www` | `dipen-personal-site.fly.dev` |
| CNAME | `ipod` | `dipen-personal-site.fly.dev` |
| CNAME | `itunes` | `dipen-personal-site.fly.dev` |

DNS-only, never proxied through a CDN, or Fly cannot validate the domain.

```bash
fly certs add dipengupta.com        -a dipen-personal-site
fly certs add www.dipengupta.com    -a dipen-personal-site
fly certs add ipod.dipengupta.com   -a dipen-personal-site
fly certs add itunes.dipengupta.com -a dipen-personal-site
fly certs list -a dipen-personal-site
```

Then switch on subdomain routing (this restarts the machine, so never run it
while `scripts/media/push-fly.sh` is streaming files):

```bash
fly secrets set SITE_DOMAIN=dipengupta.com -a dipen-personal-site
```

With `SITE_DOMAIN` set the app serves the device views on their subdomains,
redirects `www.`, sends the apex `/ipod` and `/itunes` paths to the
subdomains, and gives `sitemap.xml` / `robots.txt` real URLs. Without it
(fly.dev, CI) the path prefixes serve the views directly.

**Expect a gap between "Issued" and working TLS.** `fly certs list` reported
`Issued` immediately while `fly certs show` still said `Not verified`, and
the TLS handshake failed with `SSL_ERROR_SYSCALL` for about three minutes
after the records went live. Port 80 answering with a 301 to HTTPS is the
sign that Fly's edge already knows the hostname and only verification is
outstanding. Poll rather than re-issue:

```bash
until [ "$(curl -s -o /dev/null -w '%{http_code}' https://dipengupta.com/)" = 200 ]; do sleep 30; done
```

A wildcard is possible instead (`fly certs add "*.dipengupta.com"` plus the
apex) but needs the `_acme-challenge` CNAME Fly prints; per-hostname
certificates are simpler while the list is short.

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
