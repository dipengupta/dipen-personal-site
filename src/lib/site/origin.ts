import { siteDomainFromEnv } from './host';

/** Absolute origin for sitemap/robots: the real domain in production, SITE_URL or localhost otherwise. */
export function siteOrigin(): string {
  const { domain, canonicalize } = siteDomainFromEnv();
  if (canonicalize) return `https://${domain}`;
  return process.env.SITE_URL ?? 'http://localhost:3000';
}
