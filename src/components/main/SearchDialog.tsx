'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { searchResultHref } from '@/lib/main/searchTargets';
import type { SearchResponse } from '@/lib/search/searchContent';

interface Hit {
  href: string;
  title: string;
  snippet?: string;
  group: string;
}

/**
 * The global search box (Cmd/Ctrl+K or the header button). Queries
 * /api/search?scope=main as you type and opens the exact item on the main
 * site (src/lib/main/searchTargets.ts). Arrow keys move, Enter opens,
 * Escape closes.
 */
export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => inputRef.current?.select());
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setResult(null);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?scope=main&q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (res.ok) {
          setResult((await res.json()) as SearchResponse);
          setActive(0);
        }
      } catch {
        /* aborted or offline: keep the previous results */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query, open]);

  const hits: Hit[] = useMemo(
    () =>
      (result?.groups ?? []).flatMap((g) =>
        g.results.map((r) => ({ href: searchResultHref(g.type, r.id, r.title), title: r.title, snippet: r.snippet, group: g.label })),
      ),
    [result],
  );

  const go = useCallback(
    (hit: Hit) => {
      onClose();
      router.push(hit.href);
    },
    [onClose, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(hits.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter' && hits[active]) {
      e.preventDefault();
      go(hits[active]);
    }
  };

  useEffect(() => {
    document.querySelector<HTMLElement>(`[data-hit="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  let index = -1;
  return (
    <dialog
      ref={dialogRef}
      className="search-dialog"
      aria-label="Search this site"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <input
        ref={inputRef}
        className="search-input"
        type="search"
        placeholder="Search recipes, guitars, articles, tweets, anything"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        aria-label="Search"
        autoComplete="off"
        role="combobox"
        aria-expanded={hits.length > 0}
        aria-controls="search-results"
        aria-activedescendant={hits.length ? `search-hit-${active}` : undefined}
      />
      <div className="search-results" id="search-results" role="listbox">
        {result && hits.length === 0 && !loading && <p className="search-empty">Nothing matched "{result.query}".</p>}
        {!result && query.trim().length < 2 && <p className="search-empty">Type at least two characters.</p>}
        {result?.groups.map((g) => (
          <div className="search-group" key={g.type}>
            <h4>{g.label}</h4>
            {g.results.map((r) => {
              index += 1;
              const i = index;
              const hit = hits[i];
              return (
                <a
                  key={`${g.type}-${r.id}-${i}`}
                  id={`search-hit-${i}`}
                  data-hit={i}
                  role="option"
                  aria-selected={i === active}
                  className="search-hit"
                  href={hit.href}
                  onMouseEnter={() => setActive(i)}
                  onClick={(e) => {
                    e.preventDefault();
                    go(hit);
                  }}
                >
                  {r.title}
                  {r.snippet && <span className="snippet">{r.snippet}</span>}
                </a>
              );
            })}
          </div>
        ))}
      </div>
    </dialog>
  );
}
