import "./firebase.js";

const { db, collection, addDoc, serverTimestamp } = window.__firebase;

const form = document.getElementById("join-us-form");
const statusEl = document.getElementById("ju-status");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Sending…";
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
    statusEl.textContent = "Thanks — we received your application.";
    form.reset();
  } catch (err) {
    statusEl.textContent = err?.message || "Could not submit. Email contact@unrestdu.in";
  }
});
