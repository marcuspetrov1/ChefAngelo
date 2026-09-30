# Chef Angelo Guida - website

Static HTML/CSS/JS site (no build step) for chefangeloguida.com. Booking and payments stay in Square; forms run on Netlify Forms.

## Run locally
```
python3 -m http.server 4173     # or: npx serve . -l 4173
```
Open http://localhost:4173. Tests: `npm install && npx playwright install chromium && npm test` (mobile 390px + desktop 1280px).

## Replace the placeholder tokens
Do a project-wide find-and-replace (VS Code: Cmd+Shift+H, or `sed`). Replace with the real value, keeping the surrounding quotes:

| Token | Replace with |
|---|---|
| `[SQUARE_BOOKING_URL]` | Square Appointments / booking page URL |
| `[SQUARE_GIFT_CARD_URL]` | Square gift card page URL |
| `[SQUARE_CLASS_LINK_1]` | Square Payment Link for each upcoming class or supper club date (same order as the date cards in index.html, book.html, experiences/cooking-classes.html) |
| `[SQUARE_CLASS_LINK_2]` | Square Payment Link for each upcoming class or supper club date (same order as the date cards in index.html, book.html, experiences/cooking-classes.html) |
| `[SQUARE_CLASS_LINK_3]` | Square Payment Link for each upcoming class or supper club date (same order as the date cards in index.html, book.html, experiences/cooking-classes.html) |
| `[POLICY_TEXT]` | Cancellation/deposit policy text |
| `[phone]` | Phone number (text, not inside an href) |
| `[INSTAGRAM_URL]` | https://instagram.com/... profile URL |
| `[DATE] · [TIME] · [SEATS]` | Each upcoming class/dinner, e.g. `Sat Oct 12 · 6:00 PM · 8 seats` (edit per card in index.html, book.html, experiences/cooking-classes.html, experiences/supper-club.html) |

Until replaced, clicking those links shows "Link coming soon".

## Square setup for book.html
1. **Private events:** In Square Appointments create a service called "Private Event – Date Hold" with a deposit or card-on-file cancellation policy. Connect your Google Calendar so busy days are blocked. Copy the embed code (Online > Appointments > Share/Embed; wording may differ in your dashboard) and paste it in place of the dashed `Paste Square embed code here` box in `book.html`. Note that some features (for example prepayment) may need Appointments Plus or Premium; check your plan.
2. **After the menu is agreed**, send the balance as a Square Invoice.
3. **Classes and supper club:** Create one Square Payment Link per date with the seat quantity. In each link's checkout settings, set the redirect URL to `https://chefangeloguida.com/booking-confirmed.html`. Paste each link over `[SQUARE_CLASS_LINK_N]`.
4. Turn on Square's customer confirmation/receipt emails.

## Swap placeholder photos
Placeholders live in `images/placeholders/*.svg`. Add real photos (JPG/WebP, ideally under 300 KB, hero ~1600px wide) to `images/`, then change the `src` in the HTML and update the `alt` text (find with `grep -rn placeholders *.html experiences`). Keep `width`/`height` attributes.

## Deploy to Netlify
1. Push the repo to GitHub, then in Netlify: Add new site > Import from Git. No build command; publish directory is `.` (set in `netlify.toml`).
2. Under Forms, confirm the four forms are detected after the first deploy: `quote-request`, `contact`, `newsletter`, `supper-club-waitlist`.
3. Site configuration > Domain management > add `chefangeloguida.com`.

## Form emails and CSV export
- Site configuration > Forms > Form notifications > Add notification > Email notification. Enter `chef.angeloguida@gmail.com` and pick "Any form" (or add one per form).
- Signups: Forms > choose a form > Export CSV.

## Switch DNS from Wix
1. In Netlify, note the DNS target (Netlify DNS nameservers, or an A record to `75.2.60.5` and `www` CNAME to your `*.netlify.app` site).
2. At the domain registrar (or in Wix if the domain is registered there), replace the Wix nameservers/A/CNAME records with Netlify's. If the domain is registered at Wix, you may need to transfer it or point custom nameservers.
3. Wait for propagation (minutes to 48 h), then in Netlify click Verify DNS and Provision HTTPS certificate. Keep the Wix site until the new one resolves.
