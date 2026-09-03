import { expect, test } from '@playwright/test';

// The main website: every section renders real content, navigation and
// search work, and the device views are one click away. Runs on both the
// desktop and the phone project.

const PAGES: Array<{ path: string; heading: RegExp; item: string }> = [
  { path: '/music/guitars', heading: /Guitars/, item: '[data-testid="guitar-timeline"] li img' },
  { path: '/music/youtube', heading: /YouTube/, item: 'article[id^="yt-"]' },
  { path: '/music/instagram', heading: /UGG Chronicles/, item: 'article[id^="ugg-"] img' },
  { path: '/music/soundcloud', heading: /SoundCloud/, item: 'iframe.embed' },
  { path: '/music/octavium', heading: /Octavium/, item: 'img[src*="Octavium"]' },
  { path: '/collections/articles', heading: /Articles/, item: '[data-testid="article-list"] li' },
  { path: '/collections/mugs-vinyls-and-magnets', heading: /Mugs, Vinyls and Magnets/, item: 'li[id^="mug-"]' },
  { path: '/collections/recipes', heading: /Recipes and Spice Blends/, item: 'li[id^="spice-"] a' },
  { path: '/collections/alison', heading: /Alison/, item: '[data-testid="photo-grid"] figure' },
  { path: '/collections/pennguytweets', heading: /pennguytweets/, item: '[data-testid="tweet-feed"] li' },
  { path: '/about/journey', heading: /Journey/, item: '[data-testid="journey"] [id^="job-"]' },
  { path: '/about/projects', heading: /Projects/, item: 'article[id^="project-"]' },
  { path: '/misc/concerts', heading: /Concerts/, item: 'li[id^="concert-"]' },
  { path: '/misc/list', heading: /List/, item: 'li[id^="list-"]' },
  { path: '/misc/wifi-names', heading: /Wi-Fi/, item: 'li[id^="wifi-"]' },
  { path: '/misc/links', heading: /Links/, item: 'li[id^="link-"] a' },
];

test.describe('main site', () => {
  test('home: hero, explore index, other views, mosaic', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /Hi, I'm Dipen/ })).toBeVisible();
    const hero = page.getByTestId('hero').locator('visible=true');
    await expect(hero.locator('.hero-slide.is-current')).toHaveCount(1);
    // Swiping left moves to the next photo.
    const stage = hero.locator('.hero-stage');
    const hb = (await stage.boundingBox())!;
    await page.mouse.move(hb.x + hb.width * 0.7, hb.y + hb.height / 2);
    await page.mouse.down();
    await page.mouse.move(hb.x + hb.width * 0.3, hb.y + hb.height / 2, { steps: 6 });
    await page.mouse.up();
    await expect(hero.locator('.hero-dots [aria-current="true"]')).toHaveAttribute('aria-label', 'Photo 2');
    await expect(page.getByRole('heading', { name: 'Explore' })).toBeVisible();
    await expect(page.locator('.index-row')).toHaveCount(4);
    await expect(page.getByTestId('view-card-ipod')).toHaveAttribute('href', /ipod/);
    await expect(page.getByTestId('view-card-itunes')).toHaveAttribute('href', /itunes/);
    await expect(page.getByTestId('mosaic').locator('img').first()).toBeAttached();
    // Dragging the mosaic moves the strip and does not follow a tile link.
    const strip = page.getByTestId('mosaic');
    const box = (await strip.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect(page).toHaveURL(/\/$/);
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
    await page.locator('li[id^="recipe-"] a').first().click();
    await expect(page).toHaveURL(/\/collections\/recipes\/[a-z0-9-]+$/);
    await expect(page.locator('.prose p, .prose li').first()).toBeVisible();

    await page.goto('/collections/recipes/indian-everyday-masala');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Indian Everyday Masala/);
  });

  test('section and old URLs redirect to real pages', async ({ page }) => {
    await page.goto('/music');
    await expect(page).toHaveURL(/\/music\/guitars$/);
    await page.goto('/collections/mugs');
    await expect(page).toHaveURL(/\/collections\/mugs-vinyls-and-magnets$/);
    await page.goto('/about/professional');
    await expect(page).toHaveURL(/\/about\/journey$/);
    await page.goto('/about/academic');
    await expect(page).toHaveURL(/\/about\/projects$/);
  });

  test('Instagram episodes show a poster and play on demand', async ({ page }) => {
    await page.goto('/music/instagram');
    const card = page.locator('article[id^="ugg-"]').first();
    await expect(card.locator('img')).toHaveAttribute('src', /\/media\/images\/ugg\//);
    await card.getByRole('button', { name: /Play episode/ }).click();
    await expect(card.locator('video')).toHaveAttribute('src', /\/api\/video\/ugg-\d+\.mp4/);
  });

  test('unknown pages 404 within the site chrome', async ({ page }) => {
    const res = await page.goto('/collections/recipes/no-such-recipe');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/does not seem to be right/);
  });

  test('search opens the exact item', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Search', exact: true }).click();
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
    await expect(page.getByRole('link', { name: 'Montreal' })).toHaveAttribute('href', /\/collections\/mugs-vinyls-and-magnets#mug-\d+/);
  });

  test('a deep link highlights its target', async ({ page }) => {
    await page.goto('/about/journey');
    const id = await page.locator('[id^="education-"]').first().getAttribute('id');
    // Arrive the way a search result does: a fresh load with the hash already
    // in the URL. Changing only the hash of the page you are on can land mid
    // hydration, where the router rewrites the URL without it.
    await page.goto('/');
    await page.goto(`/about/journey#${id}`);
    await expect(page.locator(`#${id}`)).toHaveClass(/is-focused/);
  });

  test('the photo lightbox opens and steps', async ({ page }) => {
    await page.goto('/collections/alison');
    await page.locator('[data-testid="photo-grid"] figure button').first().click();
    const dialog = page.locator('dialog.lightbox');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('img')).toHaveAttribute('src', /\/media\/images\/alison\//);
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('.lightbox-caption')).toContainText('2 / 95');
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
    await page.locator('summary.menu-toggle').click();
    await page.locator('#mobile-nav').getByRole('link', { name: /Recipes/ }).click();
    await expect(page).toHaveURL(/\/collections\/recipes$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Recipes/);
  });

  test('nothing scrolls sideways', async ({ page }) => {
    for (const path of ['/', '/music/guitars', '/collections/recipes', '/collections/pennguytweets', '/about/journey']) {
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
    // The shortcut listener attaches on hydration; retry the key press until it takes.
    await expect(async () => {
      await page.keyboard.press('ControlOrMeta+k');
      await expect(page.getByRole('combobox', { name: 'Search' })).toBeFocused({ timeout: 1000 });
    }).toPass({ timeout: 15000 });
    await page.keyboard.press('Escape');
    await page.getByRole('navigation', { name: 'Sections' }).getByRole('link', { name: 'Collections' }).hover();
    await expect(page.getByRole('navigation', { name: 'Sections' }).getByRole('link', { name: /Mugs/ })).toBeVisible();
  });
});
