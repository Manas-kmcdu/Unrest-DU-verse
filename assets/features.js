/* Feature tiles drive the phone mockup: hover or focus a tile to show its screen, otherwise it cycles. */
(function () {
  var F = [
    { n: "PYQs", d: "Past papers for your course, sorted by semester.", h: "studyroom/#/pyqs", c: "--t2",
      r: [["Microeconomics I", "B.A. (Hons.) Economics · Sem 1"], ["Financial Accounting", "B.Com (Hons.) · Sem 1"], ["Linear Algebra", "B.Sc. (Hons.) Maths · Sem 2"]] },
    { n: "Flatmates", d: "Find a room or a roommate near campus.", h: "#get", c: "--t0",
      r: [["Room in Kamla Nagar", "2 BHK · looking for one more"], ["Flatmate wanted", "Satya Niketan · near South Campus"], ["PG near Hudson Lane", "Single room"]] },
    { n: "Hangouts", d: "Find people for plans this week.", h: "#get", c: "--t1",
      r: [["Chai after class", "Today, 5 PM · 6 going"], ["Sunday cricket", "North Campus · 4 spots left"], ["Movie night", "Friday · open to all"]] },
    { n: "Friends", d: "Meet verified students from every college.", h: "#get", c: "--t3",
      r: [["Aanya", "Hindu College · Economics"], ["Kabir", "Kirori Mal College · B.Com"], ["Ishita", "LSR · Psychology"]] },
    { n: "Events", d: "Fests, parties and Unrest events.", h: "events/", c: "--t4",
      r: [["Trick or Treat", "30 October · Halloween House"], ["Versus", "1v1 Football Tournament"], ["Diwali Party", "Details soon"]] },
    { n: "Merchandise", d: "Metro card skins, journals and limited drops.", h: "#store", c: "--t2",
      r: [["Metro Card Skins", "Cover your card with your campus"], ["Journals", "For notes, plans and bad ideas"], ["Limited drops", "Small runs"]] },
    { n: "Updates", d: "What's happening across DU, as it happens.", h: "#get", c: "--t1",
      r: [["Fest season", "Registrations opening across colleges"], ["End-sems", "Datesheets and PYQs in StudyRoom"], ["New on Unrest", "POV is live"]] }
  ];
  var ul = document.getElementById("ft"), scr = document.getElementById("fscr");
  if (!ul || !scr) return;

  ul.innerHTML = F.map(function (f, i) {
    return '<li' + (i === 0 ? ' class="w2"' : '') + '><a class="tile ftile" href="' + f.h + '" data-i="' + i + '" style="--tc:var(' + f.c + ')"><span class="ab">' + f.n + '</span><span class="fd">' + f.d + '</span></a></li>';
  }).join("");
  scr.innerHTML = F.map(function (f) {
    return '<div><p class="fs-top"><span>unrest</span><b>' + f.n + '</b></p>' + f.r.map(function (r) {
      return '<p class="fs-row" style="--tc:var(' + f.c + ')"><b>' + r[0] + '</b><small>' + r[1] + '</small></p>';
    }).join("") + '</div>';
  }).join("");

  var screens = scr.children, tiles = ul.querySelectorAll(".ftile"), cur = -1, hold = false;
  function show(i) {
    if (i === cur) return;
    cur = i;
    for (var k = 0; k < screens.length; k++) {
      screens[k].classList.toggle("on", k === i);
      tiles[k].classList.toggle("on", k === i);
    }
  }
  show(0);
  Array.prototype.forEach.call(tiles, function (t) {
    var i = +t.getAttribute("data-i");
    function on() { hold = true; show(i); }
    function off() { hold = false; }
    t.addEventListener("mouseenter", on); t.addEventListener("focus", on);
    t.addEventListener("mouseleave", off); t.addEventListener("blur", off);
  });
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(function () { if (!hold && !document.hidden) show((cur + 1) % F.length); }, 3200);
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
