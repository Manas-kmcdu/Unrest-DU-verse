/**
 * Website ↔ app early access (Cloud Functions + Storage).
 * Deploy with index.html on unrestdu.in.
 */

export function isDuAcInEmail(email) {
  const domain = (email.split("@")[1] || "").toLowerCase();
  return domain === "du.ac.in" || domain.endsWith(".du.ac.in");
}

export function isGmail(email) {
  const domain = (email.split("@")[1] || "").toLowerCase();
  return domain === "gmail.com" || domain === "googlemail.com";
}

/** Website signup (plain HTTP — avoids callable CORS / Cloud Run IAM issues). */
export const SUBMIT_EARLY_ACCESS_URL =
  "https://asia-south1-du-verse-e75db.cloudfunctions.net/submitEarlyAccessWeb";

/** Normalize callable `{ data }` or HTTP JSON body. */
export function normalizeEarlyAccessResult(raw) {
  const payload = raw?.data ?? raw ?? {};
  const codeId = payload.codeId ?? payload.code_id ?? null;
  return {
    status: payload.status,
    message: payload.message ?? "",
    codeId: codeId ? String(codeId).trim() : null,
    requestId: payload.requestId ?? payload.request_id ?? null,
  };
}

export async function postSubmitEarlyAccess(payload) {
  const res = await fetch(SUBMIT_EARLY_ACCESS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let body = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const err = new Error(body.message || body.error || "Request failed");
    err.code = body.error ? `functions/${body.error}` : "";
    throw err;
  }
  return normalizeEarlyAccessResult(body);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const ACCESS_CODE_RE = /\b(EA-[A-Z]+-[A-F0-9]{4}-[A-F0-9]{4})\b/i;

function codeFromMessage(message) {
  const m = String(message || "").match(ACCESS_CODE_RE);
  return m ? m[1].toUpperCase() : null;
}

export function initEarlyAccessUI({
  db,
  storage,
  functions,
  httpsCallable,
  collection,
  query,
  where,
  onSnapshot,
}) {
  const submitFn = postSubmitEarlyAccess;
  const approveFn = httpsCallable(functions, "approveEarlyAccessRequest");
  const rejectFn = httpsCallable(functions, "rejectEarlyAccessRequest");

  const modal = document.getElementById("ea-modal");
  const stepType = document.getElementById("ea-step-type");
  const stepForm = document.getElementById("ea-step-form");
  const stepProof = document.getElementById("ea-step-proof");
  const stepDone = document.getElementById("ea-step-done");
  const statusEl = document.getElementById("ea-status");
  const titleEl = document.getElementById("ea-title");

  let selectedType = null;
  let pendingRequestId = null;
  let pendingEmail = "";
  let pendingName = "";

  function showStep(step) {
    [stepType, stepForm, stepProof, stepDone].forEach((el) => {
      if (el) el.style.display = "none";
    });
    if (step === "type" && stepType) stepType.style.display = "block";
    if (step === "form" && stepForm) stepForm.style.display = "block";
    if (step === "proof" && stepProof) stepProof.style.display = "block";
    if (step === "done" && stepDone) stepDone.style.display = "block";
  }

  function openModal(type) {
    selectedType = type;
    pendingRequestId = null;
    if (modal) modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    if (titleEl) {
      titleEl.textContent =
        type === "aspirant" ? "Early access — DU aspirant" : "Early access — DU student";
    }
    if (type === "aspirant") {
      showStep("form");
      document.getElementById("ea-email").placeholder = "you@gmail.com";
      document.getElementById("ea-email-hint").textContent =
        "Gmail only · one code per person";
      document.getElementById("ea-proof-block").style.display = "none";
    } else {
      showStep("form");
      document.getElementById("ea-email").placeholder = "you@college.du.ac.in or Gmail";
      document.getElementById("ea-email-hint").textContent =
        "@du.ac.in = instant code · Gmail = upload affiliation proof";
      document.getElementById("ea-proof-block").style.display = "none";
    }
    if (statusEl) statusEl.textContent = "";
  }

  window.closeEarlyAccessModal = function () {
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
    showStep("type");
  };

  window.startEarlyAccess = function (source, presetType) {
    const emailFromHero =
      source === "hero"
        ? document.getElementById("hero-email")?.value?.trim().toLowerCase()
        : document.getElementById("waitlist-email")?.value?.trim().toLowerCase();

    if (presetType) {
      openModal(presetType);
      if (emailFromHero) document.getElementById("ea-email").value = emailFromHero;
      return;
    }

    if (modal) modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    showStep("type");
    if (emailFromHero) {
      openModal(isDuAcInEmail(emailFromHero) ? "du_student" : "du_student");
      document.getElementById("ea-email").value = emailFromHero;
    }
  };

  window.pickEarlyAccessType = function (type) {
    openModal(type);
  };

  async function uploadProofs(requestId, files) {
    const { ref, uploadBytes, getDownloadURL } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js"
    );
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `early_access_proofs/${requestId}/${Date.now()}_${i}.jpg`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, { contentType: file.type || "image/jpeg" });
      urls.push(await getDownloadURL(storageRef));
    }
    return urls;
  }

  window.submitEarlyAccessForm = async function () {
    const email = document.getElementById("ea-email").value.trim().toLowerCase();
    const fullName = document.getElementById("ea-name").value.trim();
    const btn = document.getElementById("ea-submit-btn");
    const proofInput = document.getElementById("ea-proof-files");

    if (!email || !email.includes("@")) {
      if (statusEl) statusEl.textContent = "Enter a valid email.";
      return;
    }
    if (fullName.length < 2) {
      if (statusEl) statusEl.textContent = "Enter your full name.";
      return;
    }

    if (selectedType === "aspirant" && !isGmail(email)) {
      if (statusEl) statusEl.textContent = "Aspirant access requires a Gmail address.";
      return;
    }

    const needsProof =
      selectedType === "du_student" && !isDuAcInEmail(email) && isGmail(email);

    if (needsProof && proofInput.files.length === 0 && !pendingRequestId) {
      document.getElementById("ea-proof-block").style.display = "block";
      if (statusEl)
        statusEl.textContent = "Add at least one photo (ID, fee slip, or selfie with college).";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Sending…";
    if (statusEl) statusEl.textContent = "";

    try {
      let proofUrls = [];
      if (needsProof && proofInput.files.length > 0) {
        if (!pendingRequestId) {
          const first = await submitFn({
            type: selectedType,
            email,
            fullName,
            proofUrls: [],
          });
          if (first.status === "awaiting_proof") {
            pendingRequestId = first.requestId;
            pendingEmail = email;
            pendingName = fullName;
          } else if (first.status === "code_sent") {
            showSuccess(first.message, first.codeId);
            return;
          }
        }
        proofUrls = await uploadProofs(pendingRequestId, proofInput.files);
      }

      const data = await submitFn({
        type: selectedType,
        email: pendingEmail || email,
        fullName: pendingName || fullName,
        proofUrls,
      });

      if (data.status === "awaiting_proof") {
        pendingRequestId = data.requestId;
        pendingEmail = email;
        pendingName = fullName;
        showStep("proof");
        document.getElementById("ea-proof-block").style.display = "block";
        if (statusEl) statusEl.textContent = data.message;
        btn.disabled = false;
        btn.textContent = "Submit proof & request code";
        return;
      }

      showSuccess(data.message, data.codeId);
    } catch (err) {
      const code = err?.code || "";
      let msg = err?.message || err?.details || "";
      const isNetwork =
        /failed to fetch|networkerror|load failed|cors/i.test(String(msg)) ||
        (err?.name === "FirebaseError" && !code && /fetch/i.test(String(msg)));
      if (isNetwork) {
        msg =
          "Could not reach the signup server (connection blocked). Try again in a minute, or email contact@unrestdu.in with your name and email.";
      } else if (
        code === "functions/internal" ||
        code === "functions/not-found" ||
        code === "functions/unavailable" ||
        /^internal$/i.test(String(msg))
      ) {
        msg =
          "Signup server error. Try again, or email contact@unrestdu.in with your name and email — we will send your code manually within 24h.";
      } else if (code === "functions/already-exists") {
        msg = err.message || msg;
      } else if (code === "functions/invalid-argument") {
        msg = err.message || msg;
      } else if (!msg || /^internal$/i.test(String(msg))) {
        msg = "Something went wrong. Email contact@unrestdu.in with your name and email.";
      }
      if (statusEl) statusEl.textContent = String(msg).replace(/^FirebaseError:\s*/i, "");
    } finally {
      btn.disabled = false;
      if (btn.textContent === "Sending…") btn.textContent = "Get my access code";
    }
  };

  function showSuccess(message, codeId) {
    showStep("done");
    const doneText = document.getElementById("ea-done-text");
    const codeBox = document.getElementById("ea-code-display");
    const code = String(codeId || codeFromMessage(message) || "").trim();

    const codeBlockHtml = code
      ? `<div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--ink3);margin-bottom:6px">Your access code</div><div id="ea-code-value" style="font-family:monospace;font-size:1.35rem;font-weight:700;color:var(--accent);letter-spacing:0.06em;margin:4px 0 8px">${escapeHtml(code)}</div><button type="button" id="ea-copy-code" style="font-size:0.8rem;font-weight:600;padding:8px 14px;border-radius:8px;border:1px solid var(--accent);background:transparent;color:var(--accent);cursor:pointer">Copy code</button><div style="font-size:0.78rem;color:var(--ink3);margin-top:10px">Open the Unrest app → enter this code → sign in with the same email.</div>`
      : "";

    if (doneText) {
      if (code && codeBox) {
        doneText.textContent = message.replace(ACCESS_CODE_RE, "").trim() || "You're in — use your code below.";
      } else if (code) {
        doneText.innerHTML = `<p style="margin:0 0 12px">${escapeHtml(message)}</p>${codeBlockHtml}`;
      } else {
        doneText.textContent = message;
      }
    }

    if (codeBox) {
      if (code) {
        codeBox.style.display = "block";
        codeBox.innerHTML = codeBlockHtml;
        const copyBtn = document.getElementById("ea-copy-code");
        if (copyBtn) {
          copyBtn.onclick = () => {
            void navigator.clipboard.writeText(code).then(() => {
              copyBtn.textContent = "Copied!";
              setTimeout(() => {
                copyBtn.textContent = "Copy code";
              }, 2000);
            });
          };
        }
      } else {
        codeBox.style.display = "none";
        codeBox.innerHTML = "";
      }
    }
    if (statusEl) statusEl.textContent = "";
    document.querySelectorAll(".hero-form, .waitlist-form").forEach((el) => {
      el.style.display = "none";
    });
    document.querySelectorAll(".success-msg").forEach((el) => {
      el.style.display = "block";
    });
  }

  window.approveEarlyAccess = async function (requestId) {
    try {
      await approveFn({ requestId });
      alert("Code issued and emailed.");
    } catch (e) {
      alert("Approve failed: " + (e.message || e));
    }
  };

  window.rejectEarlyAccess = async function (requestId) {
    if (!confirm("Reject this affiliation request?")) return;
    try {
      await rejectFn({ requestId });
      alert("Request rejected.");
    } catch (e) {
      alert("Reject failed: " + (e.message || e));
    }
  };

  window.watchEarlyAccessQueue = function () {
    const q = query(
      collection(db, "early_access_requests"),
      where("status", "==", "pending_affiliation")
    );
    onSnapshot(q, (snap) => {
      const container = document.getElementById("ea-mod-container");
      if (!container) return;
      let html = "";
      snap.forEach((docSnap) => {
        const p = docSnap.data();
        const proofs = (p.proofUrls || [])
          .map(
            (u) =>
              `<a href="${u}" target="_blank" rel="noopener" style="color:var(--accent);font-size:0.75rem">View proof</a>`
          )
          .join(" · ");
        html += `
          <div class="mod-item">
            <div class="mod-info">
              <div class="mod-info-college">${p.fullName || "—"} · ${p.email}</div>
              <div class="mod-info-text">Gmail DU student · ${proofs || "No files"}</div>
            </div>
            <div class="mod-actions">
              <button class="btn-approve" onclick="approveEarlyAccess('${docSnap.id}')">Send code</button>
              <button class="btn-reject" onclick="rejectEarlyAccess('${docSnap.id}')">Reject</button>
            </div>
          </div>`;
      });
      container.innerHTML =
        html ||
        '<div style="font-size:0.8rem;color:#888;">No affiliation reviews pending.</div>';
      const badge = document.getElementById("ea-mod-count");
      if (badge) badge.textContent = `${snap.size} Pending`;
    });
  };
}
