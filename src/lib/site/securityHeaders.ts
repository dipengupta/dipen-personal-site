/**
 * Security headers for every response (applied from next.config.ts).
 *
 * The CSP has to admit what the three views embed: YouTube's IFrame API and
 * privacy-enhanced embeds, the SoundCloud widget, Spotify's 30 s preview MP3s,
 * and their thumbnail hosts. Next's own runtime needs inline scripts (the
 * pre-hydration theme script, hydration data) and inline styles (style
 * props), so those stay allowed. It ships as Report-Only first so a missed
 * source shows up in the browser console rather than as a broken player;
 * flip `CSP_ENFORCE` once the device views have run clean in production.
 */
export const CSP_ENFORCE = process.env.CSP_ENFORCE === '1';

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com https://w.soundcloud.com https://widget.sndcdn.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.ytimg.com https://*.ytimg.com https://*.sndcdn.com https://i.scdn.co https://*.scdn.co https://*.googleusercontent.com https://substackcdn.com https://*.substackcdn.com https://*.medium.com https://miro.medium.com",
  "media-src 'self' blob: https://p.scdn.co https://*.sndcdn.com",
  "font-src 'self' data:",
  "connect-src 'self' https://w.soundcloud.com https://api-widget.soundcloud.com https://*.sndcdn.com https://www.youtube.com https://open.spotify.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://w.soundcloud.com https://open.spotify.com",
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ');

export const securityHeaders: Array<{ key: string; value: string }> = [
  { key: CSP_ENFORCE ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only', value: CSP },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
];
