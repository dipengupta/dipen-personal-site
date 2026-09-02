import { expect, test } from '@playwright/test';

// Subdomain mode, exercised through *.localhost (Chromium resolves every
// *.localhost name to the loopback address, no DNS needed). In dev and in the
// test server SITE_DOMAIN defaults to "localhost"; see src/lib/site/host.ts.

const PORT = 3000;

test.describe('subdomain routing', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only (the phone fallback is covered in deviceRouting)');

  test('ipod.localhost serves the iPod at /', async ({ page }) => {
    await page.goto(`http://ipod.localhost:${PORT}/`);
    await expect(page).toHaveURL(`http://ipod.localhost:${PORT}/`);
    await expect(page.getByTestId('ipod')).toBeVisible();
    // Cross-view links are absolute subdomain URLs on a recognised domain.
    await expect(page.getByRole('link', { name: /iTunes view/ })).toHaveAttribute(
      'href',
      `http://itunes.localhost:${PORT}/`,
    );
    await expect(page.getByRole('link', { name: /Main site/ })).toHaveAttribute('href', `http://localhost:${PORT}/`);
  });

  test('itunes.localhost serves iTunes and links back through subdomains', async ({ page }) => {
    await page.goto(`http://itunes.localhost:${PORT}/`);
    await expect(page.getByTestId('itunes-window')).toBeVisible();
    const sidebar = page.getByTestId('itunes-sidebar');
    await expect(sidebar.getByRole('link', { name: "Dipen's iPod" })).toHaveAttribute(
      'href',
      `http://ipod.localhost:${PORT}/`,
    );
  });

  test('www. is dropped', async ({ page }) => {
    await page.goto(`http://www.localhost:${PORT}/ipod`);
    await expect(page).toHaveURL(`http://localhost:${PORT}/ipod`);
    await expect(page.getByTestId('ipod')).toBeVisible();
  });

  test('ipod.localhost/ipod collapses to the subdomain root', async ({ page }) => {
    await page.goto(`http://ipod.localhost:${PORT}/ipod`);
    await expect(page).toHaveURL(`http://ipod.localhost:${PORT}/`);
    await expect(page.getByTestId('ipod')).toBeVisible();
  });
});
