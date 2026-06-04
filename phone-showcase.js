/**
 * Scroll-driven phone preview:
 * Phase 1 — page scroll slides phone left into view.
 * Phase 2 — page scroll drives feed inside the phone.
 */
(function () {
  const INTRO_VH_DESKTOP = 0.45;
  const INTRO_VH_MOBILE = 0.22;
  const MOBILE_SCROLL_SWIPES = 5;
  const MOBILE_SWIPE_VH = 0.13;

  const FALLBACK_COLLEGES = [
    "Shri Ram College of Commerce", "Hindu College", "Miranda House", "Lady Shri Ram College",
    "St. Stephen's College", "Hansraj College", "Kirori Mal College", "Ramjas College",
  ];

  const COLLEGE_NAMES = (
    window.DU_COLLEGE_NAMES && window.DU_COLLEGE_NAMES.length
      ? window.DU_COLLEGE_NAMES
      : FALLBACK_COLLEGES
  );

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

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function nameSpanMarkup(name, i) {
    const hi = i % 6 === 0 ? " ps-college-name--hi" : "";
    return `<span class="ps-college-name${hi}">${escapeHtml(name)}</span>`;
  }

  function rowNamesInner(row, ri) {
    const doubled = row.concat(row);
    return doubled.map((n, i) => nameSpanMarkup(n, ri * 16 + i)).join("");
  }

  /** Plain text banner rows — alternating scroll direction per row */
  function nameWallMarkup(rowCount) {
    const rows = Array.from({ length: rowCount }, () => []);
    COLLEGE_NAMES.forEach((name, i) => {
      rows[i % rowCount].push(name);
    });

    const rowEls = rows
      .map((row, ri) => {
        const dir = ri % 2 === 0 ? "ps-college-row--left" : "ps-college-row--right";
        const dense = ri % 3 === 1 ? " ps-college-row--dense" : "";
        const duration = (48 + ri * 6).toFixed(1);
        const inner = rowNamesInner(row, ri);
        return `<div class="ps-college-row ${dir}${dense}">
          <div class="ps-college-track" style="animation-duration:${duration}s">
            <div class="ps-college-track-group">${inner}</div>
            <div class="ps-college-track-group" aria-hidden="true">${inner}</div>
          </div>
        </div>`;
      })
      .join("");

    return `<div class="phone-showcase-name-wall" aria-hidden="true">${rowEls}</div>`;
  }

  function buildSection() {
    const root = document.getElementById("app-preview");
    if (!root) return null;

    root.innerHTML = `
      <div class="phone-showcase-header">
        <h2 class="phone-showcase-title">One <em>network</em> connecting every campus</h2>
      </div>
      <div class="phone-showcase-scroll-zone" id="phone-showcase-scroll-zone">
        <div class="phone-showcase-pin">
          <div class="phone-showcase-stage" id="phone-showcase-stage">
            <div class="phone-showcase-cluster">
              ${nameWallMarkup(9)}
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
            <p class="phone-showcase-disclaimer">This is not an exact representation of the in-app visual*</p>
          </div>
        </div>
      </div>
      <div class="phone-showcase-outro" aria-hidden="true"></div>`;

    return {
      zone: document.getElementById("phone-showcase-scroll-zone"),
      stage: document.getElementById("phone-showcase-stage"),
      feed: document.getElementById("phone-showcase-feed"),
      device: document.getElementById("phone-showcase-device"),
    };
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isMobileLayout() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function introVh() {
    return isMobileLayout() ? INTRO_VH_MOBILE : INTRO_VH_DESKTOP;
  }

  function mobileMinTravelPx() {
    return Math.round(window.innerHeight * MOBILE_SWIPE_VH * MOBILE_SCROLL_SWIPES);
  }

  function scrollMetrics(feed) {
    const introPx = window.innerHeight * introVh();
    const feedScrollPx = Math.max(0, feed.scrollHeight - feed.clientHeight);
    let feedZonePx = isMobileLayout() ? feedScrollPx : Math.max(feedScrollPx, 120);
    let travelPx = introPx + feedZonePx;

    if (isMobileLayout()) {
      const minTravel = mobileMinTravelPx();
      if (travelPx < minTravel) {
        feedZonePx += minTravel - travelPx;
        travelPx = minTravel;
      }
    }

    return { introPx, feedZonePx, travelPx, feedScrollPx };
  }

  function pinStickyTopPx() {
    const pin = document.querySelector(".phone-showcase-pin");
    if (!pin) return 56;
    const top = parseFloat(getComputedStyle(pin).top);
    return Number.isFinite(top) ? top : 56;
  }

  function stageHeightPx(stage) {
    if (!stage) return 0;
    return Math.ceil(stage.getBoundingClientRect().height) || stage.offsetHeight;
  }

  /** Laptop: sticky runway sized to phone block, not full viewport (avoids blank cream below). */
  function desktopRunwayPx(stage) {
    return stageHeightPx(stage) + pinStickyTopPx() + 16;
  }

  function setScrollZoneHeight(zone, feed, stage) {
    if (!zone || !feed) return;
    const { travelPx } = scrollMetrics(feed);
    if (isMobileLayout() && stage) {
      zone.classList.add("phone-showcase-scroll-zone--mobile-flow");
      zone.style.minHeight = `${stageHeightPx(stage)}px`;
      zone.style.paddingBottom = "0";
    } else {
      zone.classList.remove("phone-showcase-scroll-zone--mobile-flow");
      const runway = desktopRunwayPx(stage);
      zone.style.minHeight = `${travelPx + runway}px`;
      zone.style.paddingBottom = "";
    }
    zone.style.height = "";
  }

  function scrolledPx(zone, stage, feed) {
    const { travelPx } = scrollMetrics(feed);
    const top = zone.getBoundingClientRect().top;
    if (isMobileLayout()) {
      return clamp(pinStickyTopPx() - top, 0, travelPx);
    }
    const runway = desktopRunwayPx(stage);
    const max = Math.max(0, zone.offsetHeight - runway);
    return clamp(-top, 0, max);
  }

  function applyPhoneIntro(device, introP) {
    const t = easeOutCubic(introP);
    const isWide = window.matchMedia("(min-width: 900px)").matches;
    const xStart = isWide ? 22 : 16;
    const xEnd = isWide ? -2 : 0;
    const x = lerp(xStart, xEnd, t);
    const rot = lerp(-6, 0, t);
    const scale = lerp(0.9, 1, t);
    device.style.transform = `translate3d(${x}vw, 0, 0) rotate(${rot}deg) scale(${scale})`;
  }

  function updateScroll() {
    const els = window.__phoneShowcaseEls;
    if (!els || prefersReducedMotion()) return;

    const { zone, feed, device } = els;
    const { introPx, feedZonePx, feedScrollPx } = scrollMetrics(feed);
    const scrolled = scrolledPx(zone, els.stage, feed);

    if (scrolled <= introPx) {
      const introP = introPx > 0 ? scrolled / introPx : 0;
      applyPhoneIntro(device, introP);
      feed.scrollTop = 0;
    } else {
      applyPhoneIntro(device, 1);
      const feedScrolled = Math.min(scrolled - introPx, feedZonePx);
      const feedP = feedZonePx > 0 ? feedScrolled / feedZonePx : 0;
      feed.scrollTop = feedP * feedScrollPx;
    }
  }

  function init() {
    const els = buildSection();
    if (!els) return;
    window.__phoneShowcaseEls = els;

    const measure = () => {
      els.feed.scrollTop = 0;
      void els.feed.offsetHeight;
      setScrollZoneHeight(els.zone, els.feed, els.stage);
      updateScroll();
    };

    const resize = () => {
      measure();
      requestAnimationFrame(measure);
      setTimeout(measure, 120);
    };

    let scrollTicking = false;
    const onScroll = () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        updateScroll();
        scrollTicking = false;
      });
    };

    if (!prefersReducedMotion()) {
      els.feed.classList.add("is-scroll-driven");
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", resize);
      if (document.fonts?.ready) document.fonts.ready.then(resize);
      else requestAnimationFrame(resize);
      resize();
    } else {
      els.feed.classList.remove("is-scroll-driven");
      setScrollZoneHeight(els.zone, els.feed, els.stage);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
