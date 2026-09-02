import { NextResponse, type NextRequest } from 'next/server';
import { routeForHost, siteDomainFromEnv } from '@/lib/site/host';

/**
 * Host-based view routing. The rules are pure (src/lib/site/host.ts); this
 * file only adapts them to Next's request/response objects.
 *
 *   ipod.<SITE_DOMAIN>/   -> rewrite to /ipod
 *   itunes.<SITE_DOMAIN>/ -> rewrite to /itunes
 *   www.*                 -> 308 to the bare host
 *   <SITE_DOMAIN>/ipod    -> 308 to ipod.<SITE_DOMAIN>/ (only when SITE_DOMAIN is set)
 *
 * Assets and API routes are excluded by the matcher so they are served from
 * every host unchanged.
 */
export function middleware(req: NextRequest) {
  const { domain, canonicalize } = siteDomainFromEnv();
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '';
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const protocol: 'http:' | 'https:' =
    forwardedProto === 'https' ? 'https:' : forwardedProto === 'http' ? 'http:' : (req.nextUrl.protocol as 'http:' | 'https:');

  const decision = routeForHost({
    host,
    pathname: req.nextUrl.pathname,
    search: req.nextUrl.search,
    protocol,
    domain,
    canonicalize,
  });

  if (decision.kind === 'redirect') {
    // A raw response: NextResponse.redirect() relativizes a Location whose host
    // matches the server's own hostname (localhost), which the browser would
    // then resolve against the *current* host and loop (www.localhost -> www.localhost).
    return new NextResponse(null, { status: 308, headers: { Location: decision.url } });
  }

  // Tell layouts which view is being served (they cannot see the pathname).
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-site-view', decision.view);

  if (decision.kind === 'rewrite') {
    const url = req.nextUrl.clone();
    url.pathname = decision.path;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Everything except Next internals, API routes, media files and well-known static files.
  matcher: ['/((?!_next/|api/|media/|favicon\\.ico|icon\\.svg|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest).*)'],
};
