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
    err.httpStatus = res.status;
    throw err;
  }
  return normalizeEarlyAccessResult(body);
}

/** Website signup via Firebase callable (SDK handles CORS from unrestdu.in). */
export function createSubmitEarlyAccess({ functions, httpsCallable }) {
  const submitCallable = httpsCallable(functions, "submitEarlyAccess");

  return async function submitEarlyAccessPayload(payload) {
    const res = await submitCallable(payload);
    return normalizeEarlyAccessResult(res.data);
  };
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  const submitFn = createSubmitEarlyAccess({ functions, httpsCallable });
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
    pendingEmail = "";
    pendingName = "";
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
        "Gmail only · reviewed by moderators before code is emailed";
      document.getElementById("ea-proof-block").style.display = "none";
    } else {
      showStep("form");
      document.getElementById("ea-email").placeholder = "you@college.du.ac.in or Gmail";
      document.getElementById("ea-email-hint").textContent =
        "@du.ac.in = moderator review · Gmail = upload affiliation proof";
      document.getElementById("ea-proof-block").style.display = "none";
    }
    if (statusEl) statusEl.textContent = "";
  }

  window.closeEarlyAccessModal = function () {
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
    showStep("type");
    pendingRequestId = null;
    pendingEmail = "";
    pendingName = "";
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

    // If user changed email/type between attempts, never reuse old pending email state.
    if (pendingEmail && pendingEmail !== email) {
      pendingRequestId = null;
      pendingEmail = "";
      pendingName = "";
    }
    if (!needsProof) {
      pendingRequestId = null;
      pendingEmail = "";
      pendingName = "";
    }

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
            showSuccess(first.message);
            return;
          }
        }
        proofUrls = await uploadProofs(pendingRequestId, proofInput.files);
      }

      const submitEmail = needsProof ? pendingEmail || email : email;
      const submitName = needsProof ? pendingName || fullName : fullName;

      const data = await submitFn({
        type: selectedType,
        email: submitEmail,
        fullName: submitName,
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
        btn.textContent = "Submit proof for review";
        return;
      }

      showSuccess(data.message);
    } catch (err) {
      const code = err?.code || "";
      let msg = err?.message || err?.details || "";
      const isNetwork =
        /failed to fetch|networkerror|load failed|cors/i.test(String(msg)) ||
        err?.httpStatus === 403 ||
        (err?.name === "FirebaseError" && !code && /fetch/i.test(String(msg)));
      if (isNetwork) {
        msg =
          "Could not reach the signup server. Try again in a minute, disable ad blockers for this site, or email contact@unrestdu.in with your name and email.";
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
      if (btn.textContent === "Sending…") btn.textContent = "Request access review";
    }
  };

  function showSuccess(message) {
    showStep("done");
    const doneText = document.getElementById("ea-done-text");
    const codeBox = document.getElementById("ea-code-display");

    if (doneText) {
      doneText.textContent = message;
    }

    if (codeBox) {
      codeBox.style.display = "none";
      codeBox.innerHTML = "";
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
      const res = await approveFn({ requestId });
      const emailed = res?.data?.emailed === true;
      alert(emailed ? "Code issued and emailed." : "Code issued, but email delivery failed.");
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
      where("status", "in", ["pending_affiliation", "pending_review"])
    );
    onSnapshot(q, (snap) => {
      const container = document.getElementById("ea-mod-container");
      if (!container) return;
      let html = "";
      snap.forEach((docSnap) => {
        const p = docSnap.data();
        const typeLabel =
          p.type === "aspirant"
            ? "DU aspirant"
            : p.emailChannel === "du_ac_in"
              ? "DU student (official email)"
              : "DU student (Gmail + proof)";
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
              <div class="mod-info-text">${typeLabel} · ${proofs || "No proof files"}</div>
            </div>
            <div class="mod-actions">
              <button class="btn-approve" onclick="approveEarlyAccess('${docSnap.id}')">Approve & email code</button>
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

  if (typeof window.registerEarlyAccessHandlers === "function") {
    window.registerEarlyAccessHandlers({
      startEarlyAccess: window.startEarlyAccess,
      closeEarlyAccessModal: window.closeEarlyAccessModal,
      pickEarlyAccessType: window.pickEarlyAccessType,
      submitEarlyAccessForm: window.submitEarlyAccessForm,
      approveEarlyAccess: window.approveEarlyAccess,
      rejectEarlyAccess: window.rejectEarlyAccess,
      watchEarlyAccessQueue: window.watchEarlyAccessQueue,
    });
  }
}
