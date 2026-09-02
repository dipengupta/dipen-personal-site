import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site/origin';

// Same as sitemap.ts: siteOrigin() reads SITE_DOMAIN, which is a runtime
// secret on Fly and absent at build time. Without this the file is generated
// during the build and ships a localhost URL.
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/search'] },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
