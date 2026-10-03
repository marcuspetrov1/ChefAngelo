const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES = [
  'index.html', 'about.html', 'menus.html', 'gallery.html', 'faq-contact.html', 'book.html',
  'thank-you.html', 'booking-confirmed.html', '404.html',
  'experiences/private-chef.html', 'experiences/private-parties.html', 'experiences/kids-parties.html',
  'experiences/date-night.html', 'experiences/cooking-classes.html', 'experiences/supper-club.html',
];
const QUOTE_PAGES = ['private-chef', 'private-parties', 'kids-parties', 'date-night'].map((n) => `experiences/${n}.html`);
const TOKENS = ['[SQUARE_BOOKING_SITE_URL]', '[SQUARE_GIFT_CARD_URL]', '[SQUARE_CLASS_LINK_1]', '[SQUARE_CLASS_LINK_2]', '[SQUARE_CLASS_LINK_3]'];
const url = (p) => '/' + p;
const isMobile = (testInfo) => testInfo.project.name === 'mobile';

for (const p of PAGES) {
  test.describe(p, () => {
    test('loads with no console errors or failed same-origin requests', async ({ page, baseURL }) => {
      const errors = [];
      const failed = [];
      page.on('console', (m) => {
        if (m.type() !== 'error') return;
        const loc = m.location().url || '';
        if (loc && !loc.startsWith(baseURL)) return; // ignore third-party (fonts)
        errors.push(m.text());
      });
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('requestfailed', (r) => { if (r.url().startsWith(baseURL)) failed.push(r.url()); });
      page.on('response', (r) => {
        if (r.url().startsWith(baseURL) && r.status() >= 400 && !p.startsWith('404')) failed.push(r.status() + ' ' + r.url());
      });
      await page.goto(url(p));
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((i) => i.scrollIntoView()));
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
      expect(failed).toEqual([]);
    });

    test('internal links and fragments resolve', async ({ page, baseURL }) => {
      await page.goto(url(p));
      const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
      for (const h of hrefs) {
        if (h.startsWith('[') || h.startsWith('mailto:') || h.startsWith('tel:') || /^https?:/.test(h)) continue;
        const [pathPart, frag] = h.split('#');
        let file;
        if (pathPart === '') file = p;
        else if (pathPart.startsWith('/')) file = pathPart.slice(1) || 'index.html';
        else file = path.posix.join(path.posix.dirname(p), pathPart);
        if (file.endsWith('/')) file += 'index.html';
        const abs = path.join(ROOT, file);
        expect(fs.existsSync(abs), `${p}: ${h} -> missing ${file}`).toBe(true);
        if (frag) {
          const html = fs.readFileSync(abs, 'utf8');
          expect(new RegExp(`id=["']${frag}["']`).test(html), `${p}: ${h} fragment missing`).toBe(true);
        }
      }
    });

    test('Book/Reserve/Gift links use placeholder tokens', async ({ page }) => {
      await page.goto(url(p));
      const links = await page.$$eval('a[href]', (as) => as.map((a) => ({ t: a.textContent.trim(), h: a.getAttribute('href') })));
      for (const l of links) {
        if (/\b(book|reserve|gift)\b/i.test(l.t) && !/^(\/|#|mailto:)/.test(l.h)) {
          expect(TOKENS, `${p}: "${l.t}" -> ${l.h}`).toContain(l.h);
        }
      }
    });

    test('SEO basics: one h1, title, description, canonical', async ({ page }) => {
      await page.goto(url(p));
      expect(await page.locator('h1').count()).toBe(1);
      expect((await page.title()).length).toBeGreaterThan(5);
      expect(await page.locator('meta[name=description]').getAttribute('content')).toBeTruthy();
      const canon = await page.locator('link[rel=canonical]').getAttribute('href');
      expect(canon).toMatch(/^https:\/\/chefangeloguida\.com\//);
    });

    test('forms are Netlify-ready', async ({ page }) => {
      await page.goto(url(p));
      const forms = await page.$$eval('form', (fs) => fs.map((f) => ({
        netlify: f.getAttribute('data-netlify'),
        hp: f.getAttribute('netlify-honeypot'),
        hpField: !!(f.getAttribute('netlify-honeypot') && f.querySelector(`[name="${f.getAttribute('netlify-honeypot')}"]`)),
        formName: f.querySelector('input[type=hidden][name=form-name]')?.value || '',
        action: f.getAttribute('action'),
      })));
      for (const f of forms) {
        expect(f.netlify).toBe('true');
        expect(f.hp).toBeTruthy();
        expect(f.hpField).toBe(true);
        expect(f.formName).toBeTruthy();
        expect(f.action).toBe('/thank-you.html');
      }
      if (QUOTE_PAGES.includes(p)) {
        expect(await page.$$eval('form', (fs) => fs.filter((f) => f.querySelector('input[name=form-name]')?.value === 'quote-request').length)).toBe(1);
      } else {
        expect(await page.$$eval('form', (fs) => fs.filter((f) => f.querySelector('input[name=form-name]')?.value === 'quote-request').length)).toBe(0);
      }
    });

    test('no horizontal scroll (mobile)', async ({ page }, testInfo) => {
      test.skip(!isMobile(testInfo));
      await page.goto(url(p));
      await page.waitForLoadState('networkidle');
      const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(sw).toBeLessThanOrEqual(cw);
    });
  });
}

test('sticky bar: visible on mobile, hidden on desktop', async ({ page }, testInfo) => {
  await page.goto('/index.html');
  const bar = page.locator('.sticky-book');
  if (isMobile(testInfo)) await expect(bar).toBeVisible();
  else await expect(bar).toBeHidden();
});

test('nav toggle works on mobile', async ({ page }, testInfo) => {
  test.skip(!isMobile(testInfo));
  await page.goto('/index.html');
  const toggle = page.locator('.nav-toggle');
  const nav = page.locator('#site-nav');
  await expect(nav).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav).toBeVisible();
  await toggle.click();
  await expect(nav).toBeHidden();
});

