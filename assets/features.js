/* Feature tiles: all seven stay visible. The phone only cycles the three real app screenshots. */
(function () {
  var F = [
    { n: "PYQs", d: "Past papers for your course, sorted by semester.", h: "studyroom/#/pyqs", c: "--t2" },
    { n: "Flatmates", d: "Find a room or a roommate near campus.", h: "#get", c: "--t0", s: "assets/app/roommate.webp" },
    { n: "Hangouts", d: "Travel buddies, sports and plans on campus.", h: "#get", c: "--t1", s: "assets/app/hangout.webp" },
    { n: "Friends", d: "Meet verified students from every college.", h: "#get", c: "--t3" },
    { n: "Events", d: "Fests, parties and Unrest events.", h: "events/", c: "--t4" },
    { n: "Merchandise", d: "Metro card skins, journals and limited drops.", h: "#store", c: "--t2" },
    { n: "Updates", d: "A feed for DU, your college and your course.", h: "#get", c: "--t1", s: "assets/app/kmc-feed.webp" }
  ];
  var shots = F.map(function (f, i) { return f.s ? i : -1; }).filter(function (i) { return i >= 0; });
  var ul = document.getElementById("ft"), scr = document.getElementById("fscr"), cap = document.getElementById("fcap");
  if (!ul || !scr) return;

  ul.innerHTML = F.map(function (f, i) {
    return '<li' + (i === 0 ? ' class="w2"' : '') + '><a class="tile ftile" href="' + f.h + '" data-i="' + i + '" style="--tc:var(' + f.c + ')"><span class="ab">' + f.n + '</span><span class="fd">' + f.d + '</span></a></li>';
  }).join("");
  scr.innerHTML = shots.map(function (i) {
    return '<div class="shot" data-i="' + i + '"><img src="' + F[i].s + '" alt="" loading="lazy" decoding="async"></div>';
  }).join("");

  var screens = scr.children, tiles = ul.querySelectorAll(".ftile"), cur = -1, hold = false, cycle = 0;
  function show(i) {
    var si = shots.indexOf(i);
    if (si < 0) si = cycle;
    else cycle = si;
    if (i === cur && screens[si] && screens[si].classList.contains("on")) return;
    cur = i;
    for (var k = 0; k < screens.length; k++) screens[k].classList.toggle("on", k === si);
    for (k = 0; k < tiles.length; k++) tiles[k].classList.toggle("on", k === i);
    if (cap) cap.textContent = "From the app.";
  }
  show(shots[0]);
  Array.prototype.forEach.call(tiles, function (t) {
    var i = +t.getAttribute("data-i");
    function on() { hold = true; show(i); }
    function off() { hold = false; }
    t.addEventListener("mouseenter", on); t.addEventListener("focus", on);
    t.addEventListener("mouseleave", off); t.addEventListener("blur", off);
  });
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(function () {
      if (hold || document.hidden) return;
      cycle = (cycle + 1) % shots.length;
      show(shots[cycle]);
    }, 3200);
  }
})();

/* Background music, same track and behaviour as POV: starts on the first interaction, remembers mute. */
(function () {
  var btn = document.getElementById("un-music");
  if (!btn) return;
  var KEY = "unrest-muted", a = new Audio("assets/music.mp3"), muted = false, playing = false;
  a.loop = true; a.volume = .4; a.preload = "auto";
  try { muted = localStorage.getItem(KEY) === "1"; } catch (e) {}
  var evs = ["pointerup", "touchend", "click", "keydown"];
  function ui() { btn.setAttribute("aria-pressed", muted ? "true" : "false"); btn.setAttribute("aria-label", muted ? "Unmute music" : "Mute music"); }
  function save() { try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch (e) {} }
  function off() { evs.forEach(function (n) { document.removeEventListener(n, onGesture, true); }); }
  function start() {
    if (muted || playing) return;
    var p = a.play();
    if (p && p.then) p.then(function () { playing = true; off(); }, function () {});
    else { playing = true; off(); }
  }
  function onGesture(e) { if (!btn.contains(e.target)) start(); }
  evs.forEach(function (n) { document.addEventListener(n, onGesture, true); });
  btn.addEventListener("click", function () {
    muted = !muted; save(); ui();
    if (muted) { a.pause(); playing = false; }
    else { start(); evs.forEach(function (n) { document.addEventListener(n, onGesture, true); }); }
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { if (playing) a.pause(); }
    else if (playing && !muted) a.play().catch(function () {});
  });
  ui();
})();
