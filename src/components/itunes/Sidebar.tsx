'use client';

import { useSiteConfig } from '@/lib/site/SiteConfigContext';
import { viewHref } from '@/lib/site/views';
import { SIDEBAR_GROUPS } from '@/lib/itunes/catalog';
import type { CatalogEntry } from '@/lib/itunes/types';
import styles from './Sidebar.module.css';

interface SidebarProps {
  /** Static catalog + dynamic playlist entries, merged by ItunesApp. */
  entries: CatalogEntry[];
  selectedId: string;
  onSelect: (entry: CatalogEntry) => void;
  /** Current width (px); driven by the drag divider in ItunesApp. */
  width: number;
}

function ItemBody({ entry }: { entry: CatalogEntry }) {
  return (
    <>
      <span className={styles.icon} aria-hidden="true">
        {entry.icon}
      </span>
      <span className={styles.label}>{entry.label}</span>
    </>
  );
}

export default function Sidebar({ entries, selectedId, onSelect, width }: SidebarProps) {
  const siteConfig = useSiteConfig();
  return (
    <aside
      className={styles.sidebar}
      aria-label="Library"
      data-testid="itunes-sidebar"
      style={{ width, flex: `0 0 ${width}px` }}
    >
      {SIDEBAR_GROUPS.map((group) => {
        const groupEntries = entries.filter((e) => e.group === group);
        if (groupEntries.length === 0) return null;
        return (
          <div key={group} className={styles.group}>
            <p className={styles.heading}>{group}</p>
            <ul className={styles.list}>
              {groupEntries.map((entry) => {
                const external = entry.href?.startsWith('http');
                return (
                  <li key={entry.id}>
                    {external ? (
                      // Apple-Music playlists link out in a new tab.
                      <a className={styles.item} href={entry.href} target="_blank" rel="noopener noreferrer">
                        <ItemBody entry={entry} />
                      </a>
                    ) : entry.href ? (
                      // DEVICES rows open another view. Those live under a
                      // different root layout (and possibly a subdomain), so a
                      // plain full-page anchor is the right tool, not next/link.
                      <a
                        className={styles.item}
                        href={entry.viewId ? viewHref(entry.viewId, siteConfig) : entry.href}
                      >
                        <ItemBody entry={entry} />
                      </a>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.item} ${entry.id === selectedId ? styles.selected : ''}`}
                        aria-current={entry.id === selectedId || undefined}
                        data-testid={entry.group === 'PLAYLISTS' ? 'itunes-playlist' : undefined}
                        onClick={() => onSelect(entry)}
                      >
                        <ItemBody entry={entry} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </aside>
  );
}
