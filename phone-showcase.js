/**
 * Scroll-driven phone preview (Fizz-style):
 * scrolling the page scrolls the feed inside a sticky phone — not an auto-marquee.
 */
(function () {
  const COLLEGES = [
    "SRCC", "Hindu", "Miranda", "LSR", "St. Stephen's", "Hansraj", "Kirori Mal",
    "Ramjas", "Lady Shri Ram", "Gargi", "IP College", "Sri Venkateswara",
    "DU North", "DU South", "Cluster Innovation",
  ];

  const RIBBON = [
    "DU FEED", { pill: "ACTIVITIES", class: "ps-pill--accent" },
    "CORRIDOR", { pill: "SPORTS", class: "ps-pill--green" },
    "EXPLORE", { pill: "ECHO WALL", class: "ps-pill--blue" },
    "DU FEED", { pill: "ACTIVITIES", class: "ps-pill--accent" },
  ];

  const FEED_HTML = `
    <div class="post">
      <div class="post-head">
        <div class="avatar" style="background:#9e4538">RK</div>
        <div class="post-meta">
          <div class="post-name">Riya Kapoor</div>
          <div class="post-college">SRCC · 2nd year</div>
        </div>
        <div class="post-badge" style="background:#f0e8e6;color:#9e4538">SRCC</div>
      </div>
      <div class="post-img" style="background:#f0e8e6;font-family:var(--serif);font-size:0.8rem;color:#9e4538;padding:8px;text-align:center;flex-direction:column;display:flex;justify-content:center;">
        <div style="font-size:1.6rem;margin-bottom:4px">🎓</div>
        <div>Economics fest '25 — registrations open</div>
      </div>
      <div class="post-body">EconFest this Friday at SRCC auditorium. Case comps, guest lectures, networking. Free for DU students.</div>
      <div class="post-actions"><span class="post-act">W 142</span><span class="post-act">L 12</span><span class="post-act">💬 28</span></div>
    </div>
    <div class="ps-feed-take"><span>🔥</span><strong>Hot take: 8am lectures should be illegal</strong></div>
    <div class="ps-feed-activity ps-feed-activity--dark">
      <div class="ps-feed-activity-title">Pickleball</div>
      <div class="ps-feed-activity-meta">Today · 6:30pm · North Campus courts · 4 spots</div>
    </div>
    <div class="post">
      <div class="post-head">
        <div class="avatar" style="background:#1e4f8c">AS</div>
        <div class="post-meta">
          <div class="post-name">Aryan Singh</div>
          <div class="post-college">Hindu · 3rd year</div>
        </div>
      </div>
      <div class="post-body">Anyone selling Macro notes from last sem? DM 🙏</div>
      <div class="post-actions"><span class="post-act">W 34</span><span class="post-act">💬 12</span></div>
    </div>
    <div class="ps-feed-banner">
      <div class="ps-feed-banner-tag">Hot take</div>
      <div class="ps-feed-banner-title">North Campus canteen prices went up again</div>
    </div>
    <div class="ps-feed-activity ps-feed-activity--lime">
      <div class="ps-feed-activity-title">Chai & assignment circle</div>
      <div class="ps-feed-activity-meta">Tonight · 9pm · Library lawn</div>
    </div>
    <div class="sport-card orange">
      <div class="sc-top">
        <div class="sc-icon">⚽</div>
        <div class="sc-title">Turf Sunday — 5-a-side</div>
        <div class="sc-badge">Today</div>
      </div>
      <div class="sc-body">JNU Ground · 7am · 12 spots left</div>
      <div class="sc-footer">
        <div class="sc-meta">📍 JNU North Gate</div>
        <div class="sc-join">Join →</div>
      </div>
    </div>
    <div class="post">
      <div class="post-head">
        <div class="avatar" style="background:#7b1fa2">NM</div>
        <div class="post-meta">
          <div class="post-name">Neha Mehta</div>
          <div class="post-college">Miranda · 1st year</div>
        </div>
      </div>
      <div class="post-body">Fest season is back — who's tracking every college society IG story?</div>
      <div class="post-actions"><span class="post-act">W 89</span><span class="post-act">💬 19</span></div>
    </div>
    <div class="ps-feed-activity ps-feed-activity--green">
      <div class="ps-feed-activity-title" style="color:#0e0d0b">Turf football</div>
      <div class="ps-feed-activity-meta" style="color:rgba(14,13,11,0.65)">Sun 8pm · GTB Nagar · 3 spots</div>
    </div>
    <div class="sport-card green">
      <div class="sc-top">
        <div class="sc-icon">🏃</div>
        <div class="sc-title">Morning run club</div>
        <div class="sc-badge">Sat</div>
      </div>
      <div class="sc-body">Lodhi loop · All paces · Post-run chai</div>
      <div class="sc-footer">
        <div class="sc-meta">34 runners</div>
        <div class="sc-join">Join →</div>
      </div>
    </div>
    <div class="ps-feed-banner" style="background:linear-gradient(135deg,#2a1a12,#4a2820)">
      <div class="ps-feed-banner-tag">Stress-o-meter</div>
      <div class="ps-feed-banner-title">Campus average: 7.2 this week</div>
    </div>
    <div style="background:#fff;border:0.5px solid var(--border);border-radius:12px;padding:10px;flex-shrink:0">
      <div style="font-size:0.65rem;font-weight:700;color:var(--ink)">Corridor · Off your chest</div>
      <div style="font-size:0.58rem;color:var(--ink3);margin-top:4px">286 inside · anonymous</div>
    </div>
    <div class="sport-card blue">
      <div class="sc-top">
        <div class="sc-icon">🏸</div>
        <div class="sc-title">Badminton doubles</div>
        <div class="sc-badge">Sun</div>
      </div>
      <div class="sc-body">Hindu sports complex · 8 pairs in</div>
      <div class="sc-footer">
        <div class="sc-meta">🏸 Open</div>
        <div class="sc-join">Join →</div>
      </div>
    </div>
    <div class="post">
      <div class="post-body" style="padding-top:10px">Roommate in Vijay Nagar · ₹12k · veg only — DM if interested</div>
      <div class="post-actions"><span class="post-act">W 21</span><span class="post-act">💬 8</span></div>
    </div>
  `;

  function ribbonMarkup() {
    return RIBBON.map((item) => {
      if (typeof item === "string") return `<span>${item}</span>`;
      return `<span class="ps-pill ${item.class}">${item.pill}</span>`;
    }).join("");
  }

  function collegesMarkup() {
    const items = [...COLLEGES, ...COLLEGES];
    return items.map((c) => `<span>${c}</span>`).join("");
  }

  function buildSection() {
    const root = document.getElementById("app-preview");
    if (!root) return null;

    root.innerHTML = `
      <div class="phone-showcase-head">
        <div class="section-label">The app</div>
        <h2>See what DU is <em>actually posting</em></h2>
        <p>Keep scrolling — the feed inside the phone moves with you, just like browsing Unrest on campus.</p>
      </div>
      <div class="phone-showcase-scroll-zone" id="phone-showcase-scroll-zone">
        <div class="phone-showcase-pin">
          <div class="phone-showcase-ribbon" id="phone-showcase-ribbon" aria-hidden="true">
            ${ribbonMarkup()}
          </div>
          <div class="phone-showcase-stage">
            <div class="phone-frame phone-showcase-device">
              <div class="phone-screen">
                <div class="phone-status"><span>9:41</span><span>●●● 100%</span></div>
                <div class="phone-nav">
                  <div class="phone-nav-logo">Un<span>rest</span></div>
                </div>
                <div class="phone-tabs">
                  <div class="phone-tab active">DU</div>
                  <div class="phone-tab">College</div>
                  <div class="phone-tab">Explore</div>
                </div>
                <div class="feed is-scroll-driven" id="phone-showcase-feed">${FEED_HTML}</div>
              </div>
            </div>
          </div>
          <p class="phone-showcase-hint">Scroll the page to explore</p>
          <div class="phone-showcase-colleges">
            <div class="phone-showcase-colleges-track" id="phone-showcase-colleges">${collegesMarkup()}</div>
          </div>
        </div>
      </div>`;

    return {
      zone: document.getElementById("phone-showcase-scroll-zone"),
      feed: document.getElementById("phone-showcase-feed"),
      ribbon: document.getElementById("phone-showcase-ribbon"),
      colleges: document.getElementById("phone-showcase-colleges"),
    };
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function setScrollZoneHeight(zone, feed) {
    if (!zone || !feed) return;
    const innerScroll = Math.max(0, feed.scrollHeight - feed.clientHeight);
    const travel = innerScroll + window.innerHeight * 0.55;
    zone.style.minHeight = `${Math.max(travel + window.innerHeight * 0.35, window.innerHeight * 1.85)}px`;
  }

  function progressForZone(zone) {
    const rect = zone.getBoundingClientRect();
    const total = zone.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-rect.top / total, 0, 1);
  }

  function updateScroll() {
    const els = window.__phoneShowcaseEls;
    if (!els || prefersReducedMotion()) return;

    const { zone, feed, ribbon, colleges } = els;
    const p = progressForZone(zone);
    const maxScroll = Math.max(0, feed.scrollHeight - feed.clientHeight);
    feed.scrollTop = p * maxScroll;

    if (ribbon) {
      const shift = p * 28;
      ribbon.style.transform = `translateY(-50%) translateX(${-shift}%)`;
    }
    if (colleges) {
      const maxShift = Math.max(0, colleges.scrollWidth / 2 - (colleges.parentElement?.clientWidth || 0) / 2);
      colleges.style.transform = `translateX(${-p * maxShift}px)`;
    }
  }

  function init() {
    const els = buildSection();
    if (!els) return;
    window.__phoneShowcaseEls = els;

    const resize = () => {
      setScrollZoneHeight(els.zone, els.feed);
      updateScroll();
    };

    if (!prefersReducedMotion()) {
      els.feed.classList.add("is-scroll-driven");
      window.addEventListener("scroll", updateScroll, { passive: true });
      window.addEventListener("resize", resize);
      if (document.fonts?.ready) document.fonts.ready.then(resize);
      else requestAnimationFrame(resize);
      resize();
    } else {
      els.feed.classList.remove("is-scroll-driven");
      setScrollZoneHeight(els.zone, els.feed);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