test('gallery filters show/hide correct items', async ({ page }) => {
  await page.goto('/gallery.html');
  const items = page.locator('[data-category]');
  const total = await items.count();
  for (const cat of ['dinners', 'classes', 'kids', 'events']) {
    await page.click(`[data-filter="${cat}"]`);
    const cats = await items.evaluateAll((els) => els.filter((e) => !e.hidden).map((e) => e.dataset.category));
    expect(cats.length).toBeGreaterThan(0);
    expect(new Set(cats)).toEqual(new Set([cat]));
  }
  await page.click('[data-filter="all"]');
  expect(await items.evaluateAll((els) => els.filter((e) => !e.hidden).length)).toBe(total);
});

test('placeholder link click shows "Link coming soon"', async ({ page }) => {
  await page.goto('/index.html');
  const a = page.locator('main a[href="[SQUARE_CLASS_LINK_1]"]').first();
  await a.scrollIntoViewIfNeeded();
  await a.click();
  await expect(page.locator('.soon-note').first()).toHaveText('Link coming soon');
  expect(new URL(page.url()).pathname).toBe('/index.html');
});

test('class date cards use per-date Square payment link tokens', async ({ page }) => {
  for (const p of ['index.html', 'experiences/cooking-classes.html', 'book.html']) {
    await page.goto(url(p));
    const hrefs = await page.$$eval('.date-card a.btn', (as) => as.map((a) => a.getAttribute('href')));
    expect(hrefs, p).toEqual(['[SQUARE_CLASS_LINK_1]', '[SQUARE_CLASS_LINK_2]', '[SQUARE_CLASS_LINK_3]']);
  }
});

test('book page chooser jumps to each booking path', async ({ page }) => {
  await page.goto('/book.html');
  const targets = await page.$$eval('#choose .choice-card', (as) => as.map((a) => a.getAttribute('href')));
  expect(targets).toEqual(['#private-events', '#classes', '#gift']);
  for (const t of targets) await expect(page.locator(t)).toHaveCount(1);
  await expect(page.locator('#private-events a.btn')).toHaveAttribute('href', '[SQUARE_BOOKING_SITE_URL]');
  await expect(page.locator('.embed-box, #square-embed, iframe')).toHaveCount(0);
});

test('booking-confirmed is noindex and not in sitemap', async ({ page }) => {
  await page.goto('/booking-confirmed.html');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  expect(fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8')).not.toContain('booking-confirmed');
});

test('Book Now buttons route to the on-site booking page', async ({ page }) => {
  for (const p of PAGES) {
    await page.goto(url(p));
    await expect(page.locator('.sticky-book a'), p).toHaveAttribute('href', '/book.html#choose');
  }
  await page.goto('/experiences/cooking-classes.html');
  expect(await page.$$eval('main a.btn', (as) => as.filter((a) => a.textContent.trim() === 'Book Now').map((a) => a.getAttribute('href')))).toEqual(['/book.html#classes', '/book.html#classes']);
  await page.goto('/experiences/private-chef.html');
  expect(await page.$$eval('main a.btn', (as) => as.filter((a) => a.textContent.trim() === 'Book Now').map((a) => a.getAttribute('href')))).toEqual(['/book.html#private-events', '/book.html#private-events']);
});

test('private events button links out to the Square booking site', async ({ page }) => {
  await page.goto('/book.html');
  const a = page.locator('#private-events a[href="[SQUARE_BOOKING_SITE_URL]"]');
  await a.scrollIntoViewIfNeeded();
  await a.click();
  await expect(page.locator('#private-events .soon-note')).toHaveText('Link coming soon');
  expect(new URL(page.url()).pathname).toBe('/book.html');
});

test('Square links open in the same tab', async ({ page }) => {
  for (const p of PAGES) {
    await page.goto(url(p));
    expect(await page.locator('a[href^="[SQUARE"][target]').count(), p).toBe(0);
  }
});
