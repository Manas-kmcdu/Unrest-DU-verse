import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBJ0hHjVyEnwg7mV7ECeG163K7fs1fsiE",
  authDomain: "du-verse-e75db.firebaseapp.com",
  projectId: "du-verse-e75db",
  storageBucket: "du-verse-e75db.firebasestorage.app",
  messagingSenderId: "84735746102",
  appId: "1:84735746102:web:6fe5353a0586db71323897",
};

const ADMIN_EMAILS = new Set(["manaspandeya@gmail.com", "contact@unrestdu.in"]);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const state = {
  user: null,
  isAdmin: false,
  canModerate: false,
  pendingPosts: [],
  openReports: [],
  verifications: [],
  usernames: [],
  profileChanges: [],
  unsubs: [],
};

const $ = (id) => document.getElementById(id);

function showToast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    el.hidden = true;
  }, 3200);
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatTs(ts) {
  if (!ts) return "—";
  const ms = ts.toMillis?.() ?? (typeof ts === "number" ? ts : 0);
  if (!ms) return "—";
  return new Date(ms).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MIN_MOD_WIDTH = 768;

function checkViewport() {
  const narrow = window.innerWidth < MIN_MOD_WIDTH;
  $("mobile-block").hidden = !narrow;
  const w = $("viewport-width");
  if (w) w.textContent = String(window.innerWidth);
  if (narrow) {
    $("app").hidden = true;
    $("login").hidden = true;
    return false;
  }
  return true;
}

async function canUserModerate(user) {
  if (!user?.email) return false;
  const email = user.email.toLowerCase();
  if (ADMIN_EMAILS.has(email)) return true;
  try {
    const snap = await getDoc(doc(db, "app_config", "moderation"));
    const list = snap.data()?.moderatorEmails;
    return Array.isArray(list) && list.includes(email);
  } catch {
    return false;
  }
}

function clearSubscriptions() {
  state.unsubs.forEach((u) => u());
  state.unsubs = [];
}

function startSubscriptions() {
  clearSubscriptions();

  const qPosts = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  state.unsubs.push(
    onSnapshot(qPosts, (snap) => {
      state.pendingPosts = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.status === "pending");
      renderPosts();
    })
  );

  state.unsubs.push(
    onSnapshot(collection(db, "post_reports"), (snap) => {
      state.openReports = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((r) => r.status === "open");
      renderReports();
    })
  );

  state.unsubs.push(
    onSnapshot(
      query(collection(db, "manual_verifications"), where("status", "==", "pending")),
      (snap) => {
        state.verifications = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        renderProfileSections();
      }
    )
  );

  state.unsubs.push(
    onSnapshot(
      query(collection(db, "username_requests"), where("status", "==", "pending")),
      (snap) => {
        state.usernames = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        renderProfileSections();
      }
    )
  );

  state.unsubs.push(
    onSnapshot(
      query(collection(db, "profile_change_requests"), where("status", "==", "pending")),
      (snap) => {
        state.profileChanges = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        renderProfileSections();
      }
    )
  );
}

