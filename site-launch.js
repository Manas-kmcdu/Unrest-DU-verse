/**
 * unrestdu.in launch phases.
 *
 * prelaunch - countdown + waitlist (before 20 June)
 * live      - "We're live", download CTAs, public suggestions feed
 *
 * To go live after launch: set phase to "live", add store URLs, deploy.
 */

export const SITE_LAUNCH = {
  phase: "prelaunch",
  /** 10:00 AM IST on launch day */
  launchAt: "2026-06-20T04:30:00.000Z",
  launchDateLabel: "Friday, 20 June 2026",
  launchTimeLabel: "10:00 AM IST",
  ios: {
    appStoreUrl: "https://apps.apple.com/us/app/unrest-campus-network/id6777179220",
    testFlightUrl: "",
  },
  android: {
    /** Empty until Play open testing is approved. */
    playInternalUrl: "",
  },
  downloadPage: "/download.html",
};

export function iosStoreLive() {
  return Boolean(SITE_LAUNCH.ios.appStoreUrl || SITE_LAUNCH.ios.testFlightUrl);
}

function $(id) {
  return document.getElementById(id);
}

function setText(id, text) {
  const el = $(id);
  if (el && text != null) el.textContent = text;
}

function setHtml(id, html) {
  const el = $(id);
  if (el && html != null) el.innerHTML = html;
}

function show(id, visible) {
  const el = $(id);
  if (el) el.hidden = !visible;
}

function pad(n) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function iosDownloadUrl() {
  return SITE_LAUNCH.ios.appStoreUrl || SITE_LAUNCH.ios.testFlightUrl || SITE_LAUNCH.downloadPage;
}

export function initLaunchCountdown() {
  const wrap = $("launch-countdown");
  if (!wrap || SITE_LAUNCH.phase === "live") return;

  const end = new Date(SITE_LAUNCH.launchAt).getTime();

  function tick() {
    const left = Math.max(0, end - Date.now());
    const days = Math.floor(left / 86400000);
    const hours = Math.floor((left % 86400000) / 3600000);
    const mins = Math.floor((left % 3600000) / 60000);
    const secs = Math.floor((left % 60000) / 1000);

    setText("cd-days", pad(days));
    setText("cd-hours", pad(hours));
    setText("cd-mins", pad(mins));
    setText("cd-secs", pad(secs));

    if (left <= 0) {
      setText("launch-countdown-label", "Launch day is here");
      clearInterval(timer);
    }
  }

  tick();
  const timer = setInterval(tick, 1000);
}

export function applySiteLaunchPhase() {
  const live = SITE_LAUNCH.phase === "live";
  document.body.dataset.launchPhase = live ? "live" : "prelaunch";

  show("launch-countdown", !live);
  show("launch-prelaunch-copy", !live);
  show("launch-live-copy", live);
  show("hero-prelaunch-form", !live);
  show("hero-live-cta", live);
  show("suggestions-live", live);
  show("nav-prelaunch-cta", !live);
  show("nav-live-cta", live);

  if (live) {
    setText("hero-badge", "Now live · early access");
    setText(
      "hero-sub",
      "Delhi University's verified campus network is on iPhone. Android follows soon. Use your early access code in the app."
    );
    setText("launch-status-title", "");
    setHtml("launch-status-title", 'Unrest is <em>live</em>');
    setText(
      "launch-status-sub",
      "Download on iPhone, enter your code, and help shape what we build next."
    );
    const dl = $("hero-download-btn");
    if (dl) dl.href = iosDownloadUrl();
    const navDl = $("nav-download-btn");
    if (navDl) navDl.href = iosDownloadUrl();
  } else {
    const iosReady = iosStoreLive();
    setText("hero-badge", iosReady ? "iPhone live · Android soon");
    setText(
      "hero-sub",
      iosReady
        ? "Unrest is on the App Store for iPhone. Android open testing is still being set up - request your early access code and sign in with the same email in the app."
        : "A verified campus network for DU students and aspirants. iPhone launch on 20 June - request your code now and be ready on day one."
    );
    setHtml("launch-status-title", iosReady ? 'Live on <em>iPhone</em>' : 'Launching <em>20 June</em>');
    setText(
      "launch-status-sub",
      iosReady
        ? "Download on iPhone below. Official launch day is still 20 June - Android follows when Play testing opens."
        : `Early access is open. Get your code, save it, and install when we go live on ${SITE_LAUNCH.launchDateLabel} (${SITE_LAUNCH.launchTimeLabel}).`
    );
    if (iosReady) {
      const dl = $("hero-download-btn");
      if (dl) dl.href = iosDownloadUrl();
    }
    const iosLine = $("launch-ios-line");
    if (iosLine) {
      iosLine.innerHTML = iosReady
        ? "<strong>iPhone</strong> - on the App Store now. Enter your early access code after install."
        : `<strong>20 June · iPhone</strong> - App Store release on launch day. We'll email everyone with a code their install link.`;
    }
    const androidLine = $("launch-android-line");
    if (androidLine) {
      androidLine.innerHTML =
        "<strong>Android</strong> - Play open testing is taking place. Same code when it's live.";
    }
  }

  initLaunchCountdown();
}

export function initLiveSuggestionsFeed(firestore) {
  if (SITE_LAUNCH.phase !== "live" || !firestore?.db) return;

  const { collection, query, orderBy, limit, onSnapshot } = firestore;
  const feed = $("live-suggestions-feed");
  const empty = $("live-suggestions-empty");
  if (!feed) return;

  const q = query(
    collection(firestore.db, "feature_suggestions"),
    orderBy("upvoteCount", "desc"),
    orderBy("createdAt", "desc"),
    limit(12)
  );

  onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          text: typeof data.text === "string" ? data.text : "",
          authorName: typeof data.authorName === "string" ? data.authorName : "Student",
          authorCollege: typeof data.authorCollege === "string" ? data.authorCollege : "",
          upvoteCount: typeof data.upvoteCount === "number" ? data.upvoteCount : 0,
        };
      });

      if (empty) empty.hidden = items.length > 0;
      feed.innerHTML = items
        .map(
          (item) => `
        <article class="live-suggestion-card">
          <p class="live-suggestion-text">${escapeHtml(item.text)}</p>
          <div class="live-suggestion-meta">
            <span>${escapeHtml(item.authorName)}${item.authorCollege ? ` · ${escapeHtml(item.authorCollege)}` : ""}</span>
            <span class="live-suggestion-votes">▲ ${item.upvoteCount}</span>
          </div>
        </article>`
        )
        .join("");
    },
    () => {
      if (empty) {
        empty.hidden = false;
        empty.textContent = "Suggestions load when you are signed in to the app.";
      }
    }
  );
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
