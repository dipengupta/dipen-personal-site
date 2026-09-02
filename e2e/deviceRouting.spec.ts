import { expect, test } from '@playwright/test';

// The URL decides the view (src/lib/site/views.ts). The only device rule left
// is that a portrait phone cannot use the iTunes window and falls back to the
// iPod (src/lib/device/viewRouting.ts).
//
// The e2e server runs with SITE_DOMAIN=localhost, so cross-view links render
// as absolute subdomain URLs (http://ipod.localhost:3000/); the assertions
// accept both that and the plain path form used off-domain.

const MAIN_HREF = /^(\/|http:\/\/localhost:3000\/)$/;
const IPOD_URL = /(\/ipod$|^http:\/\/ipod\.localhost:3000\/$)/;

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop routing');

  test('/ serves the main site, /ipod the iPod, /itunes iTunes', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('main-site')).toBeVisible();

    await page.goto('/ipod');
    await expect(page).toHaveURL(/\/ipod$/);
    await expect(page.getByTestId('ipod')).toBeVisible();

    await page.goto('/itunes');
    await expect(page).toHaveURL(/\/itunes$/);
    await expect(page.getByTestId('itunes-window')).toBeVisible();
  });

  test('a desktop that opens the iPod stays on the iPod after a reload', async ({ page }) => {
    await page.goto('/ipod');
    await expect(page.getByTestId('ipod')).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL(/\/ipod$/);
    await expect(page.getByTestId('ipod')).toBeVisible();
  });

  test('the device views link to each other and back to the main site', async ({ page }) => {
    await page.goto('/itunes');
    const sidebar = page.getByTestId('itunes-sidebar');
    await expect(sidebar.getByRole('link', { name: "Dipen's Website" })).toHaveAttribute('href', MAIN_HREF);
    await sidebar.getByRole('link', { name: "Dipen's iPod" }).click();
    await expect(page).toHaveURL(IPOD_URL);
    await expect(page.getByTestId('ipod')).toBeVisible();
    await expect(page.getByRole('link', { name: /Main site/ })).toHaveAttribute('href', MAIN_HREF);
  });
});

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'touch routing');

  test('/ipod serves the iPod in portrait', async ({ page }) => {
    await page.goto('/ipod');
    await expect(page).toHaveURL(/\/ipod$/);
    await expect(page.getByTestId('ipod')).toBeVisible();
  });

  test('/itunes in portrait falls back to the iPod', async ({ page }) => {
    await page.goto('/itunes');
    await expect(page).toHaveURL(IPOD_URL);
    await expect(page.getByTestId('ipod')).toBeVisible();
  });

  test('/itunes in landscape honours the URL', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/itunes');
    await expect(page).toHaveURL(/\/itunes$/);
    await expect(page.getByTestId('itunes-window')).toBeVisible();
  });
});
