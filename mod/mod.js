import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";
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
const functions = getFunctions(app, "asia-south1");
const approveEarlyAccessFn = httpsCallable(functions, "approveEarlyAccessRequest");
const rejectEarlyAccessFn = httpsCallable(functions, "rejectEarlyAccessRequest");
const runLaunchEmailBatchFn = httpsCallable(functions, "adminRunLaunchEmailBatch");
const previewLaunchEmailFn = httpsCallable(functions, "adminPreviewLaunchEmail");
const FOUNDER_STORAGE_KEY = "unrest_founders_office_items_v1";
const FOUNDER_LANES = ["tasks", "references", "ideas", "notes"];

const state = {
  user: null,
  isAdmin: false,
  canModerate: false,
  pendingPosts: [],
  openReports: [],
  verifications: [],
  usernames: [],
  profileChanges: [],
  earlyAccessRequests: [],
  teamApplications: [],
  founderItems: [],
  selectedFounderItemId: null,
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

function parseFounderItems(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      id: String(item?.id || ""),
      lane: FOUNDER_LANES.includes(item?.lane) ? item.lane : "notes",
      title: String(item?.title || "").trim(),
      details: String(item?.details || "").trim(),
      link: typeof item?.link === "string" ? item.link.trim() : "",
      priority: item?.priority === "high" || item?.priority === "low" ? item.priority : "medium",
      done: item?.done === true,
      updatedAt: Number(item?.updatedAt || Date.now()),
      createdAt: Number(item?.createdAt || Date.now()),
      author: typeof item?.author === "string" ? item.author : null,
    }))
    .filter((item) => item.id && item.title);
}

function laneLabel(lane) {
  if (lane === "tasks") return "Priority tasks";
  if (lane === "references") return "References";
  if (lane === "ideas") return "Ideas";
  return "Notes";
}

function laneClass(lane) {
  if (lane === "tasks") return "lane-tasks";
  if (lane === "references") return "lane-references";
  if (lane === "ideas") return "lane-ideas";
  return "lane-notes";
}

function priorityRank(priority) {
  if (priority === "high") return 0;
  if (priority === "medium") return 1;
  return 2;
}

function priorityLabel(priority) {
  if (priority === "high") return "High";
  if (priority === "medium") return "Medium";
  return "Low";
}

function loadFounderFromLocalStorage() {
  try {
    const raw = localStorage.getItem(FOUNDER_STORAGE_KEY);
    if (!raw) return [];
    return parseFounderItems(JSON.parse(raw));
  } catch {
    return [];
  }
}

