import 'server-only';
import { headers } from 'next/headers';
import { siteDomainFromEnv } from './host';
import type { SiteConfig } from './views';

/**
 * Build the SiteConfig for the current server request. Fly terminates TLS and
 * forwards plain HTTP, so trust x-forwarded-* first.
 */
export async function siteConfigFromRequest(): Promise<SiteConfig> {
  const h = await headers();
  return siteConfigFromHeaders(h);
}

export function siteConfigFromHeaders(h: { get(name: string): string | null }): SiteConfig {
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const forwardedProto = h.get('x-forwarded-proto');
  const protocol: SiteConfig['protocol'] =
    forwardedProto === 'https' || (!forwardedProto && !/^(localhost|127\.0\.0\.1|\[::1\])/.test(host))
      ? 'https:'
      : 'http:';
  return { host, domain: siteDomainFromEnv().domain, protocol };
}
