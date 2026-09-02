import { Instrument_Sans, Instrument_Serif } from 'next/font/google';
import FocusHash from '@/components/main/FocusHash';
import SiteFooter from '@/components/main/SiteFooter';
import SiteHeader from '@/components/main/SiteHeader';
import { SECTIONS } from '@/lib/main/routes';
import { siteConfigFromRequest } from '@/lib/site/request';
import './main.css';

const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-main-sans', display: 'swap', weight: ['400', '500', '600'] });
const serif = Instrument_Serif({ subsets: ['latin'], variable: '--font-main-serif', display: 'swap', weight: '400', style: ['normal', 'italic'] });

/**
 * The main website's chrome. Loaded only under app/(main); the device views
 * have their own group layout and never see this stylesheet or these fonts.
 */
export default async function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const siteConfig = await siteConfigFromRequest();
  return (
    <div className={`site ${sans.variable} ${serif.variable}`} data-testid="main-site">
      <SiteHeader sections={SECTIONS} />
      <main className="main">
        <div className="container">{children}</div>
      </main>
      <SiteFooter siteConfig={siteConfig} />
      <FocusHash />
    </div>
  );
}
