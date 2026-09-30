# Chef Angelo Guida — Website Rebuild Plan

## Context
A friend of the user, Chef Angelo Guida, an Italian personal chef in Los Angeles, needs a new chefangeloguida.com. It replaces the current Wix site with a custom static site. Booking and payments stay entirely in **Square**; the site only links to Square and embeds it. Decisions already made:
- plain HTML/CSS/JS with no build step
- hosted on Netlify
- Netlify Forms email every submission to chef.angeloguida@gmail.com and store signups (exportable as CSV)
- placeholder photos for now
- content edited in code by the user and Claude

Brand: "Chef Angelo Guida", tagline "Cook. Eat. Discover." The voice is warm and first-person. The site must not invent prices, dates or availability.

Location: `/Users/marcuspetrov/Desktop/CodeProjects/chef-angelo-guida/` (new folder, `git init`). The approved design is also saved to `docs/design.md` in the repo and committed.

## File structure
```
chef-angelo-guida/
  index.html
  experiences/private-chef.html  private-parties.html  kids-parties.html
              date-night.html    cooking-classes.html  supper-club.html
  menus.html  about.html  gallery.html  faq-contact.html  book.html  thank-you.html  404.html
  css/styles.css        # tokens, layout, components
  js/main.js            # mobile nav, gallery filter, placeholder-link guard, sticky bar
  images/placeholders/  # warm-toned SVG placeholders labeled "PHOTO: …"
  netlify.toml  sitemap.xml  robots.txt  README.md (how to swap placeholders + enable Netlify email notifications)
  docs/design.md
  tests/ (Playwright)
```
The header, footer and mobile sticky "Book Now" bar are copied into every page, wrapped in `<!-- SHARED:HEADER START/END -->` comments so they can be edited in sync.

## Visual system (css/styles.css)
- **Colors (`:root`):** cream `#F6F0E4`, olive `#5C6B3C`, terracotta `#B5563A`, ink `#2A2622`, accent saffron `#D9A441` (CTAs only).
- **Fonts:** Cormorant Garamond for headings, Inter for body text, both from Google Fonts with `display=swap`.
- **Layout:** mobile-first with breakpoints at 640 and 1024px, and a card grid of 1, 2 or 3 columns. Full-bleed hero images, generous spacing, subtle paper-grain texture, region names in small caps.

## Pages and content
- **Home:** hero with "Book an Experience" button, six experience cards, "Why Chef Angelo" (Naples, Bocca di Lupo, 15+ years teaching), Upcoming Dates, Gift an Experience, newsletter signup, Instagram grid linking to his profile.
- **Six experience pages**, each with a hero, first-person description, details and pricing exactly as in the brief, Book Now button, accepted payments, and `[POLICY_TEXT]`. Page-specific additions:
  - **Private Chef, Private Parties, Kids Parties, Date Night:** add the **Request a Quote** form.
  - **Cooking Classes:** adds Upcoming Dates with "Reserve a Seat" buttons, plus a graduation-gift note.
  - **Supper Club:** marked "Coming Soon", with the waitlist form and an Upcoming Dates placeholder.
- **Menus:** Italy's Greatest Hits, a Calabrian seafood menu and a holiday-party section, written as real HTML menu cards.
- **About:** Food Philosophy ("Food is culture", social-first events, regional only, against fake authenticity) and the full bio.
- **Gallery:** filter buttons (All / Dinners / Classes / Kids / Events) using `data-category`, and lazy-loaded images.
- **FAQ and Contact:** `<details>` accordion (classes, in-home parties, menus, BYOB, pricing, gifting), contact form, `[phone]`, and the email address.
- **Book:** Square button fallback, then a dashed box labeled "Paste Square embed code here" with an HTML comment marker. Also Gift an Experience (`[SQUARE_GIFT_CARD_URL]`), payment methods and policy.

## Square placeholders
Literal tokens: `[SQUARE_BOOKING_URL]`, `[SQUARE_GIFT_CARD_URL]`, `[POLICY_TEXT]`, `[phone]`, `[INSTAGRAM_URL]`, and `[DATE] · [TIME] · [SEATS]` for class dates. In `main.js`, any link whose href still starts with `[` is intercepted and shows a "Link coming soon" note. Links open in the same tab.

## Forms (Netlify)
All forms have `data-netlify="true"`, a `netlify-honeypot` spam trap, and `action="/thank-you.html"`:
- `quote-request`: date, time, guests, address, dietary needs, occasion, budget, name, email, phone, plus a hidden `experience` field
- `contact`
- `newsletter`
- `supper-club-waitlist`

The README covers turning on the "Form submission notifications → email" setting for chef.angeloguida@gmail.com.

## SEO
- **Per-page tags:** a unique `<title>` and meta description for each page, aimed at the target phrases ("private chef Los Angeles", "Italian private chef", "at-home cooking classes Los Angeles"). Canonical URLs and Open Graph/Twitter tags.
- **Structured data:** JSON-LD LocalBusiness/FoodEstablishment with `areaServed` (LA, Calabasas, Malibu, Beverly Hills, Ventura County, Santa Barbara), plus FAQPage on the FAQ page.
- **Files and markup:** `sitemap.xml`, `robots.txt`, semantic headings and alt text.

## Verification
1. Serve the site locally (`npx serve .`) and run the Playwright tests at 390px and 1280px widths. The tests check that:
   - every page loads without console errors
   - there are no broken internal links
   - every Book/Reserve/Gift link is a placeholder token (no invented URLs)
   - the sticky bar is visible on mobile and hidden on desktop
   - gallery filters show and hide the right items
   - each form has `data-netlify` and a honeypot field
   - there's no horizontal scroll on mobile
2. Run Lighthouse on Home and one experience page, aiming for 90+ on Accessibility and SEO.
3. Take phone and desktop screenshots of each page and send them to the user for review.
4. Update graphify afterwards (`graphify update .`), per CLAUDE.md.

## Out of scope (for now)
Real photos, deploying to Netlify, the DNS switch, and a live Instagram feed. The README explains the steps for each.
