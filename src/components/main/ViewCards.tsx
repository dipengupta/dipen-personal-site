import { HOME } from '@/content/site';
import { viewHref, type SiteConfig } from '@/lib/site/views';

/** The "two other ways to browse" cards, with small CSS-drawn devices. */
export default function ViewCards({ siteConfig }: { siteConfig: SiteConfig }) {
  return (
    <div className="views">
      <a className="view-card" href={viewHref('ipod', siteConfig)} data-testid="view-card-ipod">
        <span className="device-ipod" aria-hidden="true">
          <span className="device-screen" />
          <span className="device-wheel">
            <span />
          </span>
        </span>
        <span className="view-text">
          <strong>{HOME.ipodCard.title}</strong>
          <span>{HOME.ipodCard.body}</span>
          <span className="btn btn-sm">{HOME.ipodCard.cta}</span>
        </span>
      </a>
      <a className="view-card" href={viewHref('itunes', siteConfig)} data-testid="view-card-itunes">
        <span className="device-itunes" aria-hidden="true">
          <span className="device-titlebar">
            <i />
            <i />
            <i />
          </span>
          <span className="device-sidebar" />
          <span className="device-pane" />
        </span>
        <span className="view-text">
          <strong>{HOME.itunesCard.title}</strong>
          <span>{HOME.itunesCard.body}</span>
          <span className="only-mobile muted" style={{ fontSize: '0.85rem' }}>
            {HOME.itunesCard.mobileNote}
          </span>
          <span className="btn btn-sm">{HOME.itunesCard.cta}</span>
        </span>
      </a>
    </div>
  );
}
