import "./firebase.js";

const { db, collection, addDoc, serverTimestamp } = window.__firebase;

const form = document.getElementById("team-apply-form");
const statusEl = document.getElementById("ta-status");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "Sending…";
  const fd = new FormData(form);
  try {
    await addDoc(collection(db, "team_applications"), {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim().toLowerCase(),
      phone: String(fd.get("phone") ?? "").trim(),
      college: String(fd.get("college") ?? "").trim(),
      year: String(fd.get("year") ?? "").trim(),
      course: String(fd.get("course") ?? "").trim(),
      why: String(fd.get("why") ?? "").trim(),
      bring: String(fd.get("bring") ?? "").trim(),
      source: "app_banner",
      createdAt: serverTimestamp(),
    });
    statusEl.textContent = "Thanks — we received your application.";
    form.reset();
  } catch (err) {
    statusEl.textContent = err?.message || "Could not submit. Email contact@unrestdu.in";
  }
});
