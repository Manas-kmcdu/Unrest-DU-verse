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

/** Same-origin proxy (Firebase Hosting rewrite) — no browser CORS preflight. */
export const SAME_ORIGIN_SUBMIT_URL = "/api/early-access";

/** Direct Cloud Function URL (fallback when not on Firebase Hosting). */
export const SUBMIT_EARLY_ACCESS_URL =
  "https://asia-south1-du-verse-e75db.cloudfunctions.net/submitEarlyAccessWeb";

function isNetworkOrCorsError(err) {
  const msg = String(err?.message || "");
  return (
    /failed to fetch|cors|networkerror|load failed|ERR_FAILED/i.test(msg) ||
    err?.httpStatus === 403 ||
    err?.name === "TypeError"
  );
}

function shouldTryNextSubmitUrl(err) {
  return isNetworkOrCorsError(err) || err?.httpStatus === 500 || err?.httpStatus === 502 || err?.httpStatus === 503 || err?.httpStatus === 504;
}

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

async function postSubmitEarlyAccessOnce(payload, url) {
  const res = await fetch(url, {
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

/** Website signup via HTTP POST (same-origin proxy first, then direct function URL). */
export async function postSubmitEarlyAccess(payload) {
  const urls = [SAME_ORIGIN_SUBMIT_URL, SUBMIT_EARLY_ACCESS_URL];
  let lastErr;
  for (const url of urls) {
    try {
      return await postSubmitEarlyAccessOnce(payload, url);
    } catch (err) {
      lastErr = err;
      if (url === SAME_ORIGIN_SUBMIT_URL && shouldTryNextSubmitUrl(err)) continue;
      throw err;
    }
  }
  throw lastErr;
}

/** HTTP first; Firebase callable as last resort if cross-origin is blocked. */
export function createSubmitEarlyAccess({ functions, httpsCallable }) {
  const submitCallable = httpsCallable(functions, "submitEarlyAccess", { timeout: 120000 });

  return async function submitEarlyAccessPayload(payload) {
    try {
      return await postSubmitEarlyAccess(payload);
    } catch (httpErr) {
      if (!isNetworkOrCorsError(httpErr)) throw httpErr;
      const res = await submitCallable(payload);
      return normalizeEarlyAccessResult(res.data);
    }
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
        const badHeic = Array.from(proofInput.files).find(
          (f) =>
            /\.heic$/i.test(f.name) || f.type === "image/heic" || f.type === "image/heif"
        );
        if (badHeic) {
          if (statusEl)
            statusEl.textContent =
              "HEIC photos are not supported. In Photos, share as JPEG or take a screenshot, then upload again.";
          btn.disabled = false;
          btn.textContent = "Request access review";
          return;
        }

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
        /failed to fetch|networkerror|load failed|cors|ERR_FAILED/i.test(String(msg)) ||
        err?.httpStatus === 403 ||
        (err?.name === "FirebaseError" && !code && /fetch/i.test(String(msg))) ||
        err?.name === "TypeError";
      if (isNetwork) {
        msg =
          "Could not reach the signup server (connection blocked). Deploy the site via Firebase Hosting with the /api/early-access proxy, or allow public access on submitEarlyAccessWeb in Cloud Run. You can also email contact@unrestdu.in with your name and email.";
      } else if (err?.httpStatus === 500 || err?.httpStatus === 502 || err?.httpStatus === 503) {
        msg =
          "Signup server is temporarily unavailable. Wait a minute and try again, or email contact@unrestdu.in with your name and email.";
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
    const reviewMessage =
      message ||
      "Request received. A moderator will review it and email your code. Use the same email in the app.";
    showStep("done");
    const doneText = document.getElementById("ea-done-text");
    const codeBox = document.getElementById("ea-code-display");

    if (doneText) {
      doneText.textContent = reviewMessage;
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

  if (typeof window.registerEarlyAccessHandlers === "function") {
    window.registerEarlyAccessHandlers({
      startEarlyAccess: window.startEarlyAccess,
      closeEarlyAccessModal: window.closeEarlyAccessModal,
      pickEarlyAccessType: window.pickEarlyAccessType,
      submitEarlyAccessForm: window.submitEarlyAccessForm,
    });
  }
}
