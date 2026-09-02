import { afterEach, describe, expect, it, vi } from 'vitest';
import { itunesFallbackScript, itunesFitsDevice } from '@/lib/device/viewRouting';

/** Stub window.matchMedia so each media query returns the given boolean. */
function stubMedia(matches: Record<string, boolean>) {
  vi.stubGlobal('window', {
    matchMedia: (q: string) => ({ matches: matches[q] ?? false }),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('itunesFitsDevice (the only device rule left)', () => {
  it('desktop: iTunes fits', () => {
    stubMedia({ '(pointer: coarse)': false, '(max-width: 767px)': false, '(orientation: portrait)': false });
    expect(itunesFitsDevice()).toBe(true);
  });

  it('portrait phone: falls back to the iPod', () => {
    stubMedia({ '(pointer: coarse)': true, '(max-width: 767px)': true, '(orientation: portrait)': true });
    expect(itunesFitsDevice()).toBe(false);
  });

  it('landscape phone: the URL wins, iTunes stays', () => {
    stubMedia({ '(pointer: coarse)': true, '(max-width: 767px)': false, '(orientation: portrait)': false });
    expect(itunesFitsDevice()).toBe(true);
  });

  it('narrow portrait desktop window: treated as a handheld', () => {
    stubMedia({ '(pointer: coarse)': false, '(max-width: 767px)': true, '(orientation: portrait)': true });
    expect(itunesFitsDevice()).toBe(false);
  });

  it('server side (no window): fits', () => {
    expect(itunesFitsDevice()).toBe(true);
  });
});

describe('itunesFallbackScript', () => {
  it('mirrors the runtime rule and targets the given href', () => {
    const script = itunesFallbackScript('https://ipod.example.com/');
    expect(script).toContain('(pointer: coarse)');
    expect(script).toContain('(max-width: 767px)');
    expect(script).toContain('(orientation: portrait)');
    expect(script).toContain('location.replace("https://ipod.example.com/")');
  });
});
