import "./firebase.js";

const { db, collection, addDoc, serverTimestamp } = window.__firebase;

const form = document.getElementById("join-us-form");
const statusEl = document.getElementById("ju-status");
const submitBtn = document.getElementById("ju-submit");

function setStatus(message, kind = "") {
  statusEl.textContent = message;
  statusEl.className = "ju-status" + (kind ? ` ${kind}` : "");
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("Sending…");
  if (submitBtn) submitBtn.disabled = true;
  const fd = new FormData(form);
  try {
    await addDoc(collection(db, "team_applications"), {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim().toLowerCase(),
      college: String(fd.get("college") ?? "").trim(),
      course: String(fd.get("course") ?? "").trim(),
      whyJoin: String(fd.get("whyJoin") ?? "").trim(),
      bringToTeam: String(fd.get("bringToTeam") ?? "").trim(),
      source: new URLSearchParams(location.search).get("source") === "app" ? "app_banner" : "website",
      createdAt: serverTimestamp(),
    });
    setStatus("Thanks — we received your application.", "ok");
    form.reset();
  } catch (err) {
    setStatus(err?.message || "Could not submit. Email contact@unrestdu.in", "err");
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});
