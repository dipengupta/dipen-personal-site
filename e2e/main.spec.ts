import { expect, test, type Page } from '@playwright/test';
import gallerySeed from '../src/data/seed/gallery.json';

const profilePhotos = gallerySeed.filter((p) => p.category === 'profile');

async function beginHeroDrag(page: Page, touch: boolean, startFraction = 0.75) {
  const stage = page.getByTestId('hero').locator('.hero-stage');
  await stage.scrollIntoViewIfNeeded();
  const box = (await stage.boundingBox())!;
  const x = box.x + box.width * startFraction;
  const y = box.y + box.height / 2;
  const session = touch ? await page.context().newCDPSession(page) : null;
  if (session) await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  else {
    await page.mouse.move(x, y);
    await page.mouse.down();
  }
  return {
    box,
    x,
    y,
    move: async (dx: number, dy = 0) => {
      if (session) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx, y: y + dy }] });
      else await page.mouse.move(x + dx, y + dy, { steps: 6 });
    },
    release: async () => {
      if (session) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await session.detach();
      } else await page.mouse.up();
    },
  };
}

function heroOffset(page: Page) {
  return page.locator('.hero-track').evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);
}

async function swipeHero(page: Page, direction: 'left' | 'right', touch: boolean) {
  const stage = page.getByTestId('hero').locator('.hero-stage');
  await stage.scrollIntoViewIfNeeded();
  const box = (await stage.boundingBox())!;
  const from = box.x + box.width * (direction === 'left' ? 0.75 : 0.25);
  const to = box.x + box.width * (direction === 'left' ? 0.25 : 0.75);
  const y = box.y + box.height / 2;
  if (touch) {
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from, y }] });
    for (let step = 1; step <= 6; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from + (to - from) * step / 6, y }] });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
  } else {
    await page.mouse.move(from, y);
    await page.mouse.down();
    await page.mouse.move(to, y, { steps: 6 });
    await page.mouse.up();
  }
}

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
  { path: '/about/photos', heading: /Photos/, item: '[data-testid="photo-grid"] figure' },
  { path: '/misc/concerts', heading: /Concerts/, item: 'li[id^="concert-"]' },
  { path: '/misc/list', heading: /List/, item: 'li[id^="list-"]' },
  { path: '/misc/wifi-names', heading: /Wi-Fi/, item: 'li[id^="wifi-"]' },
  { path: '/misc/links', heading: /Links/, item: 'li[id^="link-"] a' },
];

