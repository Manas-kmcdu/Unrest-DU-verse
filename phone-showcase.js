/**
 * Scroll-driven phone preview:
 * Phase 1 — page scroll slides phone left into view.
 * Phase 2 — page scroll drives feed inside the phone.
 */
(function () {
  const INTRO_VH = 0.92;
  const FEED_EXTRA_VH = 0.42;

  const FALLBACK_COLLEGES = [
    "Shri Ram College of Commerce", "Hindu College", "Miranda House", "Lady Shri Ram College",
    "St. Stephen's College", "Hansraj College", "Kirori Mal College", "Ramjas College",
  ];

  const COLLEGE_NAMES = (
    window.DU_COLLEGE_NAMES && window.DU_COLLEGE_NAMES.length
      ? window.DU_COLLEGE_NAMES
      : FALLBACK_COLLEGES
  );

  const TICKER_ROW_COUNT = 6;

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
      <div class="post-img" style="background:#f0e8e6;font-family:var(--serif);font-size:0.75rem;color:#9e4538;padding:8px;text-align:center;flex-direction:column;display:flex;justify-content:center;">
        <div style="font-size:1.4rem;margin-bottom:4px">🎓</div>
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
    <div style="background:#fff;border:0.5px solid var(--border);border-radius:10px;padding:9px;flex-shrink:0">
      <div style="font-size:0.62rem;font-weight:700;color:var(--ink)">Corridor · Off your chest</div>
      <div style="font-size:0.55rem;color:var(--ink3);margin-top:3px">286 inside · anonymous</div>
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
      <div class="post-body" style="padding-top:9px">Roommate in Vijay Nagar · ₹12k · veg only — DM if interested</div>
      <div class="post-actions"><span class="post-act">W 21</span><span class="post-act">💬 8</span></div>
    </div>
  `;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function tickerTrackMarkup(names, offset) {
    const n = names.length;
    return names
      .map((name, i) => {
        const hi = (i + offset) % 5 === 0 ? " hi" : "";
        return `<span class="ps-ticker-item${hi}">${name}</span><span class="ps-ticker-dot"></span>`;
      })
      .join("");
  }

  function collegeWallMarkup() {
    const rows = [];
    for (let r = 0; r < TICKER_ROW_COUNT; r++) {
      const rotated = COLLEGE_NAMES.slice(r % COLLEGE_NAMES.length).concat(
        COLLEGE_NAMES.slice(0, r % COLLEGE_NAMES.length)
      );
      const track = tickerTrackMarkup(rotated, r * 3);
      const rev = r % 2 === 1 ? " ps-ticker-row--rev" : "";
      const speed =
        r % 3 === 0 ? " ps-ticker-row--fast" : r % 3 === 1 ? " ps-ticker-row--slow" : "";
      rows.push(`
        <div class="ps-ticker-row${rev}${speed}">
          <div class="ps-ticker-track">${track}</div>
          <div class="ps-ticker-track ps-ticker-row--dup" aria-hidden="true">${track}</div>
        </div>`);
    }
    return `<div class="phone-showcase-college-wall" aria-hidden="true">${rows.join("")}</div>`;
  }

  function buildSection() {
    const root = document.getElementById("app-preview");
    if (!root) return null;

    root.innerHTML = `
      <div class="phone-showcase-head">
        <div class="section-label">The app</div>
        <h2>See what DU is <em>actually posting</em></h2>
        <p>Scroll once to bring the app into view — then keep scrolling to browse the feed inside.</p>
      </div>
      <div class="phone-showcase-scroll-zone" id="phone-showcase-scroll-zone">
        ${collegeWallMarkup()}
        <div class="phone-showcase-pin">
          <div class="phone-showcase-stage">
            <div class="phone-frame phone-showcase-device" id="phone-showcase-device">
              <div class="phone-screen">
                <div class="phone-status"><span>9:41</span></div>
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
          <p class="phone-showcase-hint" id="phone-showcase-hint">Scroll to bring the app into view</p>
        </div>
      </div>`;

    return {
      zone: document.getElementById("phone-showcase-scroll-zone"),
      feed: document.getElementById("phone-showcase-feed"),
      device: document.getElementById("phone-showcase-device"),
      hint: document.getElementById("phone-showcase-hint"),
    };
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function scrollMetrics(feed) {
    const introPx = window.innerHeight * INTRO_VH;
    const feedScrollPx = Math.max(0, feed.scrollHeight - feed.clientHeight);
    const feedZonePx = feedScrollPx + window.innerHeight * FEED_EXTRA_VH;
    const totalPx = introPx + feedZonePx;
    const introRatio = introPx / totalPx;
    return { introPx, feedZonePx, totalPx, introRatio, feedScrollPx };
  }

  function setScrollZoneHeight(zone, feed) {
    if (!zone || !feed) return;
    const { totalPx } = scrollMetrics(feed);
    zone.style.minHeight = `${totalPx + window.innerHeight}px`;
    zone.dataset.introRatio = String(scrollMetrics(feed).introRatio);
  }

  function scrolledPx(zone) {
    const rect = zone.getBoundingClientRect();
    const max = zone.offsetHeight - window.innerHeight;
    return clamp(-rect.top, 0, Math.max(max, 0));
  }

  function applyPhoneIntro(device, introP) {
    const t = easeOutCubic(introP);
    const isWide = window.matchMedia("(min-width: 900px)").matches;
    const xStart = isWide ? 22 : 16;
    const xEnd = isWide ? -2 : 0;
    const x = lerp(xStart, xEnd, t);
    const rot = lerp(-6, 0, t);
    const scale = lerp(0.9, 1, t);
    device.style.transform = `translateX(${x}vw) rotate(${rot}deg) scale(${scale})`;
  }

  function updateScroll() {
    const els = window.__phoneShowcaseEls;
    if (!els || prefersReducedMotion()) return;

    const { zone, feed, device, hint } = els;
    const { introRatio, feedScrollPx } = scrollMetrics(feed);
    const scrolled = scrolledPx(zone);
    const totalScrollable = Math.max(zone.offsetHeight - window.innerHeight, 1);
    const p = scrolled / totalScrollable;

    if (p < introRatio) {
      const introP = p / introRatio;
      applyPhoneIntro(device, introP);
      feed.scrollTop = 0;
      if (hint) {
        hint.textContent = "Scroll to bring the app into view";
        hint.classList.remove("is-feed-phase");
      }
    } else {
      applyPhoneIntro(device, 1);
      const feedP = (p - introRatio) / (1 - introRatio);
      const easedFeed = easeOutCubic(feedP);
      feed.scrollTop = easedFeed * feedScrollPx;
      if (hint) {
        hint.textContent = "Keep scrolling to browse the feed";
        hint.classList.add("is-feed-phase");
      }
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
