import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Arimo, Fredoka } from 'next/font/google';

/**
 * The single root layout. Three front-ends hang off it through route groups:
 *   app/(main)     the website          (/)
 *   app/(devices)  iPod + iTunes        (/ipod, /itunes; ipod.* / itunes.* hosts)
 * Each group has its own nested layout for CSS, viewport rules and chrome;
 * switching between them is a full page load (plain anchors), so nothing
 * from one group's stylesheet reaches another.
 *
 * What lives here is only what must sit on <html>: the device views' theme
 * and screen-font attributes (cookie-backed, adopted by the iPod store) and
 * the main site's colour scheme, all applied again pre-hydration from
 * localStorage so a stale cookie never flashes the wrong look.
 */

// Device screen fonts, self-hosted at build. Only downloaded on pages whose
// text actually uses them (the iPod screen), so the main site pays nothing.
const authentic = Arimo({ subsets: ['latin'], variable: '--font-authentic', display: 'swap' });
const fun = Fredoka({ subsets: ['latin'], variable: '--font-fun', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Dipen Gupta', template: '%s | Dipen Gupta' },
  description: "Dipen Gupta's personal website: guitars, videos, recipes, articles, collections, and a few other ways to browse it all.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const PRE_HYDRATION = `try{var t=localStorage.getItem('ipod-theme');if(t==='black'||t==='silver'){document.documentElement.dataset.theme=t;}var f=localStorage.getItem('ipod-font');if(f==='authentic'||f==='fun'||f==='system'){document.documentElement.dataset.font=f;}var s=localStorage.getItem('site-theme');if(s==='light'||s==='dark'){document.documentElement.dataset.siteTheme=s;}}catch(e){}`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get('ipod-theme')?.value;
  const theme = cookieTheme === 'black' ? 'black' : 'silver';
  const cookieFont = cookieStore.get('ipod-font')?.value;
  const font = cookieFont === 'authentic' || cookieFont === 'fun' ? cookieFont : 'system';
  const cookieSiteTheme = cookieStore.get('site-theme')?.value;
  const siteTheme = cookieSiteTheme === 'dark' || cookieSiteTheme === 'light' ? cookieSiteTheme : undefined;
  return (
    // suppressHydrationWarning: the inline script may legitimately rewrite the
    // data-* attributes before hydration (localStorage wins over a stale
    // cookie), and browser extensions inject classes on <html>. Applies to
    // this element's attributes only; children are still verified.
    <html
      lang="en"
      data-theme={theme}
      data-font={font}
      data-site-theme={siteTheme}
      className={`${authentic.variable} ${fun.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_HYDRATION }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
