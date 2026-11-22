/* Home: six live tiles in the hero (3x2). One tile at a time swaps to another college; a real join pulls that college onto a tile.
   Plus ticker, banner and top-5 leaderboard. Data/counts/ranking: assets/college-core.js. Live joins: UnrestLive (assets/live.js). */
(function () {
  var C = window.UnrestColleges, wall = document.getElementById("cw");
  if (!C || !wall) return;
  var $ = function (s) { return document.querySelector(s); }, L = window.UnrestLive;
  var rm = matchMedia("(prefers-reduced-motion: reduce)").matches, BASE = "colleges/", N = 6, EVERY = rm ? 6000 : 1700;
  var ORDER = [0, 4, 2, 5, 1, 3], slots = [], pool = [], ptr = 0, turn = 0, held = -1, recent = [], hold = 0, tmsg = null, tidx = 0, started = false;
  var colour = function (c) { return C.list().indexOf(c) % 5; };
  var short = function (slug) { var c = C.find(slug); return c ? c.shortName : slug; };

  function nbrs(s) { var r = Math.floor(s / 3), k = s % 3, o = []; if (k > 0) o.push(s - 1); if (k < 2) o.push(s + 1); if (r > 0) o.push(s - 3); if (r < 1) o.push(s + 3); return o; }
  function fit(el) {
    var w = el.parentNode.clientWidth - 26; if (w <= 0) return;
    var longest = Math.max.apply(null, el.textContent.split(/\s+/).map(function (x) { return x.length; }));
    el.style.setProperty("--fs", Math.max(10, Math.min(26, w / (longest * .76))) + "px");
  }
  function fill(s, c) {
    var li = slots[s], a = li.firstChild, ab = a.querySelector(".ab"), b = a.querySelector("b");
    li.c = c; li.dataset.slug = c.slug; a.href = C.pageHref(c.slug, BASE); a.style.setProperty("--tc", "var(--t" + colour(c) + ")");
    ab.textContent = c.shortName.toUpperCase(); b.dataset.n = C.getCount(c); b.textContent = b.dataset.n; a.querySelector(".nm").textContent = c.name; fit(ab);
  }
  function swap(s, c) {
    var li = slots[s]; if (rm) return fill(s, c);
    var inner = li.firstChild.querySelector(".tc"); inner.classList.add("out");
    setTimeout(function () { fill(s, c); inner.classList.remove("out"); inner.classList.add("in"); void inner.offsetWidth; inner.classList.remove("in"); }, 230);
  }
  var shown = function (c) { return slots.some(function (l) { return l.c === c; }); };
  function okColour(s, c) { var k = colour(c); return nbrs(s).every(function (n) { return !slots[n].c || colour(slots[n].c) !== k; }); }
  function pick(s) {
    for (var t = 0; t < pool.length; t++) { var c = pool[ptr++ % pool.length]; if (!shown(c) && okColour(s, c)) return c; }
    for (t = 0; t < pool.length; t++) { c = pool[ptr++ % pool.length]; if (!shown(c)) return c; }
    return null;
  }
  function nextSlot() { for (var t = 0; t < N; t++) { var s = ORDER[turn++ % N]; if (s !== held) return s; } return ORDER[0]; }
  function rotate() { if (document.hidden) return; var s = nextSlot(), c = pick(s); if (c) swap(s, c); }

  function build() {
    pool = C.list().slice().sort(function (a, b) { return C.getCount(b) - C.getCount(a); });
    wall.innerHTML = ORDER.map(function (_, i) {
      return '<li data-slot="' + i + '" style="--k:' + i + '"><a class="tile" href="#"><span class="tc"><span class="ab"></span><span class="tn"><b data-n="0">0</b> students</span></span><span class="nm"></span></a></li>';
    }).join("");
    slots = [].slice.call(wall.children);
    for (var s = 0; s < N; s++) { var c = pick(s); fill(s, c); }
    slots.forEach(function (li, i) {
      var a = li.firstChild;
      a.addEventListener("pointermove", function (e) { var r = a.getBoundingClientRect(); a.style.setProperty("--mx", (e.clientX - r.left) + "px"); a.style.setProperty("--my", (e.clientY - r.top) + "px"); });
      li.addEventListener("pointerenter", function () { held = i; }); li.addEventListener("pointerleave", function () { held = -1; });
      li.addEventListener("focusin", function () { held = i; }); li.addEventListener("focusout", function () { held = -1; });
    });
    setInterval(rotate, EVERY);
  }
  if (window.ResizeObserver) new ResizeObserver(function () { [].forEach.call(wall.querySelectorAll(".ab"), fit); }).observe(wall);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { [].forEach.call(wall.querySelectorAll(".ab"), fit); });

  /* a real join: show that college on a tile (swapping one in if needed), pulse it, count it up, update ticker + leaderboard */
  function pulse(s, n) {
    var a = slots[s].firstChild, b = a.querySelector("b"), from = +b.dataset.n, to = C.getCount(slots[s].c); b.dataset.n = to;
    if (rm) { b.textContent = to; return; }
    a.classList.remove("bump"); void a.offsetWidth; a.classList.add("bump");
    var p = document.createElement("span"); p.className = "plus"; p.textContent = "+" + n; a.appendChild(p); setTimeout(function () { p.remove(); }, 1500);
    var t0 = performance.now(); (function f(t) { var q = Math.min(1, (t - t0) / 500); b.textContent = Math.round(from + (to - from) * q); if (q < 1) requestAnimationFrame(f); })(t0);
  }
  function bump(ev) {
    recent.push(ev); var c = C.find(ev.slug), s = slots.findIndex(function (l) { return l.c === c; });
    if (s > -1) pulse(s, ev.n); else if (c) { s = nextSlot(); swap(s, c); setTimeout(function () { pulse(s, ev.n); }, rm ? 0 : 500); }
    leaderboard(); say(live(), true);
  }
  function live() {
    var now = Date.now(), by = {}, last = {}; recent = recent.filter(function (e) { return now - e.t < 10 * 60000; });
    recent.forEach(function (e) { by[e.slug] = (by[e.slug] || 0) + e.n; last[e.slug] = e.t; });
    var best = null; for (var s in by) if (!best || last[s] > last[best]) best = s;
    if (!best) return null;
    var m = Math.floor((now - last[best]) / 60000), n = by[best];
    return n + (n === 1 ? " student" : " students") + " from " + short(best) + " joined Unrest " + (m < 1 ? "just now" : m + " min ago");
  }
  function base() {
    var r = C.list().slice().sort(function (a, b) { return C.getCount(b) - C.getCount(a); }), tot = r.reduce(function (s, c) { return s + C.getCount(c); }, 0);
    return [r[0].shortName + " leads with " + C.getCount(r[0]) + " students on Unrest", tot + " students across " + r.length + " colleges", "Find your college. Join the wall."];
  }
  function say(t, force) {
    var el = $("#livet"); if (!el || !t || t === tmsg) return; if (force) hold = Date.now() + 6000;
    tmsg = t; if (rm) { el.textContent = t; return; }
    el.classList.add("sw"); setTimeout(function () { el.textContent = t; el.classList.remove("sw"); }, 220);
  }
  setInterval(function () { if (Date.now() < hold) return; var l = live(); if (l) say(l); else { var b = base(); say(b[tidx++ % b.length]); } }, 5500);
  function leaderboard() { C.renderLeaderboard($("#lbh"), { n: 5, base: BASE, highlight: C.getMine() }); }

  /* banner: two rows moving opposite ways; speeds up with scroll, pauses on hover; names link to the college pages */
  function banner() {
    var host = $("#cbn"); if (!host) return; var Ls = C.list();
    var r1 = Ls.map(function (c) { return '<a class="cbi" href="' + C.esc(C.pageHref(c.slug, BASE)) + '" tabindex="-1" style="--c:' + C.esc(c.accentColour) + '">' + C.esc(c.shortName) + '</a><span class="cbs" aria-hidden="true">&#10022;</span>'; }).join("");
    var r2 = Ls.slice().reverse().map(function (c) { return '<a class="cbp" href="' + C.esc(C.pageHref(c.slug, BASE)) + '" tabindex="-1" style="--c:' + C.esc(c.accentColour) + '"><i></i>' + C.esc(c.name) + '<small>' + c.campus + '</small></a>'; }).join("");
    host.innerHTML = '<div class="cbr"><div class="cbt">' + r1 + r1 + '</div></div><div class="cbr b"><div class="cbt">' + r2 + r2 + '</div></div>';
    host.setAttribute("aria-hidden", "true");
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
  function start() { if (started) return; started = true; build(); banner(); leaderboard(); say(base()[0]); if (L) L.on(bump); }
  if (C.hasEndpoint()) {
    C.loadCounts().then(function (ok) { if (!started) start(); else if (ok) { slots.forEach(function (l, i) { fill(i, l.c); }); leaderboard(); } });
    setTimeout(start, 1500);
  } else start();
})();
