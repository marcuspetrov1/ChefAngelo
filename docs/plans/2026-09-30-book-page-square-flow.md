# Book page: Square booking flow — implementation plan

## Context
Static site (no build step, vanilla HTML/CSS/JS, Netlify). Square is the payment provider and there is no backend, so payment always completes on Square's hosted checkout. Goal: guests browse and pick dates on our site and only leave for payment, then land back on our site.

Approach agreed with the user:
- `book.html` starts with a "What are you booking?" chooser (3 cards) that jumps to sections on the same page.
- **Private dinners/parties:** Square Appointments embed (placeholder box) for a "Private Event – Date Hold" service; balance later via Square Invoice; quote form stays as fallback.
- **Cooking classes/supper club:** date cards, each with its own Square Payment Link token. Payment links redirect after checkout to a new `booking-confirmed.html` page.
- **Gift:** unchanged `[SQUARE_GIFT_CARD_URL]`.

## Global Constraints
- No invented URLs. Every Book/Reserve/Gift link that leaves the site must be a placeholder token listed in `TOKENS` in `tests/site.spec.js`. Clicking a token link must show "Link coming soon" (existing guard in `js/main.js` handles any href starting with `[`; do not change it).
- New tokens, exactly: `[SQUARE_CLASS_LINK_1]`, `[SQUARE_CLASS_LINK_2]`, `[SQUARE_CLASS_LINK_3]`.
- Checkout links open in the same tab (no `target="_blank"`).
- Reuse existing CSS classes (`section`, `section--alt`, `container`, `section-head`, `eyebrow`, `lead`, `grid grid--3`, `date-card`, `card-link`, `btn btn-cta`, `btn btn-outline`, `embed-box`, `note`, `prose`). Add new CSS only where nothing fits, appended to `css/styles.css`, using existing custom properties (`--space-*`, `--radius`, `--line`, `--shadow`, `--terracotta`, `--ink`, `--saffron`).
- Shared HEADER/FOOTER/STICKY blocks (between `SHARED:... START/END` comments) are copied verbatim from `thank-you.html` for any new page and are not otherwise edited.
- Each page keeps exactly one `h1`, a title, meta description, canonical `https://chefangeloguida.com/...`.
- Tests: `npx playwright test` (starts `python3 -m http.server 4173`). Baseline: 161 passed, 15 skipped. All must pass after each task.
- Stage files by name. Never stage `graphify-out/`.
- Copy voice: first person as Angelo ("I", "me"), warm, short sentences, no em dashes in visible copy.

## Task 1: Per-date class tokens
Files: `index.html`, `experiences/cooking-classes.html`, `tests/site.spec.js`.

1. In `tests/site.spec.js`, change `TOKENS` to:
   `const TOKENS = ['[SQUARE_BOOKING_URL]', '[SQUARE_GIFT_CARD_URL]', '[SQUARE_CLASS_LINK_1]', '[SQUARE_CLASS_LINK_2]', '[SQUARE_CLASS_LINK_3]'];`
2. Add this test at the end of the file:
   ```js
   test('class date cards use per-date Square payment link tokens', async ({ page }) => {
     for (const p of ['index.html', 'experiences/cooking-classes.html']) {
       await page.goto(url(p));
       const hrefs = await page.$$eval('.date-card a.btn', (as) => as.map((a) => a.getAttribute('href')));
       expect(hrefs, p).toEqual(['[SQUARE_CLASS_LINK_1]', '[SQUARE_CLASS_LINK_2]', '[SQUARE_CLASS_LINK_3]']);
     }
   });
   ```
   `book.html` gets class date cards in Task 2, which adds `'book.html'` to this array.
3. In `index.html` and `experiences/cooking-classes.html`, the three `.date-card` "Reserve a Seat" links change `href="[SQUARE_BOOKING_URL]"` to `[SQUARE_CLASS_LINK_1]`, `[SQUARE_CLASS_LINK_2]`, `[SQUARE_CLASS_LINK_3]` in order. Nothing else in those files changes.
4. Run the full suite; all pass.

