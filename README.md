# Unrest site

Static site: no build step needed to deploy. Primary domain: `https://unrestdu.in` (set in `assets/config.js`).

This repo also holds the live app pages (`feed.html`, `feed/`, `mod/`, `download.html`, `join-us.html`, `versus.html`, `house.html`, `privacy.html`, `terms.html`, `child-safety.html`, `delete-account.html`, `firebase.js` and rules). Do not delete them: the app, store listings and the web feed depend on them. Only `index.html` was replaced when the new site went in.

## Pages
- `index.html` home (hero app page, colleges wall + banner, events slideshow, card, store, students, reps, brands, about)
- `events/` events page (student / sponsor chooser, sponsor enquiry form)
- `colleges/<slug>/` one page per college, generated

## Before launch (placeholders)
1. `assets/config.js`: set `SITE_URL` (social previews need absolute URLs), then run `node scripts/build-colleges.mjs` (add `--og` to render share images; needs Playwright).
2. `assets/config.js`: set `COUNTS_ENDPOINT` for real student counts. Until then counts are placeholders from `data/colleges.ts`.
3. Store buttons: App Store goes straight to the App Store listing; Play Store goes to `/download.html` (Android testing was still delayed there). Check both are still right.
4. Footer links Privacy, Terms, Safety, Careers, Contact and Delete account to the live pages. Still text only (no page yet): Community Guidelines, Refund Policy, Shipping Policy, Journal.
5. Udyam number in the footer: `index.html` (`XXXXXXXX`).
6. Sponsor form endpoint: `ENQ_ENDPOINT` in `events/index.html` (Apps Script). It posts with `no-cors`, so check your Sheet after a test.
7. Airone: drop a licensed `airone-bold.woff2` into `assets/fonts/` to replace the Lexend stand-in. Times New Roman MT Condensed for the logo is picked up if installed (see `assets/theme.js`).

## Editing
- Colleges: `data/colleges.ts`, then `node scripts/build-colleges.mjs`.
- Events on the home slideshow: `EVENTS` in `assets/events-slider.js`. Events page tiles: `events/index.html`.
- Theme tokens: top of `assets/site.css`.
- New public hand-written page: add it to `EXTRA_PAGES` in `scripts/build-colleges.mjs` so it lands in `sitemap.xml`.
