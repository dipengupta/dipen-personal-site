import Link from 'next/link';
import { CONTACT, FOOTER, SOCIALS } from '@/content/site';
import { SECTIONS } from '@/lib/main/routes';
import { viewHref, type SiteConfig } from '@/lib/site/views';
import SocialIcon from './SocialIcon';
import ThemeToggle from './ThemeToggle';

/** "Sep '26" from the build-time commit date (next.config.ts). */
export function lastUpdatedLabel(iso = process.env.NEXT_PUBLIC_BUILD_DATE): string {
  const d = iso ? new Date(iso) : new Date();
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  return `${month} '${String(d.getUTCFullYear()).slice(-2)}`;
}

export default function SiteFooter({ siteConfig }: { siteConfig: SiteConfig }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {SECTIONS.map((s) => (
            <div key={s.id}>
              <h4>
                <Link href={s.href}>{s.label}</Link>
              </h4>
              <ul>
                {s.pages.map((p) => (
                  <li key={p.href}>
                    <Link href={p.href}>{p.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4>Other views</h4>
            <ul>
              <li>
                <a href={viewHref('ipod', siteConfig)}>The iPod</a>
              </li>
              <li>
                <a href={viewHref('itunes', siteConfig)}>iTunes</a>
              </li>
            </ul>
            <h4 style={{ marginTop: '1.2rem' }}>{CONTACT.heading}</h4>
            <ul>
              {CONTACT.emails.map((e) => (
                <li key={e}>
                  <a href={`mailto:${e}`}>{e}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="socials" aria-label="Elsewhere">
            {SOCIALS.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">
                <SocialIcon id={s.id} />
                {s.label}
              </a>
            ))}
          </div>
          <ThemeToggle />
        </div>
        <p className="muted" style={{ marginTop: '1.5rem', marginBottom: 0 }} data-testid="made-by">
          {FOOTER.madeBy}, {FOOTER.lastUpdatedPrefix} {lastUpdatedLabel()}
        </p>
      </div>
    </footer>
  );
}
