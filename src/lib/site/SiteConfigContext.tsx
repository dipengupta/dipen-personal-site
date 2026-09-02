'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { viewHref, type SiteConfig, type ViewId } from './views';

/**
 * Carries the request's host/domain/protocol into client components so links
 * to other views render identically on the server and the client (no
 * hydration mismatch) and switch between subdomain and path mode correctly.
 */
const SiteConfigContext = createContext<SiteConfig | null>(null);

export function SiteConfigProvider({ value, children }: { value: SiteConfig; children: ReactNode }) {
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig(): SiteConfig | null {
  return useContext(SiteConfigContext);
}

/** Href for a view from wherever the visitor currently is. */
export function useViewHref(view: ViewId): string {
  return viewHref(view, useSiteConfig());
}
