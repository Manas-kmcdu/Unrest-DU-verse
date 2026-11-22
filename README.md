# Unrest site

Static site: no build step needed to deploy. Upload this folder to any static host (Firebase Hosting, Netlify, Vercel static).

## Pages
- `index.html` home (hero app page, colleges wall + banner, events slideshow, card, store, students, reps, brands, about)
- `events/` events page (student / sponsor chooser, sponsor enquiry form)
- `colleges/<slug>/` one page per college, generated

## Before launch (placeholders)
1. `assets/config.js`: set `SITE_URL` (social previews need absolute URLs), then run `node scripts/build-colleges.mjs` (add `--og` to render share images; needs Playwright).
2. `assets/config.js`: set `COUNTS_ENDPOINT` for real student counts. Until then counts are placeholders from `data/colleges.ts`.
3. Store links: the App Store / Play Store buttons point to `#get`. Real URLs go in `index.html`.
4. Legal pages (Privacy, Terms, ...), store page, careers, partners, contact: footer entries are text only until pages exist.
5. Sponsor form endpoint: `ENQ_ENDPOINT` in `events/index.html` (Apps Script). It posts with `no-cors`, so check your Sheet after a test.
6. Airone: drop a licensed `airone-bold.woff2` into `assets/fonts/` to replace the Lexend stand-in. Times New Roman MT Condensed for the logo is picked up if installed (see `assets/theme.js`).

## Live wall + register (interface only)
- Hero shows six live college tiles (3x2, one swaps at a time) (assets/home-colleges.js). It reacts to `UnrestLive.join(slug)` (assets/live.js): tile pulses, count rises, ticker says "N students from X joined Unrest 5 min ago". Call it from your Firebase listener.
- "Register" opens the account form (assets/register.js): name, college, email, DU proof upload, password + confirm. Replace `UnrestRegister.submit(data)` with Firebase Auth + Storage + Firestore.
- `LIVE_DEMO` and `REGISTER_DEMO` in assets/config.js fake activity for design review. Keep both **false** on the live site.

## Editing
- Colleges: `data/colleges.ts`, then `node scripts/build-colleges.mjs`.
- Events on the home slideshow: `EVENTS` in `assets/events-slider.js`. Events page tiles: `events/index.html`.
- Theme tokens: top of `assets/site.css`.