test.describe('main site', () => {
  test('home: hero, explore index, other views, mosaic', async ({ page, isMobile }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /Hi, I'm Dipen/ })).toBeVisible();
    const hero = page.getByTestId('hero').locator('visible=true');
    await expect(page.getByTestId('hero')).toHaveCount(1);
    await expect(hero.locator('.hero-slide.is-current')).toHaveCount(1);
    const current = hero.locator('.hero-slide.is-current .hero-img');
    const initial = (await current.getAttribute('src'))!;
    await swipeHero(page, 'left', isMobile);
    await expect(current).not.toHaveAttribute('src', initial);
    await swipeHero(page, 'right', isMobile);
    await expect(current).toHaveAttribute('src', initial);
    await expect(hero.getByRole('button')).toHaveCount(0);
    await expect(hero.locator('.hero-controls, .hero-count')).toHaveCount(0);
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

  test('the homepage shows both orientations, including every imported photo', async ({ page, isMobile }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const hero = page.getByTestId('hero');
    expect(await hero.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
    expect(await hero.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('0px');
    const seen: string[] = [];
    const orientations = new Set<string>();
    for (let i = 0; i < profilePhotos.length; i++) {
      const current = hero.locator('.hero-slide.is-current .hero-img');
      seen.push((await current.getAttribute('src'))!);
      orientations.add((await hero.getAttribute('data-orientation'))!);
      expect(await current.evaluate((img) => getComputedStyle(img).objectFit)).toBe('contain');
      if (await hero.getAttribute('data-orientation') === 'portrait') {
        const imageBox = (await current.boundingBox())!;
        const copyBox = (await hero.locator('.hero-content').boundingBox())!;
        if (isMobile) expect(imageBox.y + imageBox.height).toBeLessThanOrEqual(copyBox.y + 1);
        else expect(copyBox.x + copyBox.width).toBeLessThanOrEqual(imageBox.x + 1);
      }
      await hero.press('ArrowRight');
      await expect(current).not.toHaveAttribute('src', seen[i]);
    }
    expect(new Set(seen)).toEqual(new Set(profilePhotos.map((p) => p.imagePath)));
    expect(orientations).toEqual(new Set(['portrait', 'landscape']));
    await expect(hero.getByRole('link', { name: 'All photos' })).toHaveCount(0);
    await expect(hero.getByRole('button', { name: /Pause|Play slideshow/ })).toHaveCount(0);
  });

  test('the slideshow advances automatically and rests while focused', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.clock.install();
    await page.goto('/');
    const hero = page.getByTestId('hero');
    const current = hero.locator('.hero-slide.is-current .hero-img');
    const initial = (await current.getAttribute('src'))!;
    await page.clock.fastForward(8000);
    await expect(current).not.toHaveAttribute('src', initial);
    const second = (await current.getAttribute('src'))!;
    await hero.focus();
    await page.clock.fastForward(16000);
    await expect(current).toHaveAttribute('src', second);
    await page.keyboard.press('ArrowRight');
    await expect(current).not.toHaveAttribute('src', second);
  });

  test('page loads start with randomized homepage photos', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const starts = new Set<string>();
    for (let load = 0; load < 5; load++) {
      const current = page.getByTestId('hero').locator('.hero-slide.is-current .hero-img');
      await expect(current).toHaveCount(1);
      const src = (await current.getAttribute('src'))!;
      expect(profilePhotos.some((photo) => photo.imagePath === src)).toBe(true);
      starts.add(src);
      if (load < 4) await page.reload();
    }
    expect(starts.size).toBeGreaterThan(1);
  });

  test('photos follow the swipe before release and settle without moving the intro', async ({ page, isMobile }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const hero = page.getByTestId('hero');
    const current = hero.locator('.hero-slide.is-current .hero-img');
    const initial = (await current.getAttribute('src'))!;
    const intro = await hero.locator('.hero-content').boundingBox();
    await expect(hero.locator('.hero-img')).toHaveCount(3);
    const gesture = await beginHeroDrag(page, isMobile);
    const distance = -gesture.box.width * 0.3;
    await gesture.move(distance);
    await expect.poll(() => heroOffset(page)).toBeCloseTo(distance, 0);
    await expect(current).toHaveAttribute('src', initial);
    expect(await hero.locator('.hero-content').boundingBox()).toEqual(intro);
    await gesture.release();
    await expect(current).not.toHaveAttribute('src', initial);
    await expect.poll(() => heroOffset(page)).toBeCloseTo(0, 0);
    expect(await hero.locator('.hero-content').boundingBox()).toEqual(intro);
  });

  test('a short drag returns smoothly to the same photo', async ({ page, isMobile }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const current = page.locator('.hero-slide.is-current .hero-img');
    const initial = (await current.getAttribute('src'))!;
    const gesture = await beginHeroDrag(page, isMobile);
    await gesture.move(-10);
    await expect.poll(() => heroOffset(page)).toBeCloseTo(-10, 0);
    await gesture.release();
    await expect.poll(() => heroOffset(page)).toBeCloseTo(0, 0);
    await expect(current).toHaveAttribute('src', initial);
  });

  test('a new drag can reverse a settling swipe from its current position', async ({ page, isMobile }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const current = page.locator('.hero-slide.is-current .hero-img');
    const initial = (await current.getAttribute('src'))!;
    const first = await beginHeroDrag(page, isMobile);
    await first.move(-first.box.width * 0.3);
    await first.release();
    // Freeze a partly completed animation to test interruption deterministically.
    await page.locator('.hero-track').evaluate((el) => {
      const animation = el.getAnimations()[0];
      animation.pause();
      animation.currentTime = 80;
    });
    const before = await heroOffset(page);
    const second = await beginHeroDrag(page, isMobile, 0.1);
    expect(await heroOffset(page)).toBeCloseTo(before, 0);
    await second.move(-before);
    await expect.poll(() => heroOffset(page)).toBeCloseTo(0, 0);
    await second.release();
    await expect(current).toHaveAttribute('src', initial);
    await expect.poll(() => heroOffset(page)).toBeCloseTo(0, 0);
  });

  test('vertical touch swipes scroll the page without changing the photo', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'touch scrolling only');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const current = page.locator('.hero-slide.is-current .hero-img');
    const initial = (await current.getAttribute('src'))!;
    const gesture = await beginHeroDrag(page, true);
    const scrollBefore = await page.evaluate(() => scrollY);
    for (let step = 1; step <= 6; step++) await gesture.move(0, -step * 25);
    await gesture.release();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore + 30);
    await expect(current).toHaveAttribute('src', initial);
    await expect.poll(() => heroOffset(page)).toBeCloseTo(0, 0);
  });

  test('About photos form a fresh mosaic, preserve whole frames, and open in a lightbox', async ({ page, isMobile }) => {
    await page.goto('/about/photos');
    const tiles = page.locator('.photo-grid-mosaic .photo-tile');
    await expect(tiles).toHaveCount(profilePhotos.length);
    const before = await tiles.locator('img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
    await page.reload();
    const after = await tiles.locator('img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
    expect(new Set(after)).toEqual(new Set(before));
    expect(after).not.toEqual(before);
    const rowCounts = await page.locator('.photo-mosaic-row').evaluateAll((rows) => rows.map((row) => row.childElementCount));
    expect(rowCounts.reduce((sum, count) => sum + count, 0)).toBe(profilePhotos.length);
    expect(rowCounts.every((count) => count >= 3)).toBe(true);
    if (!isMobile) {
      for (const row of await page.locator('.photo-mosaic-row').all()) {
        const heights = await row.locator('.photo-tile').evaluateAll((tiles) => tiles.map((tile) => tile.getBoundingClientRect().height));
        expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(2);
      }
    }
    const ratios = await tiles.locator('img').evaluateAll((imgs) => imgs.map((img) => {
      const box = img.getBoundingClientRect();
      return { displayed: box.width / box.height, intrinsic: Number(img.getAttribute('width')) / Number(img.getAttribute('height')) };
    }));
    for (const ratio of ratios) expect(ratio.displayed).toBeCloseTo(ratio.intrinsic, 1);
    const firstButton = tiles.first().getByRole('button');
    await firstButton.focus();
    await page.keyboard.press('Enter');
    const dialog = page.locator('dialog.lightbox');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('img')).toHaveAttribute('src', after[0]!.replace('.webp', '-1600.webp'));
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('.lightbox-caption')).toContainText(`2 / ${profilePhotos.length}`);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(firstButton).toBeFocused();
  });

  test('photo search links highlight the matching gallery tile', async ({ page }) => {
    await page.goto('/search?q=Fall%20colors%20by%20the%20water');
    const result = page.getByRole('link', { name: 'Fall colors by the water' });
    await expect(result).toHaveAttribute('href', /\/about\/photos#photo-\d+/);
    await result.click();
    await expect(page.locator('.photo-tile.is-focused')).toContainText('Fall colors by the water');
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
    await expect(dialog.locator('.lightbox-caption')).toContainText('2 / 170');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  // The width/height attributes carry the manifest's intrinsic size and are
  // there whether or not a lazy image has loaded yet.
  const tileRatios = (page: Page, selector: string) =>
    page.evaluate(
      (sel) =>
        [...document.querySelectorAll(sel)].map((tile) => {
          const img = tile.querySelector('img') as HTMLImageElement;
          const box = tile.getBoundingClientRect();
          return { tile: box.width / box.height, intrinsic: Number(img.getAttribute('width')) / Number(img.getAttribute('height')) };
        }),
      selector,
    );

  test('Alison photos sit on one even 3:4 grid', async ({ page }) => {
    await page.goto('/collections/alison');
    const ratios = await tileRatios(page, '.photo-grid-portrait .photo-tile');
    expect(ratios).toHaveLength(170);
    // One shape throughout, whatever the photo underneath is.
    expect(new Set(ratios.map((r) => r.tile.toFixed(2)))).toEqual(new Set([(3 / 4).toFixed(2)]));
  });

  test('Alison quote frames show whole frames, not crops', async ({ page }) => {
    await page.goto('/collections/alison');
    await page.getByRole('button', { name: 'Quotes', exact: true }).click();
    // Each tile carries its own photo's aspect ratio, so the text burned into
    // a story frame never gets cropped by the grid.
    const ratios = await tileRatios(page, '.photo-grid-natural .photo-tile');
    expect(ratios).toHaveLength(51);
    for (const r of ratios) expect(r.tile).toBeCloseTo(r.intrinsic, 1);
  });

  test('the Alison quote switch swaps the two halves of the collection', async ({ page }) => {
    await page.goto('/collections/alison');
    const tiles = page.locator('[data-testid="photo-grid"] figure');
    const photos = page.getByRole('button', { name: 'Photos', exact: true });
    const quotes = page.getByRole('button', { name: 'Quotes', exact: true });
    const track = page.locator('.segmented');

    // Photos is the default: every tile is captioned with its month and year.
    await expect(photos).toHaveAttribute('aria-current', 'true');
    await expect(track).toHaveAttribute('data-value', 'photos');
    await expect(tiles).toHaveCount(170);
    await expect(tiles.first().locator('figcaption')).toHaveText(/^[A-Z][a-z]+ \d{4}$/);

    // Quotes shows only the frames whose text is on the image, uncaptioned.
    await quotes.click();
    await expect(quotes).toHaveAttribute('aria-current', 'true');
    // The thumb slides to the far half of the track.
    await expect(track).toHaveAttribute('data-value', 'quotes');
    await expect(tiles).toHaveCount(51);
    await expect(page.locator('[data-testid="photo-grid"] figcaption')).toHaveCount(0);
    // The transcribed quote stands in as the alt text and the lightbox caption.
    await tiles.first().locator('button').click();
    await expect(page.locator('dialog.lightbox .lightbox-caption')).toContainText('nice while it lasted');
    await page.keyboard.press('Escape');

    await photos.click();
    await expect(tiles).toHaveCount(170);
  });

  test('the pennguytweets order switch reshuffles and goes back', async ({ page }) => {
    await page.goto('/collections/pennguytweets');
    const track = page.locator('.segmented');
    const first = page.locator('[data-testid="tweet-feed"] li').first();

    await expect(track).toHaveAttribute('data-value', 'latest');
    // Each tweet's id is its own number, so identity survives a reorder.
    const newest = await first.getAttribute('id');

    await page.getByRole('button', { name: 'Shuffle', exact: true }).click();
    await expect(track).toHaveAttribute('data-value', 'shuffle');
    // A shuffle of 789 tweets that leaves the same one on top is a rounding
    // error away from impossible, but retry once so this can never flake.
    let shuffled = await first.getAttribute('id');
    if (shuffled === newest) {
      await page.getByRole('button', { name: 'Shuffle', exact: true }).click();
      shuffled = await first.getAttribute('id');
    }
    expect(shuffled).not.toBe(newest);

    await page.getByRole('button', { name: 'Newest first', exact: true }).click();
    await expect(track).toHaveAttribute('data-value', 'latest');
    await expect(first).toHaveAttribute('id', newest!);
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
    for (const path of ['/', '/music/guitars', '/collections/recipes', '/collections/pennguytweets', '/about/journey', '/about/photos']) {
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
