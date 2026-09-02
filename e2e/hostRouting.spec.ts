import { expect, test } from '@playwright/test';

// Subdomain mode, exercised through *.site.localhost (Chromium resolves every
// *.localhost name to the loopback address, no DNS needed). The test server
// runs with SITE_DOMAIN=site.localhost (playwright.config.ts); plain
// localhost:3000 is off-domain and serves the path URLs. See src/lib/site/host.ts.

const PORT = 3000;

test.describe('subdomain routing', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only (the phone fallback is covered in deviceRouting)');

  test('ipod.site.localhost serves the iPod at /', async ({ page }) => {
    await page.goto(`http://ipod.site.localhost:${PORT}/`);
    await expect(page).toHaveURL(`http://ipod.site.localhost:${PORT}/`);
    await expect(page.getByTestId('ipod')).toBeVisible();
    // Cross-view links are absolute subdomain URLs on a recognised domain.
    await expect(page.getByRole('link', { name: 'iTunes' })).toHaveAttribute(
      'href',
      `http://itunes.site.localhost:${PORT}/`,
    );
    await expect(page.getByRole('link', { name: /Main site/ })).toHaveAttribute('href', `http://site.localhost:${PORT}/`);
  });

  test('itunes.site.localhost serves iTunes and links back through subdomains', async ({ page }) => {
    await page.goto(`http://itunes.site.localhost:${PORT}/`);
    await expect(page.getByTestId('itunes-window')).toBeVisible();
    const sidebar = page.getByTestId('itunes-sidebar');
    await expect(sidebar.getByRole('link', { name: "Dipen's iPod" })).toHaveAttribute(
      'href',
      `http://ipod.site.localhost:${PORT}/`,
    );
  });

  test('www. is dropped and the apex device path lands on its subdomain', async ({ page }) => {
    // www.site.localhost/ipod -> site.localhost/ipod -> ipod.site.localhost/ (canonical)
    await page.goto(`http://www.site.localhost:${PORT}/ipod`);
    await expect(page).toHaveURL(`http://ipod.site.localhost:${PORT}/`);
    await expect(page.getByTestId('ipod')).toBeVisible();
  });

  test('ipod.site.localhost/ipod collapses to the subdomain root', async ({ page }) => {
    await page.goto(`http://ipod.site.localhost:${PORT}/ipod`);
    await expect(page).toHaveURL(`http://ipod.site.localhost:${PORT}/`);
    await expect(page.getByTestId('ipod')).toBeVisible();
  });
});
