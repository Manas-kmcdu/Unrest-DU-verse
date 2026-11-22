/* Live join feed. The page listens here; anything that learns about a new signup calls UnrestLive.join(collegeSlug).
   Production: call it from your Firebase listener (e.g. onSnapshot on new approved users).
   Demo: set LIVE_DEMO:true in config.js to simulate joins so you can see the wall react. Keep it false on the live site. */
(function () {
  var C = window.UnrestColleges, cbs = [];
  var L = window.UnrestLive = {
    on: function (f) { cbs.push(f); },
    join: function (slug, n) {
      if (!C || !C.find(slug)) return; n = n || 1;
      var o = {}; o[slug] = C.getCount(slug) + n; C.setCounts(o);
      var ev = { slug: slug, n: n, t: Date.now() }; cbs.forEach(function (f) { try { f(ev); } catch (e) {} });
    }
  };
  if (!(window.UNREST_CONFIG || {}).LIVE_DEMO || !C) return;
  function tick() {
    var l = C.list(); if (!l.length) return;
    var w = l.map(function (c) { return Math.sqrt(C.getCount(c) + 4); }), sum = w.reduce(function (a, b) { return a + b; }, 0), r = Math.random() * sum, i = 0;
    while (i < l.length - 1 && (r -= w[i]) > 0) i++;
    L.join(l[i].slug, Math.random() < .25 ? 2 : 1);
    setTimeout(tick, 4500 + Math.random() * 6500);
  }
  setTimeout(tick, 3500);
})();