function persistFounderToLocalStorage(items) {
  try {
    localStorage.setItem(FOUNDER_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota/local storage restrictions */
  }
}

async function saveFounderItems(nextItems) {
  state.founderItems = [...nextItems].sort((a, b) => b.updatedAt - a.updatedAt);
  persistFounderToLocalStorage(state.founderItems);
  renderFounderOffice();

  if (!state.isAdmin) return;
  await setDoc(
    doc(db, "app_config", "founders_office"),
    {
      items: state.founderItems,
      updatedAt: serverTimestamp(),
      updatedBy: state.user?.email || null,
    },
    { merge: true }
  );
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

  state.unsubs.push(
    onSnapshot(
      query(
        collection(db, "early_access_requests"),
        where("status", "in", ["pending_affiliation", "pending_review"])
      ),
      (snap) => {
        state.earlyAccessRequests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        renderProfileSections();
      }
    )
  );

  state.unsubs.push(
    onSnapshot(
      query(collection(db, "team_applications"), orderBy("createdAt", "desc")),
      (snap) => {
        state.teamApplications = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        renderProfileSections();
      },
      () => {
        state.teamApplications = [];
        renderProfileSections();
      }
    )
  );

  if (state.isAdmin) {
    state.unsubs.push(
      onSnapshot(
        doc(db, "app_config", "founders_office"),
        (snap) => {
          const data = snap.data();
          const next = parseFounderItems(data?.items);
          if (next.length > 0 || state.founderItems.length === 0) {
            state.founderItems = next;
            persistFounderToLocalStorage(next);
            renderFounderOffice();
          }
        },
        () => {
          // Keep local board if Firestore permission/index is unavailable.
          state.founderItems = loadFounderFromLocalStorage();
          renderFounderOffice();
        }
      )
    );
  }
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

  const eaEl = $("profile-early-access");
  if (!state.isAdmin) {
    eaEl.innerHTML =
      '<p class="empty">Early access approvals are restricted to admin accounts.</p>';
    return;
  }
  eaEl.innerHTML = `
    <section class="launch-email-panel">
      <h2 class="launch-email-title">Launch day email drafts</h2>
      <p class="panel-desc">
        Creates <strong>Gmail drafts</strong> in <code>contact@unrestdu.in</code> — nothing sends automatically.
        Each draft greets the user by name (<code>Hi Full Name,</code>). Review in Drafts, then send manually.
      </p>
      <div class="launch-email-actions">
        <button type="button" class="btn" data-action="launch-email-preview">Preview draft to my inbox</button>
        <button type="button" class="btn" data-action="launch-email-dry-run">Dry run (count only)</button>
        <button type="button" class="btn btn-primary" data-action="launch-email-send">Create all drafts</button>
      </div>
      <p id="launch-email-status" class="team-status"></p>
    </section>
    ${
      state.earlyAccessRequests.length === 0
        ? `<p class="empty">No pending early access approvals.</p>`
        : state.earlyAccessRequests
            .map((r) => {
              const proofs = Array.isArray(r.proofUrls)
                ? r.proofUrls
                    .map(
                      (u, i) =>
                        `<a href="${escapeHtml(u)}" target="_blank" rel="noopener">Proof ${i + 1}</a>`
                    )
                    .join(" · ")
                : "";
              const channel = r.emailChannel || (r.type === "aspirant" ? "gmail" : "unknown");
              return `<article class="card">
        <div class="card-meta"><strong>${escapeHtml(r.fullName || "Student")}</strong> · ${escapeHtml(r.email || "")}</div>
        <p class="card-body">
          Type: ${escapeHtml(r.type || "du_student")} · Channel: ${escapeHtml(channel)} · Status: ${escapeHtml(r.status || "pending")}
          ${proofs ? `<br/>${proofs}` : ""}
        </p>
        <div class="card-actions">
          <button type="button" class="btn btn-primary" data-action="early-access-approve" data-id="${escapeHtml(r.id)}">Approve & send code</button>
          <button type="button" class="btn btn-danger" data-action="early-access-reject" data-id="${escapeHtml(r.id)}">Reject</button>
        </div>
      </article>`;
            })
            .join("")
    }`;

  const joinEl = $("profile-join-us");
  if (joinEl) {
    joinEl.innerHTML =
      state.teamApplications.length === 0
        ? `<p class="empty">No Join Us applications yet.</p>`
        : state.teamApplications
            .map((app) => {
              const why = app.whyJoin || app.why || "—";
              const bring = app.bringToTeam || app.bring || "—";
              return `<article class="card">
        <div class="card-meta"><strong>${escapeHtml(app.name || "Applicant")}</strong> · ${escapeHtml(app.email || "")}</div>
        <div class="card-meta">${escapeHtml(app.college || "")} · ${escapeHtml(app.course || "")} · ${formatTs(app.createdAt)}</div>
        <p class="card-body"><strong>Why join:</strong> ${escapeHtml(why)}</p>
        <p class="card-body"><strong>Brings:</strong> ${escapeHtml(bring)}</p>
        <div class="card-actions">
          <button type="button" class="btn btn-danger" data-action="dismiss-team-app" data-id="${escapeHtml(app.id)}">Dismiss</button>
        </div>
      </article>`;
            })
            .join("");
  }
}

function renderFounderOffice() {
  const panel = $("panel-founder");
  if (!panel) return;
  const gridEl = $("fo-wall-grid");
  if (!gridEl) return;
  const capacity = 40;
  const sortedItems = [...state.founderItems].sort((a, b) => {
    const pa = priorityRank(a.priority);
    const pb = priorityRank(b.priority);
    if (pa !== pb) return pa - pb;
    if (a.done !== b.done) return a.done ? 1 : -1;
    return b.updatedAt - a.updatedAt;
  });

  const visibleItems = sortedItems.slice(0, capacity);
  const capEl = $("fo-capacity");
  if (capEl) capEl.textContent = `${visibleItems.length} / ${capacity}`;

  gridEl.innerHTML = Array.from({ length: capacity }, (_, idx) => {
    const item = visibleItems[idx];
    if (!item) return `<div class="fo-slot empty" aria-hidden="true"></div>`;
    const lane = laneLabel(item.lane);
    return `<div class="fo-slot">
      <button type="button" class="postit ${laneClass(item.lane)} pin-${escapeHtml(item.priority)} ${item.done ? "done" : ""}" data-action="founder-open-detail" data-id="${escapeHtml(item.id)}" title="${escapeHtml(item.title)}">
        <span class="postit-pin"></span>
        <p class="postit-title">${escapeHtml(item.title)}</p>
        <span class="postit-meta">${escapeHtml(lane)} · ${escapeHtml(priorityLabel(item.priority))}</span>
      </button>
    </div>`;
  }).join("");
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

async function dismissTeamApplication(id) {
  await deleteDoc(doc(db, "team_applications", id));
  showToast("Application dismissed");
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

async function approveEarlyAccess(requestId) {
  if (!state.isAdmin) throw new Error("Admin only");
  const result = await approveEarlyAccessFn({ requestId });
  const email = result?.data?.email || "";
  const drafted = result?.data?.drafted === true || result?.data?.emailed === true;
  if (drafted) {
    showToast(email ? `Draft created for ${email} — check Gmail Drafts` : "Code issued — draft in Gmail");
  } else {
    showToast(email ? `Code created for ${email}, but draft failed — see Firestore email_drafts` : "Code created, but draft failed");
  }
}

async function rejectEarlyAccess(requestId) {
  if (!state.isAdmin) throw new Error("Admin only");
  await rejectEarlyAccessFn({ requestId });
  showToast("Early access request rejected");
}

async function previewLaunchEmail() {
  if (!state.isAdmin) throw new Error("Admin only");
  const statusEl = $("launch-email-status");
  if (statusEl) statusEl.textContent = "Sending preview…";
  const result = await previewLaunchEmailFn({});
  if (statusEl) {
    statusEl.textContent = result?.data?.ok
      ? `Preview draft created for ${result.data.to} — check Gmail Drafts`
      : "Preview draft failed — check IMAP is enabled for the mailbox";
  }
  showToast(result?.data?.ok ? "Preview draft in Gmail" : "Preview failed");
}

async function runLaunchEmailBatch(dryRun) {
  if (!state.isAdmin) throw new Error("Admin only");
  if (
    !dryRun &&
    !confirm(
      "Create launch email drafts in Gmail for everyone with a code? Nothing sends automatically. Already-drafted addresses are skipped."
    )
  ) {
    return;
  }
  const statusEl = $("launch-email-status");
  if (statusEl) statusEl.textContent = dryRun ? "Counting…" : "Creating drafts… this can take a few minutes";
  const result = await runLaunchEmailBatchFn({ dryRun });
  const data = result?.data ?? {};
  const drafted = data.liveDrafted ?? data.drafted ?? data.liveSent ?? 0;
  const summary = dryRun
    ? `Dry run: ${data.approved ?? 0} to approve · ${drafted} drafts would be created · ${data.liveSkipped ?? 0} already drafted`
    : `Done: ${data.approved ?? 0} approved · ${drafted} drafts created · ${data.liveFailed ?? 0} failed · ${data.liveSkipped ?? 0} skipped`;
  if (statusEl) statusEl.textContent = summary;
  showToast(dryRun ? "Dry run complete" : "Draft batch finished — open Gmail Drafts");
}

async function addFounderItemFromForm() {
  if (!state.isAdmin) throw new Error("Admin only");
  const lane = $("fo-lane").value;
  const title = $("fo-title").value.trim();
  const details = $("fo-details").value.trim();
  const link = $("fo-link").value.trim();
  const priority = $("fo-priority").value;

  if (!title) throw new Error("Title is required");
  if (!FOUNDER_LANES.includes(lane)) throw new Error("Invalid board lane");
  if (!["high", "medium", "low"].includes(priority)) throw new Error("Invalid priority");

  const now = Date.now();
  const next = [
    ...state.founderItems,
    {
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      lane,
      title,
      details,
      link,
      priority,
      done: false,
      updatedAt: now,
      createdAt: now,
      author: state.user?.email || null,
    },
  ];
  await saveFounderItems(next);
  $("fo-title").value = "";
  $("fo-details").value = "";
  $("fo-link").value = "";
  $("founder-status").textContent = "Saved";
}

async function toggleFounderDone(id) {
  const next = state.founderItems.map((item) =>
    item.id === id ? { ...item, done: !item.done, updatedAt: Date.now() } : item
  );
  await saveFounderItems(next);
  const selected = state.selectedFounderItemId;
  if (selected === id) openFounderDetail(id);
}

async function editFounderItem(id) {
  const item = state.founderItems.find((row) => row.id === id);
  if (!item) return;
  const title = prompt("Update title", item.title);
  if (title == null) return;
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    showToast("Title cannot be empty");
    return;
  }
  const details = prompt("Update details", item.details || "");
  if (details == null) return;
  const link = prompt("Reference link (optional)", item.link || "");
  if (link == null) return;
  const priority = prompt("Priority: high, medium, low", item.priority || "medium");
  if (priority == null) return;
  const normalizedPriority = priority.trim().toLowerCase();
  if (!["high", "medium", "low"].includes(normalizedPriority)) {
    showToast("Priority must be high, medium, or low");
    return;
  }
  const next = state.founderItems.map((row) =>
    row.id === id
      ? {
          ...row,
          title: trimmedTitle,
          details: details.trim(),
          link: link.trim(),
          priority: normalizedPriority,
          updatedAt: Date.now(),
        }
      : row
  );
  await saveFounderItems(next);
  openFounderDetail(id);
}

async function deleteFounderItem(id) {
  if (!confirm("Remove this item from Founder's Office?")) return;
  const next = state.founderItems.filter((item) => item.id !== id);
  await saveFounderItems(next);
  closeFounderDetail();
}

function closeFounderDetail() {
  state.selectedFounderItemId = null;
  const modal = $("fo-detail-modal");
  if (modal) modal.hidden = true;
}

function openFounderDetail(id) {
  const item = state.founderItems.find((row) => row.id === id);
  if (!item) return;
  state.selectedFounderItemId = id;
  const modal = $("fo-detail-modal");
  if (!modal) return;
  const priorityEl = $("fo-detail-priority");
  priorityEl.className = `founder-priority ${item.priority}`;
  priorityEl.textContent = priorityLabel(item.priority);
  $("fo-detail-lane").textContent = laneLabel(item.lane);
  $("fo-detail-title").textContent = item.title;
  $("fo-detail-body").textContent = item.details || "No details added yet.";
  $("fo-detail-updated").textContent = `Updated ${formatTs(item.updatedAt)}`;
  const linkEl = $("fo-detail-link");
  if (item.link) {
    linkEl.hidden = false;
    linkEl.href = item.link;
  } else {
    linkEl.hidden = true;
    linkEl.removeAttribute("href");
  }
  $("fo-detail-done-btn").textContent = item.done ? "Mark open" : "Mark done";
  modal.hidden = false;
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
  state.founderItems = loadFounderFromLocalStorage();
  renderFounderOffice();
  document.querySelectorAll(".nav-admin").forEach((el) => {
    el.hidden = !state.isAdmin;
  });
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
  const founderForm = $("founder-form");
  if (founderForm) {
    founderForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await addFounderItemFromForm();
        showToast("Board updated");
      } catch (err) {
        $("founder-status").textContent = "";
        showToast(err?.message || "Could not save item");
      }
    });
  }

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
      if (action === "early-access-approve") await approveEarlyAccess(btn.dataset.id);
      if (action === "early-access-reject") await rejectEarlyAccess(btn.dataset.id);
      if (action === "launch-email-preview") await previewLaunchEmail();
      if (action === "launch-email-dry-run") await runLaunchEmailBatch(true);
      if (action === "launch-email-send") await runLaunchEmailBatch(false);
      if (action === "dismiss-team-app") await dismissTeamApplication(btn.dataset.id);
      if (action === "founder-toggle-done") await toggleFounderDone(btn.dataset.id);
      if (action === "founder-edit") await editFounderItem(btn.dataset.id);
      if (action === "founder-delete") await deleteFounderItem(btn.dataset.id);
      if (action === "founder-open-detail") openFounderDetail(btn.dataset.id);
      if (action === "founder-close-detail") closeFounderDetail();
      if (action === "founder-detail-toggle-done" && state.selectedFounderItemId)
        await toggleFounderDone(state.selectedFounderItemId);
      if (action === "founder-detail-edit" && state.selectedFounderItemId)
        await editFounderItem(state.selectedFounderItemId);
      if (action === "founder-detail-delete" && state.selectedFounderItemId)
        await deleteFounderItem(state.selectedFounderItemId);
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
