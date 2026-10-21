/* Home page: live college banner + College Wall (tilt, lit scene, filters) + top-5 leaderboard.
   Data, counts, ranking and illustrations all come from assets/college-core.js (single source). */
(function () {
  var C = window.UnrestColleges, wall = document.getElementById("cw");
  if (!C || !wall) return;
  var $ = function (s) { return document.querySelector(s); };
  var rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BASE = "colleges/", camp = "All", q = "", io = null, started = false;
  var TREES = '<svg class="tr" viewBox="0 0 200 50" preserveAspectRatio="none" aria-hidden="true"><circle class="f" cx="10" cy="26" r="9"/><path d="M10 35V50"/><circle class="f" cx="25" cy="31" r="7"/><path d="M25 38V50"/><circle class="f" cx="176" cy="29" r="8"/><path d="M176 37V50"/><circle class="f" cx="191" cy="25" r="9"/><path d="M191 34V50"/></svg>';

  function build() {
    wall.innerHTML = C.list().map(function (c, i) {
      var n = C.getCount(c);
      return '<li data-slug="' + C.esc(c.slug) + '" data-campus="' + c.campus + '" data-s="' + C.esc(C.norm(c.name + " " + c.shortName + " " + c.slug)) + '" style="--k:' + (i % 8) + '">' +
        '<a class="clc" href="' + C.esc(C.pageHref(c.slug, BASE)) + '" style="--c:' + C.esc(c.accentColour) + '">' +
        '<span class="ab">' + C.esc(c.shortName.toUpperCase()) + '</span>' +
        '<span><span class="nm">' + C.esc(c.name) + '</span>' +
        '<p class="ct"><b data-n="' + n + '" aria-hidden="true">' + (rm ? n : 0) + '</b><span class="sr">' + n + '</span> students on Unrest</p></span></a></li>';
    }).join("");
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; io.unobserve(e.target); e.target.classList.add("in");
        if (!rm) count(e.target.querySelector("b"));
      });
    }, { threshold: .25 });
    [].forEach.call(wall.children, function (li) { rm ? li.classList.add("in") : io.observe(li); });
    fit();
  }
  /* shrink each wordmark until it fits its card on one line */
  function fit() {
    [].forEach.call(wall.querySelectorAll(".ab"), function (el) {
      if (!el.offsetWidth) return;
      var fs = Math.min(44, Math.max(26, el.offsetWidth / 4.4));
      el.style.setProperty("--fs", fs + "px");
      while (el.scrollWidth > el.clientWidth && fs > 13) { fs -= 1; el.style.setProperty("--fs", fs + "px"); }
    });
  }
  var ft = 0;
  addEventListener("resize", function () { clearTimeout(ft); ft = setTimeout(fit, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  function count(b) {
    var t0 = performance.now();
    (function f(t) { var p = Math.min(1, (t - t0) / 900); b.textContent = Math.round(+b.dataset.n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  function filter() {
    var n = 0;
    [].forEach.call(wall.children, function (li) {
      var ok = (camp === "All" || li.dataset.campus === camp) && (!q || li.dataset.s.indexOf(q) > -1), was = !li.hidden;
      li.hidden = !ok;
      if (ok) { if (!was && started && !rm) { li.classList.remove("pop"); void li.offsetWidth; li.style.setProperty("--k", n % 8); li.classList.add("pop"); } n++; }
    });
    fit();
    $("#cwn").textContent = n + (n === 1 ? " college" : " colleges");
    $("#cwe").hidden = n > 0;
  }
  function leaderboard() { C.renderLeaderboard($("#lbh"), { n: 5, base: BASE, highlight: C.getMine() }); }
  function refresh() {
    [].forEach.call(wall.children, function (li) {
      var n = C.getCount(C.find ? C.find(li.dataset.slug) : li.dataset.slug), b = li.querySelector("b");
      b.dataset.n = n; b.textContent = n; li.querySelector(".sr").textContent = n;
    });
    leaderboard();
  }
  /* jump to a college from the banner: clear filters, scroll, pulse */
  function goTo(slug) {
    camp = "All"; q = ""; $("#cws").value = "";
    [].forEach.call(document.querySelectorAll("#cf button"), function (x) { x.setAttribute("aria-pressed", x.dataset.c === "All"); });
    filter();
    var li = wall.querySelector('[data-slug="' + slug + '"]'); if (!li) return;
    li.scrollIntoView({ behavior: rm ? "auto" : "smooth", block: "center" });
    li.classList.remove("flash"); void li.offsetWidth; li.classList.add("flash");
  }
  /* live banner: two rows moving opposite ways; speeds up with scroll, pauses on hover */
  function banner() {
    var host = $("#cbn"); if (!host) return;
    var L = C.list();
    var r1 = L.map(function (c) { return '<a class="cbi" href="#cw" tabindex="-1" data-slug="' + C.esc(c.slug) + '" style="--c:' + C.esc(c.accentColour) + '">' + C.esc(c.shortName) + '</a><span class="cbs" aria-hidden="true">&#10022;</span>'; }).join("");
    var r2 = L.slice().reverse().map(function (c) { return '<a class="cbp" href="#cw" tabindex="-1" data-slug="' + C.esc(c.slug) + '" style="--c:' + C.esc(c.accentColour) + '"><i></i>' + C.esc(c.name) + '<small>' + c.campus + '</small></a>'; }).join("");
    host.innerHTML = '<div class="cbr"><div class="cbt">' + r1 + r1 + '</div></div><div class="cbr b"><div class="cbt">' + r2 + r2 + '</div></div>';
    host.setAttribute("aria-hidden", "true");
    host.addEventListener("click", function (e) { var a = e.target.closest("[data-slug]"); if (!a) return; e.preventDefault(); goTo(a.dataset.slug); });
    host.addEventListener("pointerover", function (e) { var a = e.target.closest("[data-slug]"), li = a && wall.querySelector('[data-slug="' + a.dataset.slug + '"]'); if (li) li.classList.add("hl"); });
    host.addEventListener("pointerout", function (e) { var a = e.target.closest("[data-slug]"), li = a && wall.querySelector('[data-slug="' + a.dataset.slug + '"]'); if (li) li.classList.remove("hl"); });
    if (rm) { [].forEach.call(host.querySelectorAll(".cbr"), function (r) { r.classList.add("static"); }); return; }
    var an = [].map.call(host.querySelectorAll(".cbt"), function (t, i) {
      return t.animate(i ? [{ transform: "translateX(-50%)" }, { transform: "translateX(0)" }] : [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }], { duration: i ? 80000 : 55000, iterations: Infinity });
    });
    var vis = false, hov = false, rate = 1, ly = scrollY, vel = 0;
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }, { rootMargin: "100px" }).observe(host);
    host.addEventListener("pointerenter", function () { hov = true; }); host.addEventListener("pointerleave", function () { hov = false; });
    (function loop() {
      var y = scrollY; vel += ((y - ly) - vel) * .12; ly = y;
      if (vis) { var tgt = hov ? .05 : 1 + Math.min(6, Math.abs(vel) * .3); rate += (tgt - rate) * .08; an.forEach(function (a) { a.playbackRate = rate; }); }
      requestAnimationFrame(loop);
    })();
  }
  function start() {
    build(); banner();
    [].forEach.call(document.querySelectorAll("#cf button"), function (b) {
      b.onclick = function () {
        camp = b.dataset.c;
        [].forEach.call(document.querySelectorAll("#cf button"), function (x) { x.setAttribute("aria-pressed", x === b); });
        filter();
      };
    });
    $("#cws").addEventListener("input", function (e) { q = C.norm(e.target.value); filter(); });
    filter(); leaderboard(); started = true;
  }
  var go1 = false;
  function go() { if (go1) return; go1 = true; start(); }
  if (C.hasEndpoint()) {
    C.loadCounts().then(function (ok) { if (!go1) go(); else if (ok) refresh(); });
    setTimeout(go, 1500);
  } else go();
})();
