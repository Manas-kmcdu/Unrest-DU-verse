/**
 * Horizontal scrolling phone mockups (Fizz-style) — injects above waitlist.
 */
(function () {
  const SLIDES = [
    {
      label: "Feed",
      html: `
        <div class="ps-phone">
          <div class="ps-screen">
            <div class="ps-status"><span>9:41</span><span>●●●</span></div>
            <div class="ps-nav">Un<span>rest</span></div>
            <div class="ps-tabs">
              <div class="ps-tab active">DU</div>
              <div class="ps-tab">College</div>
              <div class="ps-tab">Explore</div>
            </div>
            <div class="ps-body">
              <div class="ps-post">
                <div class="ps-post-head">
                  <div class="ps-av" style="background:#9e4538">RK</div>
                  <div>
                    <div class="ps-post-name">Riya Kapoor</div>
                    <div class="ps-post-sub">SRCC · 2nd year</div>
                  </div>
                </div>
                <div class="ps-post-text">EconFest this Friday — case comps, guest lectures, networking. Who's coming from North Campus?</div>
              </div>
              <div class="ps-take-strip"><span>🔥</span><strong>Hot take: 8am lectures should be illegal</strong></div>
              <div class="ps-post">
                <div class="ps-post-head">
                  <div class="ps-av" style="background:#1e4f8c">AS</div>
                  <div>
                    <div class="ps-post-name">Aryan Singh</div>
                    <div class="ps-post-sub">Hindu · 3rd year</div>
                  </div>
                </div>
                <div class="ps-post-text">Anyone selling Macro notes from last sem? DM 🙏</div>
              </div>
            </div>
          </div>
        </div>`,
    },
    {
      label: "Activities",
      html: `
        <div class="ps-phone">
          <div class="ps-screen">
            <div class="ps-status"><span>9:41</span><span>●●●</span></div>
            <div class="ps-nav">Un<span>rest</span></div>
            <div class="ps-tabs">
              <div class="ps-tab active">Activities</div>
              <div class="ps-tab">Post</div>
            </div>
            <div class="ps-body">
              <div class="ps-activity ps-activity--dark">
                <div class="ps-activity-title">Pickleball</div>
                <div class="ps-activity-meta">Today · 6:30pm</div>
                <div class="ps-activity-meta">North Campus courts</div>
                <div class="ps-activity-meta">4 spots open</div>
              </div>
              <div class="ps-activity ps-activity--lime">
                <div class="ps-activity-title">Chai & assignment circle</div>
                <div class="ps-activity-meta">Tonight · 9pm · Library lawn</div>
              </div>
              <div class="ps-activity" style="background:#e8f4ec;border:0.5px solid rgba(42,107,74,0.2)">
                <div class="ps-activity-title" style="color:#0e0d0b">Turf football</div>
                <div class="ps-activity-meta" style="color:rgba(14,13,11,0.65)">Sun 8pm · GTB Nagar · 3 spots</div>
              </div>
            </div>
          </div>
        </div>`,
    },
    {
      label: "Sports",
      html: `
        <div class="ps-phone">
          <div class="ps-screen">
            <div class="ps-status"><span>9:41</span><span>●●●</span></div>
            <div class="ps-nav">Un<span>rest</span> <span style="font-family:var(--sans);font-size:0.5rem;font-weight:700;color:var(--green);margin-left:auto">Live</span></div>
            <div class="ps-body" style="padding-top:10px">
              <div class="ps-sport" style="--sc:#c84b2f">
                <div class="ps-sport-title">⚽ Turf Sunday — 5-a-side</div>
                <div class="ps-sport-body">JNU Ground · 7am · 12 spots left</div>
              </div>
              <div class="ps-sport" style="--sc:#2a6b4a">
                <div class="ps-sport-title">🏃 Morning run club</div>
                <div class="ps-sport-body">Lodhi loop · All paces · Post-run chai</div>
              </div>
              <div class="ps-sport" style="--sc:#1e4f8c">
                <div class="ps-sport-title">🏸 Badminton doubles</div>
                <div class="ps-sport-body">Hindu sports complex · 8 pairs in</div>
              </div>
              <div class="ps-sport" style="--sc:#e8a020">
                <div class="ps-sport-title">🏏 DU cricket league W4</div>
                <div class="ps-sport-body">SRCC vs Hansraj · Live on feed</div>
              </div>
            </div>
          </div>
        </div>`,
    },
    {
      label: "Banners",
      html: `
        <div class="ps-phone">
          <div class="ps-screen">
            <div class="ps-status"><span>9:41</span><span>●●●</span></div>
            <div class="ps-nav">Un<span>rest</span></div>
            <div class="ps-body" style="padding-top:12px;gap:10px">
              <div class="ps-banner">
                <div class="ps-banner-tag">Hot take</div>
                <div class="ps-banner-title">North Campus canteen prices went up again</div>
              </div>
              <div class="ps-banner" style="background:linear-gradient(135deg,#2a1a12,#4a2820)">
                <div class="ps-banner-tag">Stress-o-meter</div>
                <div class="ps-banner-title">Campus average: 7.2 this week</div>
              </div>
              <div class="ps-post">
                <div class="ps-post-head">
                  <div class="ps-av" style="background:#7b1fa2">NM</div>
                  <div>
                    <div class="ps-post-name">Neha Mehta</div>
                    <div class="ps-post-sub">Miranda · 1st year</div>
                  </div>
                </div>
                <div class="ps-post-text">Fest season is back — who's tracking every college society IG story?</div>
              </div>
            </div>
          </div>
        </div>`,
    },
    {
      label: "Corridor",
      html: `
        <div class="ps-phone">
          <div class="ps-screen">
            <div class="ps-status"><span>9:41</span><span>●●●</span></div>
            <div class="ps-nav">Corridor</div>
            <div class="ps-body ps-corridor">
              <div class="ps-door">
                <div class="ps-door-title">Off your chest</div>
                <div class="ps-door-sub">286 inside · anonymous</div>
              </div>
              <div class="ps-door">
                <div class="ps-door-title">Debate door</div>
                <div class="ps-door-sub">Delhi metro vs NCR buses</div>
              </div>
              <div class="ps-door">
                <div class="ps-door-title">Bench matcher</div>
                <div class="ps-door-sub">Find someone on campus now</div>
              </div>
            </div>
          </div>
        </div>`,
    },
    {
      label: "Explore",
      html: `
        <div class="ps-phone">
          <div class="ps-screen">
            <div class="ps-status"><span>9:41</span><span>●●●</span></div>
            <div class="ps-nav">Explore</div>
            <div class="ps-body" style="padding-top:10px">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                <div style="background:#fff;border:0.5px solid var(--border);border-radius:8px;padding:10px;font-size:0.52rem;font-weight:600">Fashion</div>
                <div style="background:#fff;border:0.5px solid var(--border);border-radius:8px;padding:10px;font-size:0.52rem;font-weight:600">Sports</div>
                <div style="background:#fff;border:0.5px solid var(--border);border-radius:8px;padding:10px;font-size:0.52rem;font-weight:600">Tech</div>
                <div style="background:#fff;border:0.5px solid var(--border);border-radius:8px;padding:10px;font-size:0.52rem;font-weight:600">Societies</div>
              </div>
              <div class="ps-post">
                <div class="ps-post-text" style="padding-top:8px">Roommate in Vijay Nagar · ₹12k · veg only</div>
              </div>
            </div>
          </div>
        </div>`,
    },
  ];

  function renderSet() {
    return SLIDES.map((s) => s.html).join("");
  }

  function init() {
    const root = document.getElementById("phone-showcase-marquee");
    if (!root) return;

    const markup = renderSet();
    root.innerHTML = `
      <div class="phone-showcase-track">
        <div class="phone-showcase-set">${markup}</div>
        <div class="phone-showcase-set phone-showcase-set--dup" aria-hidden="true">${markup}</div>
      </div>`;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
