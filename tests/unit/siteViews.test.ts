import { describe, expect, it } from 'vitest';
import { routeForHost, siteDomainFromEnv, viewIdFromRequest } from '@/lib/site/host';
import { DEVICE_VIEWS, VIEWS, viewForPath, viewHref, type SiteConfig } from '@/lib/site/views';

const prod = (host: string, pathname = '/', search = ''): Parameters<typeof routeForHost>[0] => ({
  host,
  pathname,
  search,
  protocol: 'https:',
  domain: 'dipengupta.com',
  canonicalize: true,
});

describe('view registry', () => {
  it('every device view has a subdomain and a distinct path prefix', () => {
    const paths = new Set(DEVICE_VIEWS.map((v) => v.path));
    expect(paths.size).toBe(DEVICE_VIEWS.length);
    for (const v of DEVICE_VIEWS) {
      expect(v.subdomain).toMatch(/^[a-z0-9-]+$/);
      expect(v.path).toMatch(/^\/[a-z0-9-]+$/);
    }
    expect(VIEWS.main.path).toBe('/');
  });

  it('viewForPath picks the longest matching prefix and defaults to main', () => {
    expect(viewForPath('/ipod').id).toBe('ipod');
    expect(viewForPath('/itunes/anything').id).toBe('itunes');
    expect(viewForPath('/ipodcast').id).toBe('main');
    expect(viewForPath('/').id).toBe('main');
  });
});

describe('viewHref', () => {
  const onDomain: SiteConfig = { host: 'dipengupta.com', domain: 'dipengupta.com', protocol: 'https:' };
  const onSub: SiteConfig = { host: 'ipod.dipengupta.com', domain: 'dipengupta.com', protocol: 'https:' };
  const onFly: SiteConfig = { host: 'dipen-personal-site.fly.dev', domain: 'dipengupta.com', protocol: 'https:' };
  const onLocal: SiteConfig = { host: 'localhost:3000', domain: 'localhost', protocol: 'http:' };

  it('uses subdomains on the real domain (from apex and from a subdomain)', () => {
    expect(viewHref('ipod', onDomain)).toBe('https://ipod.dipengupta.com/');
    expect(viewHref('itunes', onSub)).toBe('https://itunes.dipengupta.com/');
    expect(viewHref('main', onSub)).toBe('https://dipengupta.com/');
  });

  it('falls back to path prefixes off-domain and without config', () => {
    expect(viewHref('ipod', onFly)).toBe('/ipod');
    expect(viewHref('main', onFly)).toBe('/');
    expect(viewHref('itunes', null)).toBe('/itunes');
  });

  it('keeps the port for dev subdomains', () => {
    expect(viewHref('ipod', onLocal)).toBe('http://ipod.localhost:3000/');
  });
});

describe('routeForHost', () => {
  it('rewrites subdomain roots to the view path', () => {
    expect(routeForHost(prod('ipod.dipengupta.com'))).toEqual({ kind: 'rewrite', view: 'ipod', path: '/ipod' });
    expect(routeForHost(prod('itunes.dipengupta.com'))).toEqual({ kind: 'rewrite', view: 'itunes', path: '/itunes' });
    expect(routeForHost(prod('itunes.dipengupta.com', '/x'))).toEqual({ kind: 'rewrite', view: 'itunes', path: '/itunes/x' });
  });

  it('collapses www. everywhere', () => {
    expect(routeForHost(prod('www.dipengupta.com', '/music', '?a=1'))).toEqual({
      kind: 'redirect',
      view: 'main',
      url: 'https://dipengupta.com/music?a=1',
    });
    expect(routeForHost(prod('www.ipod.dipengupta.com'))).toEqual({
      kind: 'redirect',
      view: 'ipod',
      url: 'https://ipod.dipengupta.com/',
    });
  });

  it('sends the apex device paths to their canonical subdomains in production', () => {
    expect(routeForHost(prod('dipengupta.com', '/ipod'))).toEqual({
      kind: 'redirect',
      view: 'ipod',
      url: 'https://ipod.dipengupta.com/',
    });
    expect(routeForHost(prod('dipengupta.com', '/itunes/'))).toMatchObject({ kind: 'redirect', view: 'itunes' });
  });

  it('serves the main site on the apex untouched', () => {
    expect(routeForHost(prod('dipengupta.com', '/music/guitars'))).toEqual({ kind: 'next', view: 'main' });
  });

  it('de-duplicates ipod.<domain>/ipod', () => {
    expect(routeForHost(prod('ipod.dipengupta.com', '/ipod'))).toEqual({
      kind: 'redirect',
      view: 'ipod',
      url: 'https://ipod.dipengupta.com/',
    });
  });

  it('bounces unknown subdomains to the apex', () => {
    expect(routeForHost(prod('blog.dipengupta.com', '/p'))).toEqual({
      kind: 'redirect',
      view: 'main',
      url: 'https://dipengupta.com/p',
    });
  });

  it('path mode: hosts off the domain are never redirected', () => {
    expect(routeForHost({ ...prod('dipen-personal-site.fly.dev', '/ipod'), domain: '' })).toEqual({ kind: 'next', view: 'ipod' });
    expect(routeForHost(prod('dipen-personal-site.fly.dev', '/itunes'))).toEqual({ kind: 'next', view: 'itunes' });
  });

  it('dev: localhost keeps both path and subdomain URLs working', () => {
    const dev = { protocol: 'http:' as const, domain: 'localhost', canonicalize: false };
    expect(routeForHost({ ...dev, host: 'localhost:3000', pathname: '/ipod' })).toEqual({ kind: 'next', view: 'ipod' });
    expect(routeForHost({ ...dev, host: 'ipod.localhost:3000', pathname: '/' })).toEqual({ kind: 'rewrite', view: 'ipod', path: '/ipod' });
    expect(routeForHost({ ...dev, host: 'www.localhost:3000', pathname: '/ipod' })).toEqual({
      kind: 'redirect',
      view: 'ipod',
      url: 'http://localhost:3000/ipod',
    });
  });
});

describe('siteDomainFromEnv', () => {
  it('normalizes SITE_DOMAIN and enables canonical redirects', () => {
    expect(siteDomainFromEnv({ SITE_DOMAIN: 'https://DipenGupta.com/' } as unknown as NodeJS.ProcessEnv)).toEqual({
      domain: 'dipengupta.com',
      canonicalize: true,
    });
  });
  it('never canonicalizes localhost even when set explicitly', () => {
    expect(siteDomainFromEnv({ SITE_DOMAIN: 'localhost' } as unknown as NodeJS.ProcessEnv)).toEqual({ domain: 'localhost', canonicalize: false });
  });
  it('defaults to localhost outside production and to path mode in production', () => {
    expect(siteDomainFromEnv({ NODE_ENV: 'test' } as unknown as NodeJS.ProcessEnv)).toEqual({ domain: 'localhost', canonicalize: false });
    expect(siteDomainFromEnv({ NODE_ENV: 'production' } as unknown as NodeJS.ProcessEnv)).toEqual({ domain: '', canonicalize: false });
  });
});

describe('viewIdFromRequest', () => {
  it('reads the view from the subdomain first, then the path', () => {
    expect(viewIdFromRequest('itunes.dipengupta.com', '/', 'dipengupta.com')).toBe('itunes');
    expect(viewIdFromRequest('dipengupta.com', '/ipod', 'dipengupta.com')).toBe('ipod');
    expect(viewIdFromRequest('x.fly.dev', '/', 'dipengupta.com')).toBe('main');
  });
});
