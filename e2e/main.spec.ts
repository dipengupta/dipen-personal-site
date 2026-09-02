import { expect, test } from '@playwright/test';

// The main website: every section renders real content, navigation and
// search work, and the device views are one click away. Runs on both the
// desktop and the phone project.

const PAGES: Array<{ path: string; heading: RegExp; item: string }> = [
  { path: '/music', heading: /Music/, item: 'a[href="/music/guitars"]' },
  { path: '/music/guitars', heading: /Guitars/, item: '[data-testid="photo-grid"] figure' },
  { path: '/music/youtube', heading: /YouTube/, item: 'article[id^="yt-"]' },
  { path: '/music/instagram', heading: /UGG Chronicles/, item: 'article[id^="ugg-"] video' },
  { path: '/music/soundcloud', heading: /SoundCloud/, item: 'iframe.embed' },
  { path: '/music/octavium', heading: /Octavium/, item: 'img[src*="Octavium"]' },
  { path: '/collections', heading: /Collections/, item: 'a[href="/collections/recipes"]' },
  { path: '/collections/articles', heading: /Articles/, item: '[data-testid="article-list"] li' },
  { path: '/collections/mugs', heading: /Mug Collection/, item: 'li[id^="mug-"]' },
  { path: '/collections/vinyls-and-magnets', heading: /Vinyls/, item: '#magnets img' },
  { path: '/collections/recipes', heading: /Recipes/, item: 'a[id^="recipe-"]' },
  { path: '/collections/spice-blends', heading: /Spice Blends/, item: 'a[id^="spice-"]' },
  { path: '/collections/kitchen-wins', heading: /Kitchen Wins/, item: '[data-testid="photo-grid"] figure' },
  { path: '/collections/alison', heading: /Alison/, item: '[data-testid="photo-grid"] figure' },
  { path: '/collections/pennguytweets', heading: /pennguytweets/, item: '[data-testid="tweet-feed"] li' },
  { path: '/about', heading: /About/, item: 'a[href="/about/academic"]' },
  { path: '/about/academic', heading: /Academic/, item: 'article[id^="project-"]' },
  { path: '/about/professional', heading: /Professional/, item: '[data-testid="timeline"] li' },
  { path: '/misc', heading: /Misc/, item: 'a[href="/misc/concerts"]' },
  { path: '/misc/concerts', heading: /Concerts/, item: 'li[id^="concert-"]' },
  { path: '/misc/list', heading: /List/, item: 'li[id^="list-"]' },
  { path: '/misc/wifi-names', heading: /Wi-Fi/, item: 'li[id^="wifi-"]' },
  { path: '/misc/links', heading: /Links/, item: 'li[id^="link-"] a' },
];

test.describe('main site', () => {
  test('home: hero, sections, latest, other views, mosaic', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /Hi, I'm Dipen/ })).toBeVisible();
    await expect(page.getByTestId('hero').locator('img.is-current')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Explore' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Latest' })).toBeVisible();
    await expect(page.getByTestId('view-card-ipod')).toHaveAttribute('href', /ipod/);
    await expect(page.getByTestId('view-card-itunes')).toHaveAttribute('href', /itunes/);
    await expect(page.getByTestId('mosaic').locator('img').first()).toBeAttached();
    await expect(page.getByTestId('made-by')).toContainText(/Made from scratch by Dipen, last updated \w{3} '\d{2}/);
    expect(errors).toEqual([]);
  });

  for (const p of PAGES) {
    test(`${p.path} renders content`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(p.path);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.heading);
      await expect(page.locator(p.item).first()).toBeAttached();
      expect(errors).toEqual([]);
    });
  }

  test('article, recipe and spice blend detail pages open from their lists', async ({ page }) => {
    await page.goto('/collections/articles');
    await page.locator('[data-testid="article-list"] a').first().click();
    await expect(page).toHaveURL(/\/collections\/articles\/[a-z0-9-]+$/);
    await expect(page.getByTestId('article-body').locator('p').first()).toBeVisible();

    await page.goto('/collections/recipes');
    await page.locator('a[id^="recipe-"]').first().click();
    await expect(page).toHaveURL(/\/collections\/recipes\/[a-z0-9-]+$/);
    await expect(page.locator('.prose p, .prose li').first()).toBeVisible();

    await page.goto('/collections/spice-blends/indian-everyday-masala');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Indian Everyday Masala/);
  });

  test('unknown pages 404 within the site chrome', async ({ page }) => {
    const res = await page.goto('/collections/recipes/no-such-recipe');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/does not seem to be right/);
  });

  test('search opens the exact item', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Search' }).click();
    const box = page.getByRole('combobox', { name: 'Search' });
    await box.fill('Chicken Rice');
    const hit = page.getByRole('option', { name: /Chicken Rice/ }).first();
    await expect(hit).toBeVisible();
    await hit.click();
    await expect(page).toHaveURL(/\/collections\/recipes\/chicken-rice$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Chicken Rice');
  });

  test('the no-JS search page works too', async ({ page }) => {
    await page.goto('/search?q=Montreal');
    await expect(page.getByRole('link', { name: 'Montreal' })).toHaveAttribute('href', /\/collections\/mugs#mug-\d+/);
  });

  test('a deep link highlights its target', async ({ page }) => {
    await page.goto('/about/academic');
    const id = await page.locator('li[id^="education-"]').first().getAttribute('id');
    await page.goto(`/about/academic#${id}`);
    await expect(page.locator(`#${id}`)).toHaveClass(/is-focused/);
  });

  test('the photo lightbox opens and steps', async ({ page }) => {
    await page.goto('/collections/kitchen-wins');
    await page.locator('[data-testid="photo-grid"] figure button').first().click();
    const dialog = page.locator('dialog.lightbox');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('img')).toHaveAttribute('src', /\/media\/images\/contact\//);
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('.lightbox-caption')).toContainText('2 / 10');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('theme toggle flips the colour scheme and sticks', async ({ page }) => {
    await page.goto('/misc');
    const before = await page.evaluate(() => document.documentElement.dataset.siteTheme ?? 'system');
    await page.getByRole('button', { name: /Switch to (dark|light) mode/ }).click();
    const after = await page.evaluate(() => document.documentElement.dataset.siteTheme);
    expect(after).toMatch(/^(dark|light)$/);
    expect(after).not.toBe(before);
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.dataset.siteTheme)).toBe(after);
  });
});

test.describe('main site on a phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'touch only');

  test('the menu sheet opens and navigates', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('#mobile-nav').getByRole('link', { name: 'Recipes' }).click();
    await expect(page).toHaveURL(/\/collections\/recipes$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Recipes');
  });

  test('nothing scrolls sideways', async ({ page }) => {
    for (const path of ['/', '/music/guitars', '/collections/pennguytweets', '/about/academic']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('main site on desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'hover menus');

  test('Cmd+K opens search and the nav dropdown lists pages', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByRole('combobox', { name: 'Search' })).toBeFocused();
    await page.keyboard.press('Escape');
    await page.getByRole('navigation', { name: 'Sections' }).getByRole('link', { name: 'Collections' }).hover();
    await expect(page.getByRole('navigation', { name: 'Sections' }).getByRole('link', { name: 'Mugs' })).toBeVisible();
  });
});