function postMeta(p) {
  const parts = [
    p.author || "Student",
    p.college,
    p.year,
    p.course,
    p.isAnonymous ? "anonymous" : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

function renderPosts() {
  const q = ($("posts-search").value || "").trim().toLowerCase();
  let items = state.pendingPosts;
  if (q) {
    items = items.filter((p) => {
      const blob = [p.author, p.college, p.text, p.course, p.email].join(" ").toLowerCase();
      return blob.includes(q);
    });
  }

  $("posts-count").textContent = `${state.pendingPosts.length} pending`;
  $("posts-empty").hidden = items.length > 0;

  $("posts-list").innerHTML = items
    .map((p) => {
      const img = p.imageUrl
        ? `<img class="card-image" src="${escapeHtml(p.imageUrl)}" alt="" />`
        : "";
      const tags = p.tags?.length ? `<div class="card-tags">${escapeHtml(p.tags.join(" "))}</div>` : "";
      return `<article class="card" data-post-id="${escapeHtml(p.id)}">
        <div class="card-meta"><strong>${escapeHtml(postMeta(p))}</strong> · ${formatTs(p.createdAt)}</div>
        ${tags}
        <p class="card-body">${escapeHtml(p.text || "(no text)")}</p>
        ${img}
        <div class="card-actions">
          <button type="button" class="btn btn-primary" data-action="approve-post" data-id="${escapeHtml(p.id)}">Approve</button>
          <button type="button" class="btn btn-danger" data-action="reject-post" data-id="${escapeHtml(p.id)}">Delete</button>
        </div>
      </article>`;
    })
    .join("");
}

function renderReports() {
  $("reports-empty").hidden = state.openReports.length > 0;
  $("reports-list").innerHTML = state.openReports
    .map(
      (r) => `<article class="card">
      <div class="card-meta"><strong>${escapeHtml(r.reasonLabel || r.reason || "Report")}</strong> · ${formatTs(r.createdAt)}</div>
      <p class="card-body">${escapeHtml(r.postText || "(no preview)")}</p>
      <div class="card-meta">Author: ${escapeHtml(r.postAuthor || "—")} · College: ${escapeHtml(r.postCollege || "—")}</div>
      <div class="card-actions">
        <button type="button" class="btn" data-action="dismiss-report" data-id="${escapeHtml(r.id)}">Dismiss</button>
        <button type="button" class="btn btn-danger" data-action="delete-reported" data-report="${escapeHtml(r.id)}" data-post="${escapeHtml(r.postId || "")}">Delete post</button>
      </div>
    </article>`
    )
    .join("");
}

function renderProfileSections() {
  const vEl = $("profile-verify");
  vEl.innerHTML =
    state.verifications.length === 0
      ? `<p class="empty">No pending verifications.</p>`
      : state.verifications
          .map(
            (v) => `<article class="card">
        <div class="card-meta"><strong>${escapeHtml(v.displayName || v.email || "Student")}</strong> · ${escapeHtml(v.college || "")}</div>
        <p class="card-body">${escapeHtml(v.note || "Manual verification request")}</p>
        <div class="card-meta">${escapeHtml(v.email || "")} · ${escapeHtml(v.course || "")} · ${escapeHtml(v.year || "")}</div>
        ${v.proofUrl ? `<a href="${escapeHtml(v.proofUrl)}" target="_blank" rel="noopener">View proof</a>` : ""}
        <div class="card-actions">
          <button type="button" class="btn btn-primary" data-action="verify-approve" data-id="${escapeHtml(v.id)}">Verify</button>
          <button type="button" class="btn btn-danger" data-action="verify-deny" data-id="${escapeHtml(v.id)}">Deny</button>
        </div>
      </article>`
          )
          .join("");

  const uEl = $("profile-usernames");
  uEl.innerHTML =
    state.usernames.length === 0
      ? `<p class="empty">No pending username requests.</p>`
      : state.usernames
          .map(
            (u) => `<article class="card">
        <div class="card-meta"><strong>@${escapeHtml(u.requestedUsername || "")}</strong> · ${escapeHtml(u.email || "")}</div>
        <div class="card-actions">
          <button type="button" class="btn btn-primary" data-action="username-approve" data-id="${escapeHtml(u.id)}" data-uid="${escapeHtml(u.uid || "")}" data-user="${escapeHtml(u.requestedUsername || "")}" data-email="${escapeHtml(u.email || "")}">Approve</button>
          <button type="button" class="btn btn-danger" data-action="username-deny" data-id="${escapeHtml(u.id)}" data-uid="${escapeHtml(u.uid || "")}">Deny</button>
        </div>
      </article>`
          )
          .join("");

  const nEl = $("profile-names");
  nEl.innerHTML =
    state.profileChanges.length === 0
      ? `<p class="empty">No pending display name changes.</p>`
      : state.profileChanges
          .filter((r) => r.kind === "displayName")
          .map(
            (r) => `<article class="card">
        <div class="card-meta">${escapeHtml(r.email || "")}</div>
        <p class="card-body">→ <strong>${escapeHtml(r.requestedValue || "")}</strong></p>
        <div class="card-actions">
          <button type="button" class="btn btn-primary" data-action="name-approve" data-id="${escapeHtml(r.id)}" data-uid="${escapeHtml(r.uid || "")}" data-value="${escapeHtml(r.requestedValue || "")}">Approve</button>
          <button type="button" class="btn btn-danger" data-action="name-deny" data-id="${escapeHtml(r.id)}">Deny</button>
        </div>
      </article>`
          )
          .join("");
}

async function approvePost(id) {
  await updateDoc(doc(db, "posts", id), {
    status: "approved",
    approvedAt: serverTimestamp(),
  });
  showToast("Post approved");
}

async function rejectPost(id) {
  if (!confirm("Delete this post permanently?")) return;
  await deleteDoc(doc(db, "posts", id));
  showToast("Post deleted");
}

async function dismissReport(id) {
  await updateDoc(doc(db, "post_reports", id), {
    status: "dismissed",
    resolvedAt: serverTimestamp(),
  });
  showToast("Report dismissed");
}

async function deleteReported(reportId, postId) {
  if (!confirm("Delete the reported post?")) return;
  if (postId) await deleteDoc(doc(db, "posts", postId));
  await updateDoc(doc(db, "post_reports", reportId), {
    status: "actioned",
    resolvedAt: serverTimestamp(),
  });
  showToast("Post removed");
}

async function grantPostingAccess(data) {
  const email = String(data.email || "").trim();
  const uid = String(data.uid || "");
  if (!email) throw new Error("Email required");

  await setDoc(
    doc(db, "allowlisted_emails", email.toLowerCase()),
    {
      email,
      displayName: data.displayName || "",
      college: data.college || "",
      course: data.course || "",
      year: data.year || "",
      approvedAt: serverTimestamp(),
    },
    { merge: true }
  );

  if (uid) {
    await setDoc(
      doc(db, "users", uid),
      { email, allowlisted: true, verifiedAt: serverTimestamp() },
      { merge: true }
    );
  }
}

async function resolveVerification(id, status) {
  const snap = await getDoc(doc(db, "manual_verifications", id));
  const data = snap.data();
  await updateDoc(doc(db, "manual_verifications", id), { status });
  if (status === "approved" && data?.email) {
    await grantPostingAccess(data);
    showToast("User verified — they can post after sign-in");
  } else {
    showToast(`Marked ${status}`);
  }
}

async function approveUsername(requestId, uid, username, email) {
  const normalized = username.trim().toLowerCase();
  const slotRef = doc(db, "username_slots", normalized);

  await runTransaction(db, async (tx) => {
    const slot = await tx.get(slotRef);
    if (slot.exists() && slot.data()?.uid !== uid) {
      throw new Error("Username already taken");
    }
    tx.set(
      slotRef,
      { uid, status: "approved", updatedAt: serverTimestamp() },
      { merge: true }
    );
  });

  await updateDoc(doc(db, "username_requests", requestId), {
    status: "approved",
    reviewedAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, "users", uid),
    {
      username: normalized,
      email: email || null,
      usernameApprovedAt: serverTimestamp(),
      lastUsernameChangeAt: serverTimestamp(),
    },
    { merge: true }
  );
  showToast(`@${normalized} approved`);
}

async function denyUsername(requestId) {
  await updateDoc(doc(db, "username_requests", requestId), {
    status: "rejected",
    reviewedAt: serverTimestamp(),
  });
  showToast("Username request denied");
}

async function approveDisplayName(requestId, uid, name) {
  const trimmed = name.trim();
  await updateDoc(doc(db, "profile_change_requests", requestId), {
    status: "approved",
    reviewedAt: serverTimestamp(),
  });
  await setDoc(
    doc(db, "users", uid),
    {
      displayName: trimmed,
      lastDisplayNameChangeAt: serverTimestamp(),
    },
    { merge: true }
  );
  showToast("Display name updated");
}

async function denyDisplayName(requestId) {
  await updateDoc(doc(db, "profile_change_requests", requestId), {
    status: "rejected",
    reviewedAt: serverTimestamp(),
  });
  showToast("Name change denied");
}

async function loadTeamEmails() {
  if (!state.isAdmin) return;
  const snap = await getDoc(doc(db, "app_config", "moderation"));
  const list = snap.data()?.moderatorEmails;
  $("team-emails").value = Array.isArray(list) ? list.join("\n") : "";
}

async function saveTeamEmails(raw) {
  const emails = raw
    .split(/[\n,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));
  const unique = [...new Set(emails)].slice(0, 15);
  await setDoc(
    doc(db, "app_config", "moderation"),
    { moderatorEmails: unique, updatedAt: serverTimestamp() },
    { merge: true }
  );
  $("team-status").textContent = `Saved ${unique.length} moderator(s).`;
  showToast("Moderator list saved");
}

function showApp() {
  $("mobile-block").hidden = true;
  $("login").hidden = true;
  $("app").hidden = false;
  $("user-email").textContent = state.user?.email || "";
  const teamNav = document.querySelector(".nav-admin");
  if (teamNav) teamNav.hidden = !state.isAdmin;
  if (state.isAdmin) void loadTeamEmails();
  startSubscriptions();
  renderPosts();
  renderReports();
  renderProfileSections();
}

function showLogin() {
  clearSubscriptions();
  $("app").hidden = true;
  $("login").hidden = false;
  if (checkViewport()) $("mobile-block").hidden = true;
}

async function handleAuth(user) {
  if (!user) {
    state.user = null;
    state.canModerate = false;
    showLogin();
    return;
  }
  const ok = await canUserModerate(user);
  if (!ok) {
    await signOut(auth);
    $("login-error").hidden = false;
    $("login-error").textContent = "This account does not have moderator access.";
    showLogin();
    return;
  }
  state.user = user;
  state.isAdmin = ADMIN_EMAILS.has(user.email?.toLowerCase() || "");
  state.canModerate = true;
  $("login-error").hidden = true;
  if (checkViewport()) showApp();
}

function bindUi() {
  window.addEventListener("resize", () => {
    const ok = checkViewport();
    if (state.user && ok) showApp();
    else if (!state.user && ok) showLogin();
  });

  $("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("login-error").hidden = true;
    try {
      await signInWithEmailAndPassword(
        auth,
        $("login-email").value.trim(),
        $("login-password").value
      );
    } catch (err) {
      $("login-error").hidden = false;
      $("login-error").textContent = err?.message || "Sign in failed";
    }
  });

  $("btn-signout").addEventListener("click", () => signOut(auth));
  $("btn-refresh").addEventListener("click", async () => {
    await auth.currentUser?.getIdToken(true);
    showToast("Refreshed");
  });

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
      $(`panel-${tab}`).classList.add("active");
    });
  });

  document.querySelectorAll(".subtab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".subtab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const sub = btn.dataset.profileSub;
      document.querySelectorAll(".profile-sub").forEach((el) => {
        el.hidden = true;
        el.classList.remove("active");
      });
      const target = $(`profile-${sub}`);
      target.hidden = false;
      target.classList.add("active");
    });
  });

  $("posts-search").addEventListener("input", renderPosts);

  document.body.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    try {
      if (action === "approve-post") await approvePost(btn.dataset.id);
      if (action === "reject-post") await rejectPost(btn.dataset.id);
      if (action === "dismiss-report") await dismissReport(btn.dataset.id);
      if (action === "delete-reported")
        await deleteReported(btn.dataset.report, btn.dataset.post);
      if (action === "verify-approve") await resolveVerification(btn.dataset.id, "approved");
      if (action === "verify-deny") await resolveVerification(btn.dataset.id, "rejected");
      if (action === "username-approve")
        await approveUsername(btn.dataset.id, btn.dataset.uid, btn.dataset.user, btn.dataset.email);
      if (action === "username-deny") await denyUsername(btn.dataset.id);
      if (action === "name-approve")
        await approveDisplayName(btn.dataset.id, btn.dataset.uid, btn.dataset.value);
      if (action === "name-deny") await denyDisplayName(btn.dataset.id);
    } catch (err) {
      showToast(err?.message || "Action failed");
    }
  });

  $("team-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!state.isAdmin) return;
    try {
      await saveTeamEmails($("team-emails").value);
    } catch (err) {
      showToast(err?.message || "Could not save");
    }
  });
}

checkViewport();
bindUi();
onAuthStateChanged(auth, (user) => void handleAuth(user));