## Task 2: Restructure book.html
Files: `book.html`, `css/styles.css`, `tests/site.spec.js`.

Replace everything inside `<main id="main">` of `book.html` with, in order:

1. **Hero** (keep existing `section.hero.hero--short` with the same inline background style): eyebrow `Book`; h1 `Book your experience`; p `Pick your date right here. Payment is finished on Square's secure checkout.`; `.hero-actions` with `<a class="btn btn-cta" href="#choose">Choose your experience</a>`.
2. **Chooser** `<section class="section" id="choose">`: section-head with eyebrow `Step 1`, h2 `What are you booking?`. Then `<div class="grid grid--3 choice-grid">` with three `<a class="choice-card" href="...">` elements, each containing an `h3`, a `p`, and `<span class="card-link">...</span>`:
   - `#private-events` — h3 `Private dinner or party`; p `Dinners at home, parties, date nights and kids parties, with a menu built for you.`; link text `See open dates`
   - `#classes` — h3 `Cooking class or supper club`; p `Set dates with a few seats each. Reserve yours and pay online.`; link text `See upcoming dates`
   - `#gift` — h3 `Gift an experience`; p `Give a dinner or a class to someone who loves to eat.`; link text `Buy a gift card`
3. **Private events** `<section class="section section--alt" id="private-events">`: section-head with eyebrow `Private dinners and parties`, h2 `Hold your date`, p.lead `Pick an open date below to hold it. I'll reach out to plan the menu with you.`. Then `<ol class="steps">` with three `li`s:
   - `<strong>Pick a date.</strong> Choose an open day in the calendar and place a hold.`
   - `<strong>Plan the menu.</strong> I contact you within 24 hours about guests, menu and any dietary needs.`
   - `<strong>Pay the balance.</strong> You get a Square invoice for the final amount.`
   Then keep the embed exactly as today: `<!-- Paste Square embed code here -->` followed by `<div class="embed-box" id="square-embed">Paste Square embed code here</div>`. Then `<p class="note">Want to talk through menu and budget first? <a href="/experiences/private-parties.html#quote">Request a quote</a>.</p>`
4. **Classes** `<section class="section" id="classes">`: section-head with eyebrow `Cooking classes and supper club`, h2 `Upcoming dates`, p.lead `Classes from $110/person, gratuity not included.`. Then `<div class="grid grid--3">` with three `article.date-card`s using the exact same markup as `index.html`'s date cards (p.what `Cooking Class`, p.when `[DATE] · [TIME] · [SEATS]`, `a.btn.btn-cta` "Reserve a Seat" with `aria-label="Reserve a seat, class date N"`) and hrefs `[SQUARE_CLASS_LINK_1..3]`. Then `<p class="note checkout-note">Reserve takes you to Square's secure checkout, then brings you right back here.</p>` and `<p class="note">Supper club dates fill fast. <a href="/experiences/supper-club.html#waitlist">Join the waitlist</a>.</p>`
5. **Gift** section: keep the current `#gift` section unchanged.
6. **Payment and policies** section: keep unchanged.

CSS appended to `css/styles.css` (before nothing in particular; append at the end of the file, but media queries go in a new `@media (min-width:640px)` block):
- `.choice-card`: block link styled like `.card` (background `#fffaf0`, `1px solid var(--line)`, `var(--radius)`, `var(--shadow)`), padding `var(--space-3)`, `color:var(--ink)`, `text-decoration:none`, flex column; hover/focus-visible: border-color `var(--terracotta)`, `transform:translateY(-2px)` (guard transform with the existing reduced-motion pattern if one exists), focus-visible outline `3px solid var(--saffron)`.
- `.steps`: ordered list with `padding-left:1.25rem`, `display:grid`, `gap:var(--space-2)`, `max-width:640px`, `margin:0 0 var(--space-4)`.
- `.checkout-note{margin-top:var(--space-3)}`.

