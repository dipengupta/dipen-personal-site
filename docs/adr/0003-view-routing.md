# ADR 0003: Views are chosen by URL (subdomain first, path fallback)

Status: accepted, September 2026

## Context

The site has three front-ends over one data set: the main website, the iPod
Classic, and iTunes. The iPod repo picked a view by device (desktop bounced to
iTunes, portrait phones to the iPod, a phone tilt switched live) with the rule
duplicated in four places. The new site wants `ipod.dipengupta.com` and
`itunes.dipengupta.com` to be first-class addresses that are easy to extend.

## Decision

- `src/lib/site/views.ts` is the registry: each view has a subdomain label and
  a path prefix. Adding a view is one entry plus a route folder.
- `middleware.ts` (rules in `src/lib/site/host.ts`, unit-tested) rewrites
  `<sub>.<SITE_DOMAIN>/` to the view's path, drops `www.`, redirects the apex's
  `/ipod` and `/itunes` to their canonical subdomains when `SITE_DOMAIN` is set,
  and does nothing special on other hosts (fly.dev, CI), where the path prefixes
  serve directly. In development `SITE_DOMAIN` defaults to `localhost` so
  `ipod.localhost:3000` works alongside `localhost:3000/ipod`.
- Cross-view links go through `viewHref()` with the request's host, so they are
  absolute subdomain URLs on the real domain and plain paths elsewhere. They are
  ordinary anchors: the views are separate Next root layouts and switching is a
  full page load on purpose (different CSS resets, viewport rules, fonts).
- The URL is authoritative. The single remaining device rule is that a portrait
  phone cannot use the iTunes window and is sent to the iPod before paint
  (`src/lib/device/viewRouting.ts`, mirrored as an inline script).

## Consequences

- Theme and font cookies of the device views are per origin under subdomains;
  each view remembers its own skin. Accepted.
- `www.ipod.dipengupta.com` works but redirects to `ipod.dipengupta.com`.
- Certificates: one per host on Fly (`fly certs add` for the apex, `www`,
  `ipod`, `itunes`), or a wildcard. See `docs/runbooks/deploy.md`.
