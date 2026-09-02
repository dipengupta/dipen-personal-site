import type { Metadata, Viewport } from 'next';
import { SiteConfigProvider } from '@/lib/site/SiteConfigContext';
import { siteConfigFromRequest } from '@/lib/site/request';
import './devices.css';

export const metadata: Metadata = {
  title: { absolute: 'Dipen Gupta — iPod' },
  description: "Dipen Gupta's personal site, inside an iPod Classic.",
};

// A device replica, not a document: no pinch zoom.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * Layout shared by the iPod and iTunes views. `devices.css` carries the
 * global reset, the backdrop and the theme tokens those views were written
 * against; it is loaded only under this group. Which device view renders is
 * decided by the URL alone (middleware.ts, src/lib/site/host.ts); the
 * provider carries the host so cross-view links resolve to subdomains on the
 * real domain and to path prefixes elsewhere.
 */
export default async function DevicesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const siteConfig = await siteConfigFromRequest();
  return <SiteConfigProvider value={siteConfig}>{children}</SiteConfigProvider>;
}
