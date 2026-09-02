'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { sectionHref, type SectionDef } from '@/lib/main/routes';
import SearchDialog from './SearchDialog';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/**
 * Site header. The mobile menu is a native <details> so it opens even before
 * React has hydrated (first loads over a slow connection); the search button
 * is a link to /search that upgrades to the dialog once JS is running.
 */
export default function SiteHeader({ sections }: { sections: SectionDef[] }) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close the mobile sheet on navigation; open search on Cmd/Ctrl+K.
  useEffect(() => {
    if (menuRef.current) menuRef.current.open = false;
    setMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const current = (s: SectionDef) => s.pages.some((p) => pathname === p.href || pathname.startsWith(`${p.href}/`));

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          Dipen Gupta
        </Link>
        <nav className="nav" aria-label="Sections">
          <ul>
            {sections.map((s) => (
              <li key={s.id} className="nav-item">
                <Link href={sectionHref(s)} aria-current={current(s) || undefined}>
                  {s.label}
                </Link>
                <div className="menu">
                  <ul>
                    {s.pages.map((p) => (
                      <li key={p.href}>
                        <Link href={p.href}>{p.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-actions">
          <a
            href="/search"
            className="icon-btn"
            aria-label="Search"
            onClick={(e) => {
              e.preventDefault();
              setSearchOpen(true);
            }}
          >
            <SearchIcon />
            <span className="kbd" aria-hidden="true">
              K
            </span>
          </a>
          <details ref={menuRef} className="menu-details" onToggle={(e) => setMenuOpen((e.currentTarget as HTMLDetailsElement).open)}>
            <summary className="icon-btn menu-toggle" aria-label="Menu">
              <svg className="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
              <svg className="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </summary>
            <nav id="mobile-nav" className="mobile-nav" aria-label="Sections">
              {sections.map((s) => (
                <div key={s.id} className="group">
                  <span>{s.label}</span>
                  <ul>
                    {s.pages.map((p) => (
                      <li key={p.href}>
                        <Link href={p.href}>{p.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </details>
        </div>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
