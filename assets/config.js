/* Site config. Edit here, nothing else needs to change.
   COUNTS_ENDPOINT : GET -> JSON { "hindu": 123, "kmc": 98, ... } or { counts: {...} }. Empty = use PLACEHOLDER counts from data/colleges.ts.
   SIGNUP_ENDPOINT : POST JSON { name, college, year, contact, contactType, source }. Empty = signups are NOT sent anywhere (demo mode).
   SITE_URL        : your live origin, e.g. "https://unrest.in" (no trailing slash). Used at build time for canonical links, absolute og:image URLs and sitemap.xml.
                     Social crawlers (WhatsApp, Instagram, X) need absolute og:image URLs, so set this before launch and re-run scripts/build-colleges.mjs. */
window.UNREST_CONFIG = {
  COUNTS_ENDPOINT: "",
  SIGNUP_ENDPOINT: "",
  SITE_URL: "https://unrestdu.in"
};
