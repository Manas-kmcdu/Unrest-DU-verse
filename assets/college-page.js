/* College page behaviour: live counts, milestone bar, leaderboard, signup dialog, share.
   Data, counts, validation, ranking and share text all live in assets/college-core.js. */
(function () {
  var C = window.UnrestColleges, slug = document.body.dataset.slug, col = C && C.find(slug);
  if (!col) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var rm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* opened straight from disk (file:) folders have no index, so point folder links at index.html */
  if (location.protocol === "file:") $$("a[href^='../']").forEach(function (a) {
    a.setAttribute("href", a.getAttribute("href").replace(/\/(#.*)?$/, "/index.html$1"));
  });

  /* ---------- urls + clipboard + toast ---------- */
  function pageUrl() { return location.href.replace(/[?#].*$/, ""); }
  function urlFor(c) { return c.slug === slug ? pageUrl() : pageUrl().replace(new RegExp("/" + slug + "/(index\\.html)?$"), "/" + c.slug + "/"); }
  var tt = null;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(tt); tt = setTimeout(function () { t.classList.remove("show"); }, 3400);
  }
  function copy(text, msg) {
    function fallback() {
      var a = document.createElement("textarea"); a.value = text; a.setAttribute("readonly", ""); a.style.cssText = "position:fixed;top:0;opacity:0";
      document.body.appendChild(a); a.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(a); toast(ok ? msg : "Couldn't copy. Long-press the link to copy it.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast(msg); }, fallback);
    else fallback();
  }
  var IG_MSG = "Copied. Paste it as a link sticker in your story.";

  /* ---------- nav ---------- */
  var nav = $("#nav"), pg = $("#pg");
  function onScroll() {
    var y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle("sc", y > 24); pg.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();

  /* ---------- count, milestone, leaderboard ---------- */
  var cnt = $("#cnt"), cntsr = $("#cntsr"), bar = $("#bar"), fill = $("#bar i"), rem = $("#rem"), tgt = $("#tgt");
  function countUp(n) {
    var t0 = performance.now();
    (function f(t) { var p = Math.min(1, (t - t0) / 900); cnt.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  function paint(animate) {
    var n = C.getCount(col), m = C.milestone(n);
    cntsr.textContent = n; rem.textContent = m.remaining; tgt.textContent = m.target;
    bar.setAttribute("aria-valuenow", n); bar.setAttribute("aria-valuemax", m.target);
    bar.setAttribute("aria-label", "Progress to " + m.target + " students");
    fill.style.width = m.pct + "%";
    if (animate && !rm) countUp(n); else cnt.textContent = n;
  }
  function leaderboard() { C.renderLeaderboard($("#lb"), { n: 5, base: "../", highlight: slug }); }
  if (!rm) { cnt.textContent = "0"; fill.style.width = "0"; void fill.offsetWidth; }
  var shown = false;
  function first() { if (shown) return; shown = true; paint(true); leaderboard(); }
  if (C.hasEndpoint()) {
    C.loadCounts().then(function (ok) { if (!shown) first(); else if (ok) { paint(false); leaderboard(); } });
    setTimeout(first, 1500); /* never leave the number at 0 if the endpoint is slow */
  } else first();

  /* ---------- share row on the page ---------- */
  $("#sh-wa").href = C.whatsappUrl(col, pageUrl());
  $("#sh-ig").addEventListener("click", function () { copy(C.igCaption(col, pageUrl()), IG_MSG); });

  /* ---------- signup dialog ---------- */
  var dlg = $("#jd"), form = $("#jf"), vForm = $("#jv-form"), vOk = $("#jv-ok"), submit = $("#jsub"), jerr = $("#jerr");
  var fields = ["name", "college", "year", "contact"], done = false;
  function F(k) { return $("#f-" + k); }
  function clearErr(k) { var e = $("#e-" + k); e.textContent = ""; F(k).removeAttribute("aria-invalid"); }
  function clearAll() { fields.forEach(clearErr); jerr.hidden = true; }
  function reset() {
    clearAll();
    if (done) { form.reset(); F("college").value = slug; done = false; }
    vForm.hidden = false; vOk.hidden = true;
  }
  function openDlg() {
    reset();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    document.documentElement.style.overflow = "hidden";
  }
  function closeDlg() { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); document.documentElement.style.overflow = ""; }
  dlg.addEventListener("close", function () { document.documentElement.style.overflow = ""; });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDlg(); }); /* backdrop click */
  $$("[data-close]").forEach(function (b) { b.addEventListener("click", closeDlg); });
  $$("[data-join]").forEach(function (b) { b.addEventListener("click", openDlg); });
  fields.forEach(function (k) { F(k).addEventListener("input", function () { clearErr(k); }); F(k).addEventListener("change", function () { clearErr(k); }); });

  function busy(on) { submit.disabled = on; submit.textContent = on ? "Joining…" : "Join Unrest"; }
  form.addEventListener("submit", function (e) {
    e.preventDefault(); clearAll();
    var r = C.validate({ name: F("name").value, college: F("college").value, year: F("year").value, contact: F("contact").value });
    if (!r.ok) {
      var first = null;
      fields.forEach(function (k) { if (r.errors[k]) { $("#e-" + k).textContent = r.errors[k]; F(k).setAttribute("aria-invalid", "true"); if (!first) first = F(k); } });
      if (first) first.focus(); return;
    }
    if (form.website.value) { success(r.value, { demo: false }, true); return; } /* honeypot: look successful, send nothing */
    busy(true);
    C.submitSignup(r.value).then(function (res) { busy(false); success(r.value, res, false); }, function () {
      busy(false); jerr.textContent = "Couldn't send that. Check your connection and try again."; jerr.hidden = false;
    });
  });

  function success(v, res, bot) {
    var c2 = C.find(v.college) || col, url = urlFor(c2), first = v.name.split(" ")[0];
    $("#ok-h").textContent = "Got it, " + first + ".";
    $("#ok-p").textContent = "We'll be in touch at " + C.maskContact(v.contact, v.contactType) + ".";
    $("#ok-demo").hidden = !res.demo;
    var bring = $("#bring"); bring.href = C.whatsappUrl(c2, url);
    bring.onclick = function (e) {
      if (!navigator.share) return; /* no native sheet: the link opens WhatsApp */
      e.preventDefault();
      navigator.share({ title: c2.name + " on Unrest", text: C.shareText(c2).trim(), url: url }).catch(function () {});
    };
    $("#ok-ig").onclick = function () { copy(C.igCaption(c2, url), IG_MSG); };
    vForm.hidden = true; vOk.hidden = false; done = true; $("#ok-h").focus();
    if (bot) return;
    C.setMine(v.college);
    if (!res.demo) { var o = {}; o[c2.slug] = C.getCount(c2) + 1; C.setCounts(o); paint(false); leaderboard(); } /* optimistic bump, real data only */
  }
})();
