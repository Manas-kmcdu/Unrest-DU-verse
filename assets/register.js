/* Register modal (interface). Replace UnrestRegister.submit with your Firebase call:
   submit({ name, college (slug), email, proof (File), password }) -> Promise. Resolve = account created and queued for verification.
   Until then: REGISTER_DEMO:true in config.js fakes success for design review; with it false the form says registration is not open yet. */
(function () {
  var C = window.UnrestColleges, cfg = window.UNREST_CONFIG || {}, rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MAX = 5 * 1024 * 1024, OKT = /^(image\/(jpeg|png|webp)|application\/pdf)$/;
  window.UnrestRegister = window.UnrestRegister || {
    submit: function (d) {
      if (cfg.REGISTER_DEMO) return new Promise(function (r) { setTimeout(r, 1100); }).then(function () { if (window.UnrestLive) window.UnrestLive.join(d.college); return { demo: true }; });
      return Promise.reject(new Error("Registration opens soon. Get the app to join from your phone."));
    }
  };
  var opts = (C ? C.list().slice().sort(function (a, b) { return a.name.localeCompare(b.name); }) : []).map(function (c) { return '<option value="' + C.esc(c.slug) + '">' + C.esc(c.name) + '</option>'; }).join("");
  var host = document.createElement("div"); host.className = "rg"; host.hidden = true;
  host.innerHTML = '<div class="rgp" role="dialog" aria-modal="true" aria-labelledby="rgt"><button class="rgx" type="button" aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg></button>' +
    '<h2 id="rgt">Create your account</h2><p class="lede">Join your college on Unrest. We check your proof of DU affiliation before your account goes live.</p>' +
    '<form novalidate>' +
    '<label class="rgl">Full name<input type="text" name="name" autocomplete="name"><span class="rge"></span></label>' +
    '<label class="rgl">College<select name="college"><option value="">Select your college</option>' + opts + '</select><span class="rge"></span></label>' +
    '<label class="rgl">Email<input type="email" name="email" autocomplete="email" inputmode="email"><span class="rge"></span></label>' +
    '<div class="rgl"><span>Proof of DU affiliation</span><label class="rgf" id="rgf"><input type="file" name="proof" accept="image/jpeg,image/png,image/webp,application/pdf"><b>Upload your DU ID card or fee receipt</b><small>JPG, PNG or PDF, up to 5 MB</small></label><span class="rge"></span></div>' +
    '<label class="rgl">Password<span class="rgpw"><input type="password" name="password" autocomplete="new-password"><button type="button" data-show>Show</button></span><span class="rgs" data-s="0"><i></i><i></i><i></i><i></i></span><span class="rge"></span></label>' +
    '<label class="rgl">Confirm password<input type="password" name="confirm" autocomplete="new-password"><span class="rge"></span></label>' +
    '<button class="btn rgsub" type="submit">Create account</button><p class="rgm" role="alert"></p><p class="rgn">By registering you agree to our Terms and Privacy Policy.</p></form>' +
    '<div class="rgok"><h2>You&rsquo;re in the queue.</h2><p>We&rsquo;re checking your proof of DU affiliation. We&rsquo;ll email you as soon as your account is live. Until then, get the app and be ready.</p><div class="acts"><a class="btn" href="#get" data-close>Get the app</a><button class="btn s" type="button" data-close>Close</button></div></div></div>';
  document.body.appendChild(host);
  var panel = host.firstChild, form = panel.querySelector("form"), msg = form.querySelector(".rgm"), btn = form.querySelector(".rgsub"), drop = panel.querySelector("#rgf");
  var file = null, from = null, thumb = "";
  function err(name, t) {
    var el = form.elements[name], span = (name === "proof" ? drop.parentNode : el.closest(".rgl")).querySelector(".rge");
    span.textContent = t || ""; if (name !== "proof") { if (t) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid"); }
    return !!t;
  }
  function score(p) { var s = 0; if (p.length >= 8) s++; if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s++; return p ? Math.max(1, s) : 0; }
  form.elements.password.addEventListener("input", function () { form.querySelector(".rgs").dataset.s = score(this.value); });
  panel.querySelector("[data-show]").onclick = function () { var p = form.elements.password, c = form.elements.confirm, h = p.type === "password"; p.type = c.type = h ? "text" : "password"; this.textContent = h ? "Hide" : "Show"; };
  function setFile(f) {
    if (thumb) { URL.revokeObjectURL(thumb); thumb = ""; } file = f || null; drop.classList.toggle("has", !!file);
    var keep = form.elements.proof; drop.innerHTML = "";
    if (file) {
      if (/^image\//.test(file.type)) { thumb = URL.createObjectURL(file); var im = document.createElement("img"); im.src = thumb; im.alt = ""; drop.appendChild(im); }
      var t = document.createElement("span"); t.innerHTML = "<b></b><small></small>"; t.firstChild.textContent = file.name; t.lastChild.textContent = (file.size / 1048576).toFixed(1) + " MB"; drop.appendChild(t);
      var r = document.createElement("button"); r.type = "button"; r.className = "rm"; r.textContent = "Remove"; r.onclick = function (e) { e.preventDefault(); keep.value = ""; setFile(null); }; drop.appendChild(r);
    } else drop.innerHTML = '<b>Upload your DU ID card or fee receipt</b><small>JPG, PNG or PDF, up to 5 MB</small>';
    drop.appendChild(keep); err("proof", "");
  }
  form.elements.proof.addEventListener("change", function () { var f = this.files[0]; if (!f) return; if (!OKT.test(f.type)) { this.value = ""; return void err("proof", "Use a JPG, PNG or PDF."); } if (f.size > MAX) { this.value = ""; return void err("proof", "That file is over 5 MB."); } setFile(f); });
  ["dragenter", "dragover"].forEach(function (n) { drop.addEventListener(n, function (e) { e.preventDefault(); drop.classList.add("drag"); }); });
  ["dragleave", "drop"].forEach(function (n) { drop.addEventListener(n, function () { drop.classList.remove("drag"); }); });
  function openM(trigger, slug) {
    from = trigger || document.activeElement; panel.classList.remove("done"); host.hidden = false; document.body.classList.add("rglock");
    if (slug && form.elements.college) form.elements.college.value = slug; msg.textContent = ""; btn.disabled = false; btn.textContent = "Create account";
    setTimeout(function () { form.elements.name.focus(); }, 30);
  }
  function closeM() { host.hidden = true; document.body.classList.remove("rglock"); if (from && from.focus) from.focus(); }
  window.UnrestRegister.open = openM;
  document.addEventListener("click", function (e) { var a = e.target.closest("[data-register]"); if (!a) return; e.preventDefault(); openM(a, a.dataset.college); });
  host.addEventListener("click", function (e) { if (e.target === host || e.target.closest(".rgx") || e.target.closest("[data-close]")) { if (e.target.closest("a[href]")) { closeM(); return; } e.preventDefault(); closeM(); } });
  document.addEventListener("keydown", function (e) {
    if (host.hidden) return; if (e.key === "Escape") closeM();
    if (e.key === "Tab") { var f = [].filter.call(panel.querySelectorAll("button,input,select,a[href]"), function (x) { return !x.disabled && x.offsetParent !== null && x.type !== "hidden"; }); if (!f.length) return; var a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault(); msg.textContent = ""; var f = form.elements, bad = [];
    var v = { name: f.name.value.trim(), college: f.college.value, email: f.email.value.trim(), password: f.password.value, confirm: f.confirm.value };
    if (err("name", v.name.length < 2 ? "Enter your full name." : "")) bad.push("name");
    if (err("college", v.college ? "" : "Pick your college.")) bad.push("college");
    if (err("email", /^\S+@\S+\.\S+$/.test(v.email) ? "" : "Enter a valid email.")) bad.push("email");
    if (err("proof", file ? "" : "Add your DU ID card or fee receipt.")) bad.push("proof");
    if (err("password", v.password.length >= 8 ? "" : "Use at least 8 characters.")) bad.push("password");
    if (err("confirm", v.confirm === v.password ? "" : "Passwords don't match.")) bad.push("confirm");
    if (bad.length) { var el = f[bad[0]]; if (bad[0] === "proof") drop.scrollIntoView({ block: "center" }); else el.focus(); return; }
    btn.disabled = true; btn.textContent = "Creating account...";
    window.UnrestRegister.submit({ name: v.name, college: v.college, email: v.email, proof: file, password: v.password }).then(function () {
      form.reset(); f.password.value = f.confirm.value = ""; form.querySelector(".rgs").dataset.s = 0; setFile(null); panel.classList.add("done"); panel.querySelector(".rgok a").focus();
    }).catch(function (x) { btn.disabled = false; btn.textContent = "Create account"; msg.textContent = (x && x.message) || "Something went wrong. Try again."; });
  });
})();
