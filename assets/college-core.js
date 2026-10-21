/* Unrest college core.
   ONE place for: counts, milestone, ranking/leaderboard, share links, signup validation, building illustrations.
   Runs in the browser (window.UnrestColleges) and in Node (scripts/build-colleges.mjs).
   To use real counts: set UNREST_CONFIG.COUNTS_ENDPOINT (assets/config.js). Nothing else changes. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(root);
  else root.UnrestColleges = factory(root);
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  var list = [], overlay = {}, MINE = "unrest-college";
  var cfg = function () { return root.UNREST_CONFIG || {}; };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var norm = function (s) { return String(s).toLowerCase().replace(/[.’']/g, "").trim(); };

  /* ---------- data ---------- */
  function setColleges(l) { list = l.slice(); }
  function all() { return list.length ? list : (root.UNREST_COLLEGES || []); }
  function find(slug) { var a = all(); for (var i = 0; i < a.length; i++) if (a[i].slug === slug) return a[i]; return null; }

  /* ---------- counts (single source) ---------- */
  function getCount(c) {
    var s = typeof c === "string" ? c : c.slug;
    if (overlay[s] != null) return overlay[s];
    var o = find(s); return o ? o.userCount : 0;
  }
  function setCounts(o) {
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k) && isFinite(o[k]) && o[k] >= 0) overlay[k] = Math.round(o[k]);
  }
  function loadCounts() {
    var u = cfg().COUNTS_ENDPOINT;
    if (!u || typeof fetch !== "function") return Promise.resolve(false);
    return fetch(u, { headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { setCounts(j.counts || j); return true; })
      .catch(function () { return false; });
  }
  function ranked() { return all().slice().sort(function (a, b) { return getCount(b) - getCount(a) || a.name.localeCompare(b.name); }); }
  function rankOf(slug) { var r = ranked(); for (var i = 0; i < r.length; i++) if (r[i].slug === slug) return i + 1; return 0; }
  function milestone(n) { var t = (Math.floor(n / 100) + 1) * 100; return { target: t, remaining: t - n, pct: Math.round(n / t * 1000) / 10 }; }

  /* ---------- "my college" (per browser) ---------- */
  function getMine() { try { var s = localStorage.getItem(MINE); return s && find(s) ? s : null; } catch (e) { return null; } }
  function setMine(s) { try { localStorage.setItem(MINE, s); } catch (e) {} }

  /* ---------- leaderboard ---------- */
  /* College page URL. Folder URL on a server; opened straight from disk (file:) there is no directory index, so add it. */
  function pageHref(slug, base) { var f = typeof location !== "undefined" && location.protocol === "file:"; return (base || "") + slug + "/" + (f ? "index.html" : ""); }
  function hasEndpoint() { return !!cfg().COUNTS_ENDPOINT; }
  function lbRow(c, rank, max, me, base) {
    return '<li class="lbr' + (me ? ' me' : '') + '" style="--c:' + esc(c.accentColour) + '"><a href="' + esc(pageHref(c.slug, base)) + '"' + (me ? ' aria-current="true"' : "") + '>' +
      '<span class="lbn">' + rank + '</span><span class="lbt"><b>' + esc(c.name) + (me ? '<em class="lbtag">Your college</em>' : "") +
      '</b><i class="lbb"><u style="width:' + Math.max(4, Math.round(getCount(c) / max * 100)) + '%"></u></i></span>' +
      '<span class="lbc">' + getCount(c) + '</span></a></li>';
  }
  function leaderboardHTML(o) {
    o = o || {}; var n = o.n || 5, base = o.base || "", hl = o.highlight, r = ranked();
    if (!r.length) return "";
    var max = Math.max(1, getCount(r[0])), top = r.slice(0, n), h = "", inTop = false;
    top.forEach(function (c, i) { var me = c.slug === hl; if (me) inTop = true; h += lbRow(c, i + 1, max, me, base); });
    if (hl && !inTop && find(hl)) h += '<li class="lbgap" aria-hidden="true">&middot;&middot;&middot;</li>' + lbRow(find(hl), rankOf(hl), max, true, base);
    return '<ol class="lb">' + h + '</ol>';
  }
  function renderLeaderboard(el, o) { if (el) el.innerHTML = leaderboardHTML(o); }

  /* ---------- share ---------- */
  function shareText(c) { return c.shortName + " is on Unrest, the verified network for Delhi University students. Join your college: "; }
  function whatsappUrl(c, url) { return "https://wa.me/?text=" + encodeURIComponent(shareText(c) + url); }
  function igCaption(c, url) { return shareText(c) + url; }

  /* ---------- signup ---------- */
  var YEARS = { "1": "1st year", "2": "2nd year", "3": "3rd year", "4": "4th year or above", "pg": "Postgraduate" };
  function validate(v) {
    var e = {}, out = {};
    var name = String(v.name || "").replace(/\s+/g, " ").trim();
    if (name.length < 2) e.name = "Enter your name.";
    else if (name.length > 80) e.name = "Keep it under 80 characters.";
    else if (!/[A-Za-zऀ-ॿ]/.test(name)) e.name = "Use letters in your name.";
    if (!find(v.college)) e.college = "Pick your college.";
    if (!YEARS[v.year]) e.year = "Pick your year.";
    var raw = String(v.contact || "").trim(), type = "", val = raw;
    if (!raw) e.contact = "Enter your college email or phone.";
    else if (raw.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw)) { type = "email"; val = raw.toLowerCase(); }
    else {
      var d = raw.replace(/[\s\-()]/g, "");
      if (/^\+91/.test(d)) d = d.slice(3); else if (/^91\d{10}$/.test(d)) d = d.slice(2); else if (/^0\d{10}$/.test(d)) d = d.slice(1);
      if (/^[6-9]\d{9}$/.test(d)) { type = "phone"; val = d; }
      else e.contact = "Enter a valid email or a 10-digit mobile number.";
    }
    out = { name: name, college: v.college, year: v.year, contact: val, contactType: type };
    return { ok: !Object.keys(e).length, errors: e, value: out };
  }
  function maskContact(v, type) {
    if (type === "email") { var p = v.split("@"); return p[0].charAt(0) + "***@" + p[1]; }
    return "XXXXXX" + v.slice(-4);
  }
  /* Swap point. With SIGNUP_ENDPOINT empty this is DEMO MODE: nothing leaves the browser. */
  function submitSignup(payload) {
    var u = cfg().SIGNUP_ENDPOINT;
    payload.source = "college-page";
    if (!u) {
      try { var q = JSON.parse(localStorage.getItem("unrest-signups-demo") || "[]"); q.push(payload); localStorage.setItem("unrest-signups-demo", JSON.stringify(q)); } catch (e) {}
      if (typeof console !== "undefined") console.info("[unrest] SIGNUP_ENDPOINT not set: signup NOT sent (demo mode).");
      return new Promise(function (r) { setTimeout(function () { r({ demo: true }); }, 500); });
    }
    return fetch(u, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) throw new Error("bad status"); return { demo: false }; });
  }

  /* ---------- building illustrations ---------- */
  var R = function (x, y, w, h, f) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (f ? ' class="f"' : '') + '/>'; };
  var P = function (d, f) { return '<path d="' + d + '"' + (f ? ' class="f"' : '') + '/>'; };
  function row(x0, x1, y, n, h) { var s = '', st = (x1 - x0) / n; for (var i = 0; i < n; i++) s += R(x0 + st * i + st / 2 - 3, y, 6, h); return s; }
  function dm(cx, y, r, f) { return P('M' + (cx - r) + ' ' + y + 'A' + r + ' ' + r * .85 + ' 0 0 1 ' + (cx + r) + ' ' + y + 'Z', f); }
  var ART = {
    dome: function (n) { return R(16, 72, 168, 28, 1) + R(66, 48, 68, 52) + dm(100, 48, 28, 1) + P('M100 25V12') + row(22, 60, 82, n, 12) + row(140, 178, 82, n, 12) + P('M92 100V86A8 8 0 0 1 108 86V100'); },
    clock: function (n) { return R(16, 76, 168, 24, 1) + R(80, 24, 40, 76) + P('M76 24L100 6L124 24Z', 1) + '<circle cx="100" cy="44" r="9"/>' + P('M100 44V38M100 44H105') + row(22, 76, 84, n, 10) + row(124, 178, 84, n, 10); },
    arches: function (n) { var s = R(16, 50, 168, 50, 1) + R(12, 44, 176, 6), w = 168 / n; for (var i = 0; i < n; i++) { var x = 16 + w * i; s += P('M' + (x + w * .2) + ' 100V80A' + w * .3 + ' ' + w * .3 + ' 0 0 1 ' + (x + w * .8) + ' 80V100'); } return s + row(24, 176, 58, n + 2, 8); },
    columns: function (n) { var c = n + 2, s = P('M20 44L100 20L180 44Z', 1) + R(20, 44, 160, 8) + R(16, 92, 168, 8, 1); for (var i = 0; i < c; i++) { var x = 28 + 144 / (c - 1) * i; s += R(x - 3, 52, 6, 40); } return s; },
    gate: function (n) { return R(14, 64, 36, 36, 1) + R(150, 64, 36, 36, 1) + R(50, 36, 100, 64, 1) + dm(66, 36, 12, 1) + dm(134, 36, 12, 1) + P('M66 24V16M134 24V16') + P('M82 100V68A18 18 0 0 1 118 68V100') + row(18, 46, 72, Math.min(n, 4), 12) + row(154, 182, 72, Math.min(n, 4), 12); },
    tower: function (n) { return R(30, 58, 46, 42, 1) + R(124, 58, 46, 42, 1) + R(76, 18, 48, 82, 1) + P('M84 18V10H116V18') + R(92, 4, 16, 6) + row(34, 72, 68, Math.max(2, n - 1), 20) + row(130, 166, 68, Math.max(2, n - 1), 20) + R(92, 70, 16, 30); },
    modern: function (n) { var s = R(20, 60, 70, 40, 1) + R(90, 36, 70, 64) + R(160, 70, 24, 30, 1); for (var y = 44; y < 96; y += 16) s += row(94, 156, y, n + 1, 8); return s + row(24, 86, 70, n, 16); },
    chhatri: function (n) { var s = R(16, 66, 168, 34, 1); [44, 100, 156].forEach(function (c) { s += dm(c, 54, 14, 1) + P('M' + c + ' 46V36M' + (c - 12) + ' 54V66M' + (c + 12) + ' 54V66'); }); return s + row(20, 180, 78, n + 2, 14); },
    gothic: function (n) { var c = Math.min(n, 4), st = 84 / c, s = R(20, 66, 30, 34, 1) + R(150, 66, 30, 34, 1) + R(50, 46, 100, 54, 1) + P('M84 46L100 8L116 46Z', 1); for (var i = 0; i < c; i++) { var x = 58 + st * i; s += P('M' + x + ' 92V80L' + (x + 5) + ' 72L' + (x + 10) + ' 80V92'); } return s + row(24, 46, 78, 2, 12) + row(154, 176, 78, 2, 12); }
  };
  /* Deterministic variation: Nth college using the same building type gets a different window count. */
  function variant(c) { var a = all(), k = 0; for (var i = 0; i < a.length && a[i].slug !== c.slug; i++) if (a[i].buildingIllustration === c.buildingIllustration) k++; return k; }
  function artInner(c) { return P('M8 100H192') + (ART[c.buildingIllustration] || ART.modern)(3 + variant(c) % 4); }
  function artHTML(c, assetBase) {
    var k = c.buildingIllustration;
    if (/[\/.]/.test(k)) return '<img src="' + esc(/^(https?:|\/)/.test(k) ? k : (assetBase || "") + k) + '" alt="" loading="lazy">';
    return '<svg viewBox="0 0 200 110" aria-hidden="true">' + artInner(c) + '</svg>';
  }

  return {
    setColleges: setColleges, list: all, find: find, esc: esc, norm: norm,
    pageHref: pageHref, hasEndpoint: hasEndpoint,
    getCount: getCount, setCounts: setCounts, loadCounts: loadCounts, ranked: ranked, rankOf: rankOf, milestone: milestone,
    getMine: getMine, setMine: setMine,
    leaderboardHTML: leaderboardHTML, renderLeaderboard: renderLeaderboard,
    shareText: shareText, whatsappUrl: whatsappUrl, igCaption: igCaption,
    YEARS: YEARS, validate: validate, maskContact: maskContact, submitSignup: submitSignup,
    artHTML: artHTML, artInner: artInner
  };
});
