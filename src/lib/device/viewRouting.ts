/**
 * The one device rule that survives explicit URLs: the iTunes window is
 * unusable on a portrait phone, so that case falls back to the iPod. Every
 * other visitor gets exactly the view their URL names (ipod.<domain>,
 * itunes.<domain>, /ipod, /itunes); there is no desktop bounce, no pinned
 * preference and no tilt switching any more.
 *
 * `itunesFitsDevice` is the runtime rule; `itunesFallbackScript` is the same
 * rule as a pre-hydration inline script (it cannot import) rendered by
 * app/(devices)/itunes/page.tsx so a phone never paints the iTunes chrome.
 * Keep the two in sync.
 */

export const ITUNES_UNFIT_QUERY = {
  coarse: '(pointer: coarse)',
  small: '(max-width: 767px)',
  portrait: '(orientation: portrait)',
} as const;

export function itunesFitsDevice(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  const m = (q: string) => window.matchMedia(q).matches;
  const handheld = m(ITUNES_UNFIT_QUERY.coarse) || m(ITUNES_UNFIT_QUERY.small);
  return !(handheld && m(ITUNES_UNFIT_QUERY.portrait));
}

/** Inline script: send an unfit device to `ipodHref` before first paint. */
export function itunesFallbackScript(ipodHref: string): string {
  const href = JSON.stringify(ipodHref);
  return (
    `try{var m=function(s){return matchMedia(s).matches};` +
    `if((m(${JSON.stringify(ITUNES_UNFIT_QUERY.coarse)})||m(${JSON.stringify(ITUNES_UNFIT_QUERY.small)}))` +
    `&&m(${JSON.stringify(ITUNES_UNFIT_QUERY.portrait)}))location.replace(${href});}catch(e){}`
  );
}
