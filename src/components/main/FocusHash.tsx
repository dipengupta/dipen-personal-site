'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Deep links from search carry the item as `#<id>`: scroll it into view and
 * flash a highlight. Runs on load and on hash changes within the page.
 */
export default function FocusHash() {
  const pathname = usePathname();
  useEffect(() => {
    const focus = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.classList.remove('is-focused');
      void el.offsetWidth; // restart the animation
      el.classList.add('is-focused');
      if (el instanceof HTMLDetailsElement) el.open = true;
    };
    focus();
    window.addEventListener('hashchange', focus);
    return () => window.removeEventListener('hashchange', focus);
  }, [pathname]);
  return null;
}
