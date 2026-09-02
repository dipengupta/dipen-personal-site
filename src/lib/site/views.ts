/**
 * The view registry: every front-end this site ships, and how each one is
 * addressed. A view is reachable two ways:
 *
 *   - by subdomain when the request host belongs to SITE_DOMAIN
 *     (ipod.dipengupta.com), and
 *   - by path prefix everywhere else (/ipod on localhost or *.fly.dev).
 *
 * Adding a view: add an entry here and a route folder under app/ whose URL is
 * `path`. `middleware.ts` and every cross-view link derive from this table, so
 * nothing else needs to know the new name. See docs/runbooks/add-view.md.
 */

export type ViewId = 'main' | 'ipod' | 'itunes';

export interface ViewDef {
  id: ViewId;
  /** Human label used by cross-view links. */
  label: string;
  /** Host label in front of SITE_DOMAIN; null for the apex (the main site). */
  subdomain: string | null;
  /** Path prefix that serves the view in path mode. '/' for the main site. */
  path: string;
}

export const VIEWS: Record<ViewId, ViewDef> = {
  main: { id: 'main', label: "Dipen's Website", subdomain: null, path: '/' },
  ipod: { id: 'ipod', label: "Dipen's iPod", subdomain: 'ipod', path: '/ipod' },
  itunes: { id: 'itunes', label: "Dipen's iTunes", subdomain: 'itunes', path: '/itunes' },
};

export const VIEW_LIST: ViewDef[] = Object.values(VIEWS);

/** Views that live on a subdomain / path prefix (everything but the apex). */
export const DEVICE_VIEWS: ViewDef[] = VIEW_LIST.filter((v) => v.subdomain !== null);

/** What a link (or the middleware) needs to know about the current request. */
export interface SiteConfig {
  /** Request host, port included, e.g. "ipod.dipengupta.com" or "localhost:3000". */
  host: string;
  /** Apex domain subdomains hang off; '' disables subdomain mode entirely. */
  domain: string;
  /** "http:" or "https:", used when building absolute cross-subdomain URLs. */
  protocol: 'http:' | 'https:';
}

export function splitHost(host: string): { hostname: string; port: string } {
  const idx = host.lastIndexOf(':');
  if (idx === -1 || host.endsWith(']')) return { hostname: host.toLowerCase(), port: '' };
  return { hostname: host.slice(0, idx).toLowerCase(), port: host.slice(idx) };
}

/** True when `hostname` is the domain itself or a subdomain of it. */
export function hostBelongsToDomain(hostname: string, domain: string): boolean {
  if (!domain) return false;
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

/** Base URL (no trailing slash) for a view given the current request. */
export function viewOrigin(view: ViewId, cfg: SiteConfig): string | null {
  const { hostname, port } = splitHost(cfg.host);
  if (!hostBelongsToDomain(hostname, cfg.domain)) return null;
  const def = VIEWS[view];
  const host = def.subdomain ? `${def.subdomain}.${cfg.domain}` : cfg.domain;
  return `${cfg.protocol}//${host}${port}`;
}

/**
 * The href that reaches `view` from the current request: an absolute
 * subdomain URL when the visitor is on SITE_DOMAIN, otherwise the path prefix.
 */
export function viewHref(view: ViewId, cfg: SiteConfig | null | undefined): string {
  if (!cfg) return VIEWS[view].path;
  const origin = viewOrigin(view, cfg);
  return origin ? `${origin}/` : VIEWS[view].path;
}

/** Which view a path-mode pathname belongs to (longest prefix wins). */
export function viewForPath(pathname: string): ViewDef {
  for (const v of DEVICE_VIEWS) {
    if (pathname === v.path || pathname.startsWith(`${v.path}/`)) return v;
  }
  return VIEWS.main;
}

/** The view whose subdomain label this is, if any. */
export function viewForSubdomain(label: string): ViewDef | null {
  return DEVICE_VIEWS.find((v) => v.subdomain === label) ?? null;
}
