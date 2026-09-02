/**
 * Pure host-routing rules used by `middleware.ts` (and unit-tested directly).
 *
 * Modes:
 *   - Subdomain mode: SITE_DOMAIN is set (production). ipod.<domain> serves
 *     the iPod, itunes.<domain> serves iTunes, www.* redirects to the bare
 *     host, and the apex's /ipod and /itunes paths redirect to their canonical
 *     subdomains.
 *   - Path mode: no SITE_DOMAIN (fly.dev, CI). /ipod and /itunes are served
 *     directly and no host is special.
 *   - Dev: SITE_DOMAIN defaults to "localhost" so ipod.localhost:3000 works,
 *     but path URLs are not redirected away (tests and plain browsing keep
 *     working on localhost:3000/ipod).
 */
import {
  hostBelongsToDomain,
  splitHost,
  viewForPath,
  viewForSubdomain,
  VIEWS,
  type ViewId,
} from './views';

export type RouteDecision =
  | { kind: 'next'; view: ViewId }
  | { kind: 'rewrite'; view: ViewId; path: string }
  | { kind: 'redirect'; view: ViewId; url: string };

export interface RouteInput {
  host: string;
  pathname: string;
  search?: string;
  protocol: 'http:' | 'https:';
  /** Apex domain, or '' for path mode. */
  domain: string;
  /** Redirect apex /ipod -> ipod.<domain>? Only when SITE_DOMAIN was set explicitly. */
  canonicalize: boolean;
}

/** SITE_DOMAIN from the environment, lower-cased, with the dev default. */
export function siteDomainFromEnv(env: NodeJS.ProcessEnv = process.env): {
  domain: string;
  canonicalize: boolean;
} {
  const raw = (env.SITE_DOMAIN ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (raw) return { domain: raw, canonicalize: raw !== 'localhost' };
  if (env.NODE_ENV !== 'production') return { domain: 'localhost', canonicalize: false };
  return { domain: '', canonicalize: false };
}

export function routeForHost(input: RouteInput): RouteDecision {
  const { pathname, search = '', protocol, domain, canonicalize } = input;
  const { hostname, port } = splitHost(input.host);
  const pathView = viewForPath(pathname);

  if (!hostBelongsToDomain(hostname, domain)) {
    return { kind: 'next', view: pathView.id };
  }

  let label = hostname === domain ? '' : hostname.slice(0, -(domain.length + 1));

  // www.<anything> is never canonical: drop the prefix and redirect.
  if (label === 'www' || label.startsWith('www.')) {
    label = label === 'www' ? '' : label.slice(4);
    const target = label ? `${label}.${domain}` : domain;
    return {
      kind: 'redirect',
      view: label ? (viewForSubdomain(label)?.id ?? 'main') : pathView.id,
      url: `${protocol}//${target}${port}${pathname}${search}`,
    };
  }

  if (label === '') {
    // Apex. In production the device views live on their subdomains.
    if (canonicalize && pathView.id !== 'main') {
      const rest = pathname.slice(pathView.path.length) || '/';
      return {
        kind: 'redirect',
        view: pathView.id,
        url: `${protocol}//${pathView.subdomain}.${domain}${port}${rest}${search}`,
      };
    }
    return { kind: 'next', view: pathView.id };
  }

  const view = viewForSubdomain(label);
  if (!view) {
    // Unknown subdomain: send it to the apex with the same path.
    return { kind: 'redirect', view: 'main', url: `${protocol}//${domain}${port}${pathname}${search}` };
  }

  // ipod.<domain>/ipod -> ipod.<domain>/ (keep one canonical URL per page).
  if (pathname === view.path || pathname.startsWith(`${view.path}/`)) {
    const rest = pathname.slice(view.path.length) || '/';
    return { kind: 'redirect', view: view.id, url: `${protocol}//${hostname}${port}${rest}${search}` };
  }

  const path = pathname === '/' ? view.path : `${view.path}${pathname}`;
  return { kind: 'rewrite', view: view.id, path };
}

/** The view currently being served for a request (after middleware). */
export function viewIdFromRequest(host: string, pathname: string, domain: string): ViewId {
  const { hostname } = splitHost(host);
  if (hostBelongsToDomain(hostname, domain) && hostname !== domain) {
    const label = hostname.slice(0, -(domain.length + 1)).replace(/^www\./, '');
    const v = viewForSubdomain(label);
    if (v) return v.id;
  }
  return viewForPath(pathname).id === 'main' ? VIEWS.main.id : viewForPath(pathname).id;
}
