import type { Metadata } from 'next';
import ItunesApp from '@/components/itunes/ItunesApp';
import { itunesFallbackScript } from '@/lib/device/viewRouting';
import { siteConfigFromRequest } from '@/lib/site/request';
import { viewHref } from '@/lib/site/views';
import styles from './itunes.module.css';

export const metadata: Metadata = {
  title: "Dipen's iTunes",
};

/**
 * The desktop iTunes companion: a second display layer over the same data the
 * iPod uses (it fetches the shared /api/... routes). The `.page` wrapper here
 * defines the iTunes design tokens + theme tints; ItunesApp is the interactive
 * client tree.
 *
 * The URL decides the view, with one exception: a portrait phone cannot use
 * this window, so an inline script (run before paint) sends it to the iPod.
 */
export default async function ItunesPage() {
  const ipodHref = viewHref('ipod', await siteConfigFromRequest());
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: itunesFallbackScript(ipodHref) }} />
      <div className={styles.page}>
        <ItunesApp />
      </div>
    </>
  );
}