Tests: in the Task 1 test, add `'book.html'` to the page array. Add:
```js
test('book page chooser jumps to each booking path', async ({ page }) => {
  await page.goto('/book.html');
  const targets = await page.$$eval('#choose .choice-card', (as) => as.map((a) => a.getAttribute('href')));
  expect(targets).toEqual(['#private-events', '#classes', '#gift']);
  for (const t of targets) await expect(page.locator(t)).toHaveCount(1);
  await expect(page.locator('#private-events #square-embed')).toHaveCount(1);
});
```
Run the full suite; all pass (including no horizontal scroll at 390px).

## Task 3: Booking confirmed page
Files: new `booking-confirmed.html`, `tests/site.spec.js`, `robots.txt` only if it lists disallowed thank-you/404 pages (mirror whatever it does for `thank-you.html`; if it doesn't mention it, leave robots alone). Do not add to `sitemap.xml`.

`booking-confirmed.html` is where Square Payment Links redirect after checkout. Build it from `thank-you.html` (same head structure incl. `<meta name="robots" content="noindex, follow">`, same shared blocks), with:
- title `Booking confirmed | Chef Angelo Guida`, meta description `Your booking with Chef Angelo Guida is confirmed.`, canonical `https://chefangeloguida.com/booking-confirmed.html` (and matching og:url if thank-you has og tags).
- main content: eyebrow `Grazie`; h1 `You're booked`; p.lead `Your payment went through and your seat is saved. Square is emailing you a receipt now.`; h2 `What happens next`; `ul` with: `You'll get a confirmation email from me within 24 hours with the address and what to bring.`, `Tell me about allergies or dietary needs by replying to that email.`, `Need to change plans? See the cancellation policy on the <a href="/book.html">booking page</a>.`; then buttons `<a class="btn btn-cta" href="/index.html">Back to home</a>` and `<a class="btn btn-outline" href="/menus.html">See the menus</a>`.

Tests: add `'booking-confirmed.html'` to `PAGES` (after `'thank-you.html'`). Add:
```js
test('booking-confirmed is noindex and not in sitemap', async ({ page }) => {
  await page.goto('/booking-confirmed.html');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  expect(fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8')).not.toContain('booking-confirmed');
});
```
Run the full suite; all pass.

## Task 4: Docs
Files: `README.md`, `docs/design.md`.

README:
- Add rows to the token table: `[SQUARE_CLASS_LINK_1]` / `_2` / `_3` → "Square Payment Link for each upcoming class or supper club date (same order as the date cards in index.html, book.html, experiences/cooking-classes.html)".
- Replace the "Square embed on book.html" section with a "Square setup for book.html" section covering, as short numbered steps:
  1. Private events: in Square Appointments create a service "Private Event – Date Hold" with a deposit or card-on-file cancellation policy; connect Google Calendar so busy days are blocked; copy the embed code (Online > Appointments > Share/Embed, wording may differ in your dashboard) and paste it in place of the dashed `Paste Square embed code here` box in `book.html`. Note that some features (for example prepayment) may need Appointments Plus or Premium; check your plan.
  2. After the menu is agreed, send the balance as a Square Invoice.
  3. Classes and supper club: create one Square Payment Link per date with the seat quantity, and in its checkout settings set the redirect URL to `https://chefangeloguida.com/booking-confirmed.html`. Paste each link over `[SQUARE_CLASS_LINK_N]`.
  4. Turn on Square's customer confirmation/receipt emails.

design.md: update the **Book:** bullet under "Pages and content" to describe the chooser, private-events embed + steps + quote fallback, class date cards with per-date payment links, gift, and policies; add the three new tokens to the "Square placeholders" token list; add `booking-confirmed.html` (noindex, redirect target after Square checkout) to the pages description.

No tests change. Run the full suite once to confirm still green.
