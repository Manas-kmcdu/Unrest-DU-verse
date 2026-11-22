# Deploy: GoDaddy -> Vercel -> GitHub

## Why apex and www differ
`www.unrestdu.in` and `unrestdu.in` are two separate DNS names. Right now `www` points at Vercel and the apex still points at the old host.
Fix the DNS, then pick ONE canonical address and redirect the other to it. Canonical here: `https://unrestdu.in` (matches the links and SITE_URL in this site).

## Before touching DNS: check what the apex serves today
If the Unrest web app (feed, login) lives at `unrestdu.in` on Firebase Hosting, moving the apex to Vercel takes it offline.
1. Move the app first: Firebase Hosting > Add custom domain `app.unrestdu.in`, add the records it gives you at GoDaddy.
2. Add `app.unrestdu.in` to Firebase Auth > Settings > Authorized domains (and any OAuth redirect lists).
3. Update the app links on the site (`/get`, `/app`) if they should point there.

## GoDaddy DNS (Domain > DNS)
| Type  | Name | Value |
|-------|------|-------|
| A     | @    | the value on the Vercel domain card (usually `76.76.21.21`) |
| CNAME | www  | the value on the Vercel domain card (usually `cname.vercel-dns.com`) |
- Delete every other A and AAAA record on `@` (old host, Firebase `199.36.158.x`, GoDaddy parking). Leave subdomain CNAMEs (`halloween`, `kmcumang`, `campus`, ...) alone.
- GoDaddy > Domain Settings: turn **Domain Forwarding** off. It overrides DNS.
- Delete old `_acme-challenge` TXT records from a previous host.

## Vercel
1. Project > Settings > General: **Root Directory** = the folder that holds this `index.html`. Framework preset **Other**. Build command empty, output directory empty.
2. Settings > Domains: add `unrestdu.in` and `www.unrestdu.in`. Both must say **Valid Configuration**.
3. On `www.unrestdu.in` choose **Redirect to** `unrestdu.in` (308). Do not also redirect the other way, or it loops.
4. Settings > Git: Production Branch = the branch you push to (usually `main`).

## Check
```
dig +short unrestdu.in          # the A value above
dig +short www.unrestdu.in      # a vercel-dns CNAME
curl -I https://www.unrestdu.in # 308 to https://unrestdu.in/
curl -I https://unrestdu.in     # 200
```
Wait for TTL (GoDaddy default 1 h; set TTL to 600 before changing). Test in a private window: browsers cache redirects.

## Repo layout (one repo, static)
```
index.html  vercel.json  robots.txt  sitemap.xml
assets/  events/  colleges/  data/  scripts/
```
Every push to the production branch deploys. After editing `data/colleges.ts` run `node scripts/build-colleges.mjs` and commit the result.

## Keep sub-sites separate, link them in
Separate repos are fine. Give each its own subdomain (CNAME in GoDaddy to that project's target) instead of merging code:
`pov.unrestdu.in`, `corridor.unrestdu.in` (Node server: needs its own host), `halloween.`, `diwali.`, `campus.`, `app.`. Events live in this site at /events/.
The home page links to them. Nothing here depends on them sharing a repo.

## Live data (next step)
The site is static. Live behaviour comes from Firebase: counts, signups, and a `promos` collection (today's event, college news, posts) that the home page reads. Editing a promo in Firebase changes the site without a deploy.
