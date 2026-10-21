/* Home page events slideshow. Edit EVENTS to change what shows. Links go to the events page. */
(function () {
  var host = document.getElementById("es"); if (!host) return;
  var rm = matchMedia("(prefers-reduced-motion: reduce)").matches, DUR = 5500;
  var days = Math.ceil((new Date("2026-10-30T13:00:00+05:30") - Date.now()) / 864e5);
  var tot = days > 1 ? days + " days to go" : days === 1 ? "Tomorrow" : days === 0 ? "Today" : "Invites by approval";
  var burst = ""; for (var i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2, l = i % 2 ? 34 : 46; burst += '<line x1="' + (60 + 22 * Math.cos(a)).toFixed(1) + '" y1="' + (60 + 22 * Math.sin(a)).toFixed(1) + '" x2="' + (60 + l * Math.cos(a)).toFixed(1) + '" y2="' + (60 + l * Math.sin(a)).toFixed(1) + '" stroke="#FF5C93" stroke-width="3" stroke-linecap="round" opacity="' + (i % 2 ? .5 : .95) + '"/>'; }
  var EVENTS = [
    { c: "h", chip: "Live now", t: "Trick or Treat", p: "Halloween House. Request your invite, get approved, and walk in if you dare.", b: "30 October, 1 PM to 10 PM", s: tot, art: '<svg class="es-gl" viewBox="0 0 120 120"><path d="M78 12a50 50 0 1 0 30 76A42 42 0 0 1 78 12z" fill="#FF6A2A" opacity=".92"/></svg>' },
    { c: "f", chip: "Live now", t: "Freshers at Kirori Mal College", p: "The welcome party for the new batch at KMC. Everything you need is on the Umang page.", b: "Open to KMC freshers", s: "Details on the Umang page", art: '<svg class="es-sp" viewBox="0 0 120 120">' + burst + '</svg>' },
    { c: "v", chip: "Coming up", t: "Versus", p: "1v1 Football Tournament. A format built for one-on-one showdowns. Bring your best footwork.", b: "1v1 Football Tournament", s: "Unique format event", art: '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="#5EE0A0" stroke-width="1.5" opacity=".35"/><text x="60" y="78" text-anchor="middle" font-family="Inter Tight,sans-serif" font-weight="700" font-size="52" fill="#5EE0A0" opacity=".9">VS</text></svg>' },
    { c: "g", chip: "Coming up", t: "Diwali Party", p: "Lights, music and everyone from DU in one place. The festival night, Unrest style.", b: "Diwali Party", s: "Details soon", art: '<svg class="es-gl" viewBox="0 0 120 120"><path d="M60 14c10 16 18 24 8 40-3 5-8 5-8 5s-12-6-6-22c3-8 6-12 6-23z" fill="#FFC94A"/><path d="M14 66h92c0 20-20 36-46 36S14 86 14 66z" fill="#FF6A2A" opacity=".9"/></svg>' }
  ];
  var arr = '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  host.setAttribute("role", "region"); host.setAttribute("aria-roledescription", "carousel"); host.setAttribute("aria-label", "Upcoming events");
  host.innerHTML = '<div class="es-t" id="est" tabindex="0">' + EVENTS.map(function (e, i) {
    return '<article class="es-s ' + e.c + (i ? "" : " on") + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + EVENTS.length + '"><a class="es-a" href="events/"><div class="es-art" aria-hidden="true">' + e.art + '</div><span class="es-chip">' + e.chip + '</span><div><h3>' + e.t + '</h3><p>' + e.p + '</p><div class="es-f"><div><b>' + e.b + '</b><span>' + e.s + '</span></div><span class="es-go" aria-hidden="true">' + arr + '</span></div></div></a></article>';
  }).join("") + '</div><div class="es-c"><div class="es-dots' + (rm ? " still" : "") + '" id="esd">' + EVENTS.map(function (e, i) { return '<button type="button" aria-label="Show ' + e.t + '"' + (i ? "" : ' aria-current="true"') + '><b><i></i></b></button>'; }).join("") + '</div><div class="es-nav"><button type="button" id="esp" aria-label="Previous event">' + arr.replace("<svg ", '<svg style="transform:scaleX(-1)" ') + '</button><button type="button" id="esn" aria-label="Next event">' + arr + '</button></div></div>';
  var t = document.getElementById("est"), dots = document.getElementById("esd"), S = [].slice.call(t.children), D = [].slice.call(dots.children), cur = 0, hold = 0, onscreen = false;
  dots.style.setProperty("--dur", DUR + "ms");
  function pad() { return parseFloat(getComputedStyle(t).paddingLeft) || 0; }
  function go(i) { i = (i + S.length) % S.length; t.scrollTo({ left: S[i].offsetLeft - pad(), behavior: rm ? "auto" : "smooth" }); }
  function mark(i) {
    if (i === cur) return; cur = i;
    S.forEach(function (s, k) { s.classList.toggle("on", k === i); });
    D.forEach(function (d, k) { if (k === i) { d.setAttribute("aria-current", "true"); var bar = d.querySelector("i"); bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; } else d.removeAttribute("aria-current"); });
  }
  var ticking = false;
  t.addEventListener("scroll", function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false; var r = t.getBoundingClientRect(), best = 0, bv = -1;
      S.forEach(function (s, k) { var q = s.getBoundingClientRect(), v = Math.max(0, Math.min(q.right, r.right) - Math.max(q.left, r.left)); if (v > bv) { bv = v; best = k; } });
      mark(best);
    });
  }, { passive: true });
  /* autoplay is driven by the progress bar finishing; pausing = pausing the bar */
  function pause(on) { dots.classList.toggle("paused", on || !onscreen); }
  dots.addEventListener("animationend", function (e) { if (e.animationName === "esb" && !rm) go(cur + 1); });
  host.addEventListener("pointerenter", function () { pause(true); });
  host.addEventListener("pointerleave", function () { pause(false); });
  host.addEventListener("focusin", function () { pause(true); });
  host.addEventListener("focusout", function () { pause(false); });
  t.addEventListener("touchstart", function () { pause(true); clearTimeout(hold); }, { passive: true });
  t.addEventListener("touchend", function () { hold = setTimeout(function () { pause(false); }, 6000); }, { passive: true });
  document.addEventListener("visibilitychange", function () { pause(document.hidden); });
  new IntersectionObserver(function (es) { onscreen = es[0].isIntersecting; pause(false); }, { threshold: .35 }).observe(host);
  pause(true);
  document.getElementById("esn").onclick = function () { go(cur + 1); };
  document.getElementById("esp").onclick = function () { go(cur - 1); };
  D.forEach(function (d, k) { d.onclick = function () { go(k); }; });
  t.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); } else if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); } });
  S.forEach(function (s) { var a = s.firstChild; a.addEventListener("pointermove", function (e) { var r = a.getBoundingClientRect(); a.style.setProperty("--mx", (e.clientX - r.left) + "px"); a.style.setProperty("--my", (e.clientY - r.top) + "px"); }); });
})();
