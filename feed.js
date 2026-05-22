const { useState, useRef, useEffect } = React;

// Lazy getters — safe even if firebase module is still loading
const fb = () => window.__firebase;
const collection      = (...a) => fb().collection(...a);
const addDoc          = (...a) => fb().addDoc(...a);
const onSnapshot      = (...a) => fb().onSnapshot(...a);
const query           = (...a) => fb().query(...a);
const orderBy         = (...a) => fb().orderBy(...a);
const where           = (...a) => fb().where(...a);
const updateDoc       = (...a) => fb().updateDoc(...a);
const deleteDoc       = (...a) => fb().deleteDoc(...a);
const doc             = (...a) => fb().doc(...a);
const increment       = (...a) => fb().increment(...a);
const serverTimestamp = ()     => fb().serverTimestamp();
const signInWithPopup = (...a) => fb().signInWithPopup(...a);
const signOut         = (...a) => fb().signOut(...a);
const onAuthStateChanged    = (...a) => fb().onAuthStateChanged(...a);
const signInWithRedirect    = (...a) => fb().signInWithRedirect(...a);
const getRedirectResult     = (...a) => fb().getRedirectResult(...a);

const storageRef      = (...a) => fb().storageRef(...a);
const uploadBytes     = (...a) => fb().uploadBytes(...a);
const getDownloadURL  = (...a) => fb().getDownloadURL(...a);
const getDoc          = (...a) => fb().getDoc(...a);

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --paper: #f2efe8;
    --white: #ffffff;
    --ink: #0e0d0b;
    --ink2: #3d3b35;
    --ink3: #7a776e;
    --ink4: #b0ada6;
    --border: rgba(14,13,11,0.1);
    --border2: rgba(14,13,11,0.055);
    --accent: #c84b2f;
    --green: #2a6b4a;
    --blue: #1e4f8c;
    --serif: 'Instrument Serif', Georgia, serif;
    --sans: 'DM Sans', system-ui, sans-serif;
  }
  body { font-family: var(--sans); background: var(--paper); color: var(--ink); }
  button { font-family: var(--sans); cursor: pointer; }
  input, textarea, select { font-family: var(--sans); }
  @keyframes fadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
  @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(-8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes dot-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const COLLEGES = [
  "SRCC","Hindu College","Miranda House","St. Stephen's","Lady Shri Ram","Hansraj College",
  "Ramjas College","Kirori Mal","Gargi College","IP College","Dyal Singh","SGTB Khalsa",
  "Sri Venkateswara","Maitreyi College","Daulat Ram","Jesus & Mary","PGDAV","DCAC","SSCBS"
];

const COL_COLOR = {
  "SRCC":"#c84b2f","Hindu College":"#1e4f8c","Miranda House":"#7b1fa2",
  "St. Stephen's":"#5d4037","Lady Shri Ram":"#7b1fa2","Hansraj College":"#0097a7",
  "Kirori Mal":"#e65100","Gargi College":"#c2185b","IP College":"#00838f",
  "Ramjas College":"#2e7d32","Dyal Singh":"#455a64","SGTB Khalsa":"#f57c00",
  "Sri Venkateswara":"#6d4c41","SSCBS":"#283593","PGDAV":"#00695c"
};

function colAbbr(n){
  const m={"Lady Shri Ram":"LSR","Hindu College":"Hindu College","Miranda House":"Miranda",
    "St. Stephen's":"Stephen's","Hansraj College":"Hansraj","Kirori Mal":"Kirori Mal",
    "SGTB Khalsa":"SGTB Khalsa","Sri Venkateswara":"Venkateswara"};
  return m[n]||n;
}

function collegeFromEmail(email) {
  if (!email) return "Delhi University";
  if (!email.endsWith(".du.ac.in") && !email.endsWith("@du.ac.in")) return "Delhi University";
  const subdomain = email.split("@")[1]?.split(".")[0] ?? "";
  const match = COLLEGES.find(c => c.toLowerCase().replace(/[^a-z]/g,"").includes(subdomain.toLowerCase()));
  return match || subdomain.toUpperCase() || "Delhi University";
}

function initials(name) {
  if (!name) return "DU";
  return name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
}

function timeAgo(ts) {
  if (!ts) return "just now";
  const seconds = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds/3600)}h ago`;
  return `${Math.floor(seconds/86400)}d ago`;
}

const ADMIN_EMAIL = "manaspandeya@gmail.com";

// ─── AUTH GATE ────────────────────────────────────────────────────
function AuthGate({ onAuth }) {
  const [step, setStep] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingUser, setPendingUser] = useState(null);

  const [manualName, setManualName] = useState("");
  const [manualCollege, setManualCollege] = useState("");
  const [manualYear, setManualYear] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    getRedirectResult(fb().auth).then(result => {
      if (!result?.user) return;
      const email = result.user.email;
      const isDU = email.endsWith(".du.ac.in") || email.endsWith("@du.ac.in");
      const isAdminUser = email === ADMIN_EMAIL;
      if (isDU || isAdminUser) {
        onAuth(result.user);
      } else {
        // FIX: do NOT signOut here — user must stay authed to write manual_verifications
        setPendingUser({ email, displayName: result.user.displayName });
        setStep("manual-form");
        setManualName(result.user.displayName || "");
      }
    }).catch(() => {});
  }, []);

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const provider = fb().googleProvider;
      let result;
      try {
        result = await signInWithPopup(fb().auth, provider);
      } catch(popupErr) {
        if (popupErr.code === "auth/popup-blocked" ||
            popupErr.code === "auth/popup-closed-by-user" ||
            popupErr.message?.includes("Cross-Origin") ||
            popupErr.message?.includes("window.closed")) {
          await signInWithRedirect(fb().auth, provider);
          return;
        }
        throw popupErr;
      }
      const email = result.user.email;
      const isDU = email.endsWith(".du.ac.in") || email.endsWith("@du.ac.in");
      const isAdminUser = email === ADMIN_EMAIL;
      if (isDU || isAdminUser) {
        onAuth(result.user);
      } else {
        setPendingUser({ email, displayName: result.user.displayName });
        // FIX: do NOT signOut here — user must stay authed to write manual_verifications
        setStep("manual-form");
        setManualName(result.user.displayName || "");
        setLoading(false);
      }
    } catch (e) {
      console.error("Auth error:", e);
      setError(e.message);
      setLoading(false);
    }
  }

  async function handleManualSubmit() {
    if (!manualName.trim() || !manualCollege || !manualYear) {
      setError("Please fill all required fields.");
      return;
    }
    if (!proofFile) {
      setError("Please attach proof of affiliation (ID card or fee slip).");
      return;
    }
    setSubmitLoading(true);
    setError("");
    try {
      let authenticatedProofUrl = "no-storage-configured";
      if (fb().storageRef && fb().storage) {
        const uniquePathName = `${Date.now()}_${proofFile.name}`;
        const bucketDestination = storageRef(fb().storage, `manual_proofs/${uniquePathName}`);
        const uploadTaskSnapshot = await uploadBytes(bucketDestination, proofFile);
        authenticatedProofUrl = await getDownloadURL(uploadTaskSnapshot.ref);
      }

      await addDoc(collection(fb().db, "manual_verifications"), {
        email: pendingUser?.email || "",
        displayName: manualName.trim(),
        college: manualCollege,
        year: manualYear,
        note: manualNote.trim(),
        proofUrl: authenticatedProofUrl,
        status: "pending",
        submittedAt: serverTimestamp()
      });

      // Sign out after submit — they're not approved yet so no feed access.
      // Once you add them to allowlisted_emails, they sign in again and pass the check.
      await signOut(fb().auth);
      setStep("manual-sent");
    } catch(e) {
      setError("Submission failed: " + e.message);
    } finally {
      setSubmitLoading(false);
    }
  }

  const cardStyle = {
    background:"var(--white)", border:"1px solid var(--border)", borderRadius:12,
    padding:"40px 36px", maxWidth:460, width:"100%",
    boxShadow:"0 8px 40px rgba(0,0,0,0.07)"
  };

  const wrapStyle = {
    minHeight:"100vh", background:"var(--paper)", display:"flex",
    alignItems:"center", justifyContent:"center", fontFamily:"var(--sans)", padding:"2rem"
  };

  const Logo = () => (
    <div style={{fontFamily:"var(--serif)", fontSize:"2.2rem", marginBottom:6, color:"var(--ink)", textAlign:"center"}}>
      Un<em style={{color:"var(--accent)"}}>rest</em>
    </div>
  );

  const inputStyle = {
    width:"100%", border:"1px solid var(--border)", borderRadius:6,
    padding:"9px 12px", fontSize:"0.84rem", color:"var(--ink)",
    background:"var(--white)", outline:"none", fontFamily:"var(--sans)"
  };

  const labelStyle = {
    fontSize:"0.72rem", fontWeight:600, color:"var(--ink3)",
    display:"block", marginBottom:5, textAlign:"left"
  };

  if (step === "manual-sent") {
    return (
      <div style={wrapStyle}>
        <style>{CSS}</style>
        <div style={{...cardStyle, textAlign:"center"}}>
          <Logo/>
          <div style={{fontSize:"2.2rem", marginBottom:16}}>📬</div>
          <div style={{fontSize:"1rem", fontWeight:700, color:"var(--ink)", marginBottom:10}}>
            Request submitted!
          </div>
          <div style={{fontSize:"0.84rem", color:"var(--ink2)", lineHeight:1.7}}>
            Your affiliation proof is under review.<br/>
            We'll reach out to <strong>{pendingUser?.email}</strong> once approved.<br/>
            Usually reviewed within 24–48 hours.
          </div>
          <button onClick={() => { setStep("login"); setError(""); }}
            style={{marginTop:24, padding:"8px 20px", background:"var(--ink)",
              color:"#fff", border:"none", borderRadius:6, fontSize:"0.8rem", fontWeight:600}}>
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  if (step === "manual-form") {
    return (
      <div style={wrapStyle}>
        <style>{CSS}</style>
        <div style={cardStyle}>
          <Logo/>
          <div style={{textAlign:"center", marginBottom:24}}>
            <div style={{fontSize:"0.84rem", color:"var(--ink2)", lineHeight:1.6}}>
              Your Google account isn't a DU address.<br/>
              Submit proof of DU affiliation for manual review.
            </div>
            <div style={{
              marginTop:10, padding:"7px 12px", background:"rgba(200,75,47,0.07)",
              border:"1px solid rgba(200,75,47,0.18)", borderRadius:6,
              fontSize:"0.72rem", color:"var(--accent)", fontWeight:500
            }}>
              Signing in as: {pendingUser?.email}
            </div>
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:14}}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input value={manualName} onChange={e => setManualName(e.target.value)}
                placeholder="Your name" style={inputStyle}/>
            </div>

            <div>
              <label style={labelStyle}>Your College *</label>
              <select value={manualCollege} onChange={e => setManualCollege(e.target.value)}
                style={inputStyle}>
                <option value="">Select college...</option>
                {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Year of Study *</label>
              <select value={manualYear} onChange={e => setManualYear(e.target.value)}
                style={inputStyle}>
                <option value="">Select year...</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>Postgraduate</option>
                <option>PhD</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                Proof of Affiliation * &nbsp;
                <span style={{fontWeight:400, color:"var(--ink4)"}}>
                  (College ID card or fee slip — JPG, PNG or PDF)
                </span>
              </label>
              <div style={{
                border:"1.5px dashed var(--border)", borderRadius:7, padding:"16px",
                textAlign:"center", cursor:"pointer", background:"rgba(14,13,11,0.02)",
                position:"relative"
              }}>
                <input type="file" accept="image/*,.pdf"
                  onChange={e => setProofFile(e.target.files[0])}
                  style={{position:"absolute", inset:0, opacity:0, cursor:"pointer"}}/>
                {proofFile ? (
                  <div style={{fontSize:"0.78rem", color:"var(--green)", fontWeight:600}}>
                    ✓ {proofFile.name}
                  </div>
                ) : (
                  <div style={{fontSize:"0.78rem", color:"var(--ink3)"}}>
                    Click to upload file
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Additional note (optional)</label>
              <textarea value={manualNote} onChange={e => setManualNote(e.target.value)}
                placeholder="Anything you want to add..."
                rows={2}
                style={{...inputStyle, resize:"vertical"}}/>
            </div>
          </div>

          {error && (
            <div style={{
              marginTop:12, padding:"8px 12px", background:"rgba(200,75,47,0.08)",
              border:"1px solid rgba(200,75,47,0.2)", borderRadius:6,
              fontSize:"0.76rem", color:"var(--accent)"
            }}>
              {error}
            </div>
          )}

          <div style={{display:"flex", gap:10, marginTop:20}}>
            <button onClick={() => { setStep("login"); setError(""); setPendingUser(null); }}
              style={{
                flex:1, padding:"10px", background:"transparent",
                border:"1px solid var(--border)", borderRadius:6,
                fontSize:"0.82rem", color:"var(--ink2)", fontWeight:500
              }}>
              ← Back
            </button>
            <button onClick={handleManualSubmit} disabled={submitLoading}
              style={{
                flex:2, padding:"10px", background: submitLoading ? "var(--ink3)" : "var(--ink)",
                border:"none", borderRadius:6, color:"#fff",
                fontSize:"0.82rem", fontWeight:600,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8
              }}>
              {submitLoading ? (
                <span style={{
                  display:"inline-block", width:14, height:14, border:"2px solid rgba(255,255,255,0.4)",
                  borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite"
                }}/>
              ) : null}
              {submitLoading ? "Submitting..." : "Submit for review"}
            </button>
          </div>

          <div style={{marginTop:14, fontSize:"0.68rem", color:"var(--ink4)", textAlign:"center", lineHeight:1.6}}>
            By submitting you agree to our{" "}
            <a href="/terms.html" style={{color:"var(--ink3)"}}>Terms</a> &amp;{" "}
            <a href="/privacy.html" style={{color:"var(--ink3)"}}>Privacy Policy</a>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <style>{CSS}</style>
      <div style={{...cardStyle, textAlign:"center"}}>
        <Logo/>
        <div style={{fontSize:"0.82rem", color:"var(--ink3)", marginBottom:32, lineHeight:1.6}}>
          Delhi University's verified student network.<br/>
          Sign in with your <strong>.du.ac.in</strong> Google account.
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width:"100%", padding:"12px 20px",
            background: loading ? "var(--ink3)" : "var(--ink)",
            color:"#fff", border:"none", borderRadius:7,
            fontSize:"0.9rem", fontWeight:600,
            display:"flex", alignItems:"center", justifyContent:"center", gap:10
          }}
        >
          {loading ? (
            <span style={{
              display:"inline-block", width:16, height:16, border:"2px solid rgba(255,255,255,0.4)",
              borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite"
            }}/>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
        <div style={{
          marginTop:12, padding:"8px 12px", background:"rgba(14,13,11,0.04)",
          borderRadius:6, fontSize:"0.72rem", color:"var(--ink3)", lineHeight:1.6
        }}>
          DU email (.du.ac.in) → instant access<br/>
          Other email → manual affiliation review
        </div>
        {error && (
          <div style={{
            marginTop:12, padding:"8px 12px", background:"rgba(200,75,47,0.08)",
            border:"1px solid rgba(200,75,47,0.2)", borderRadius:6,
            fontSize:"0.78rem", color:"var(--accent)", lineHeight:1.5
          }}>
            {error}
          </div>
        )}
        <div style={{marginTop:16, fontSize:"0.7rem", color:"var(--ink4)", lineHeight:1.7}}>
          By signing in you agree to our{" "}
          <a href="/terms.html" style={{color:"var(--ink3)"}}>Terms</a> &amp;{" "}
          <a href="/privacy.html" style={{color:"var(--ink3)"}}>Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────
function Avatar({initials: ini, college, size=36}) {
  const bg = COL_COLOR[college] || "#455a64";
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%", background:bg, flexShrink:0,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.3, fontWeight:600, color:"#fff", letterSpacing:"0.03em"
    }}>
      {ini}
    </div>
  );
}

function Pill({name, color}) {
  const bg = color || COL_COLOR[name] || "#455a64";
  return (
    <span style={{
      fontSize:"0.58rem", fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase",
      background:`${bg}18`, color:bg, border:`1px solid ${bg}28`, borderRadius:3, padding:"2px 6px"
    }}>
      {colAbbr(name)}
    </span>
  );
}

function WLBar({w, l, postId, onVote, voted}) {
  const wFinal = w + (voted === "w" ? 1 : 0);
  const lFinal = l + (voted === "l" ? 1 : 0);
  const total = wFinal + lFinal;
  const pct = total > 0 ? Math.round((wFinal / total) * 100) : 50;
  return (
    <div style={{display:"flex", alignItems:"center", gap:10, flexWrap:"wrap"}}>
      <button onClick={() => onVote(postId, "w")}
        style={{
          display:"flex", alignItems:"center", gap:7, padding:"5px 13px",
          background: voted==="w" ? "var(--ink)" : "transparent",
          border:"1px solid", borderColor: voted==="w" ? "var(--ink)" : "var(--border)",
          borderRadius:5, fontSize:"0.78rem", fontWeight:600,
          color: voted==="w" ? "#fff" : "var(--ink2)", transition:"all 0.15s", lineHeight:1
        }}>
        <span style={{fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.06em"}}>W</span>
        {wFinal}
      </button>
      <button onClick={() => onVote(postId, "l")}
        style={{
          display:"flex", alignItems:"center", gap:7, padding:"5px 13px",
          background: voted==="l" ? "var(--accent)" : "transparent",
          border:"1px solid", borderColor: voted==="l" ? "var(--accent)" : "var(--border)",
          borderRadius:5, fontSize:"0.78rem", fontWeight:600,
          color: voted==="l" ? "#fff" : "var(--ink2)", transition:"all 0.15s", lineHeight:1
        }}>
        <span style={{fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.06em"}}>L</span>
        {lFinal}
      </button>
      <span style={{fontSize:"0.72rem", color:"var(--ink3)", fontWeight:500}}>{pct}% W</span>
      <span style={{fontSize:"0.72rem", color:"var(--ink4)"}}>{total} votes</span>
    </div>
  );
}

// ─── POST CARD ────────────────────────────────────────────────────
function PostCard({post, voted, onVote, saved, onSave, notify}) {
  return (
    <article style={{borderBottom:"1px solid var(--border)", padding:"22px 0", animation:"fadeIn 0.3s ease both"}}>
      <div style={{display:"flex", gap:11, alignItems:"flex-start", marginBottom:12}}>
        <Avatar initials={initials(post.author)} college={post.college} size={38}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8}}>
            <div>
              <div style={{display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:2}}>
                <span style={{fontSize:"0.9rem", fontWeight:600, color:"var(--ink)"}}>{post.author}</span>
                {post.verified && (
                  <span style={{
                    fontSize:"0.56rem", fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase",
                    background:"rgba(42,107,74,0.09)", color:"var(--green)",
                    border:"1px solid rgba(42,107,74,0.18)", borderRadius:3, padding:"1px 5px"
                  }}>Verified</span>
                )}
              </div>
              <div style={{display:"flex", alignItems:"center", gap:6, flexWrap:"wrap"}}>
                <Pill name={post.college}/>
                <span style={{fontSize:"0.68rem", color:"var(--ink4)"}}>· {timeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {post.status === "pending" && (
        <div style={{
          marginBottom:8, marginLeft:49,
          padding:"4px 10px", background:"rgba(255,200,0,0.1)",
          border:"1px solid rgba(255,200,0,0.3)", borderRadius:4,
          fontSize:"0.68rem", color:"#b8860b", fontWeight:500
        }}>
          ⏳ Pending approval — visible only to you until a mod approves it.
        </div>
      )}

      <div style={{paddingLeft:49}}>
        <p style={{fontSize:"0.92rem", color:"var(--ink)", lineHeight:1.68, marginBottom:9}}>
          {post.text}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:10}}>
            {post.tags.map(t => (
              <span key={t} style={{fontSize:"0.68rem", color:"var(--ink3)", fontWeight:500}}>#{t}</span>
            ))}
          </div>
        )}

        <div style={{display:"flex", alignItems:"center", gap:12, flexWrap:"wrap"}}>
          <WLBar w={post.w} l={post.l} postId={post.id} onVote={onVote} voted={voted}/>
          <span style={{fontSize:"0.7rem", color:"var(--ink4)"}}>·</span>
          <button onClick={() => {onSave(post.id); notify(saved ? "Removed from saved" : "Saved");}}
            style={{background:"none", border:"none", fontSize:"0.72rem",
              color: saved ? "var(--blue)" : "var(--ink3)", fontWeight: saved ? 600 : 500, padding:0}}>
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── COMPOSE BOX ─────────────────────────────────────────────────
function ComposeBox({user, onPost}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const college = collegeFromEmail(user.email);
      await addDoc(collection(fb().db, "posts"), {
        author: user.displayName,
        email: user.email,
        college,
        text: text.trim(),
        tags: [],
        status: "pending",
        w: 1,
        l: 0,
        createdAt: serverTimestamp(),
        uid: user.uid
      });
      setText("");
      onPost();
    } catch (e) {
      console.error("Post failed:", e);
      alert("Failed to post: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background:"var(--white)", border:"1px solid var(--border)",
      borderRadius:8, padding:"12px 14px", marginBottom:22,
      display:"flex", gap:10, alignItems:"flex-start"
    }}>
      <Avatar initials={initials(user.displayName)} college={collegeFromEmail(user.email)} size={34}/>
      <div style={{flex:1}}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="What's happening at DU?"
          rows={3}
          style={{
            width:"100%", border:"1px solid var(--border)", borderRadius:6,
            padding:"8px 11px", resize:"vertical", fontSize:"0.85rem",
            color:"var(--ink)", background:"var(--white)", outline:"none",
            lineHeight:1.5, fontFamily:"var(--sans)"
          }}
        />
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8}}>
          <span style={{fontSize:"0.68rem", color:"var(--ink4)"}}>
            Posts go live after mod approval.
          </span>
          <button onClick={submit} disabled={loading || !text.trim()}
            style={{
              padding:"5px 14px", background: loading ? "var(--ink3)" : "var(--ink)",
              color:"#fff", border:"none", borderRadius:5, fontSize:"0.76rem", fontWeight:600
            }}>
            {loading ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────
function UnrestFeed() {
  const [user, setUser] = useState(undefined);
  const [posts, setPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [tab, setTab] = useState("du");
  const [voted, setVoted] = useState({});
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchCollege, setSearchCollege] = useState("");

  const isAdmin = user && user.email === ADMIN_EMAIL;

  useEffect(() => {
    return onAuthStateChanged(fb().auth, async u => {
      if (u) {
        const isDU = u.email.endsWith(".du.ac.in") || u.email.endsWith("@du.ac.in");
        const isAdminUser = u.email === ADMIN_EMAIL;
        if (!isDU && !isAdminUser) {
          // Check Firestore allowlist — approved manual users land here
          try {
            const snap = await fb().getDoc(
              fb().doc(fb().db, "allowlisted_emails", u.email.toLowerCase())
            );
            if (!snap.exists()) {
              await signOut(fb().auth);
              setUser(null);
              return;
            }
            // Allowlisted — fall through to setUser(u)
          } catch(e) {
            console.error("Allowlist check failed:", e);
            await signOut(fb().auth);
            setUser(null);
            return;
          }
        }
      }
      setUser(u || null);
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(fb().db, "posts"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          w: parseInt(data.w ?? data.Ws ?? 0, 10) || 0,
          l: parseInt(data.l ?? data.Ls ?? 0, 10) || 0,
        };
      });

      const publicFeed = all.filter(p =>
        p.status === "approved" || !p.uid || p.uid === "legacy" || p.uid === user.uid
      );
      const moderationQueue = all.filter(p => p.status === "pending");

      setPosts(publicFeed);
      setPendingPosts(moderationQueue);
      setFeedLoading(false);
    }, err => {
      console.error("Feed error:", err.message);
      setFeedLoading(false);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const qVerif = query(
      collection(fb().db, "manual_verifications"),
      where("status", "==", "pending")
    );

    const unsubVerif = onSnapshot(qVerif, snap => {
      const verifs = snap.docs.map(d => ({id: d.id, ...d.data()}));
      setPendingVerifications(verifs);
    }, err => {
      console.error("Verification sync failed:", err);
    });

    return () => unsubVerif();
  }, [user, isAdmin]);

  function notify(msg) { setToast(msg); setTimeout(() => setToast(null), 2800); }

  async function approvePost(id) {
    try {
      await updateDoc(doc(fb().db, "posts", id), { status: "approved" });
      notify("Post approved live! ✨");
    } catch(e) { notify("Approval failed."); }
  }

  async function rejectPost(id) {
    if(confirm("Delete this post permanently from queue?")) {
      try {
        await deleteDoc(doc(fb().db, "posts", id));
        notify("Post rejected & deleted.");
      } catch(e) { notify("Deletion failed."); }
    }
  }

  async function resolveVerification(id, actionStatus) {
    try {
      await updateDoc(doc(fb().db, "manual_verifications", id), { status: actionStatus });
      notify(`Registration marked as ${actionStatus}`);
    } catch(e) { notify("Status update failed."); }
  }

  async function handleVote(id, type) {
    if (voted[id] === type) return;
    setVoted(p => ({...p, [id]: type}));
    try {
      await updateDoc(doc(fb().db, "posts", id), {
        [type]: increment(1)
      });
      notify(type === "w" ? "W noted 🔥" : "L noted");
    } catch(e) {
      setVoted(p => ({...p, [id]: null}));
      notify("Vote failed");
    }
  }

  function handleSave(id) {
    setSavedPosts(p => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  if (user === undefined) {
    return (
      <div style={{minHeight:"100vh", background:"var(--paper)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--sans)"}}>
        <style>{CSS}</style>
        <span style={{display:"inline-block", width:28, height:28, border:"3px solid rgba(14,13,11,0.12)", borderTopColor:"var(--ink)", borderRadius:"50%", animation:"spin 0.7s linear infinite"}}/>
      </div>
    );
  }

  if (!user) {
    return <AuthGate onAuth={setUser}/>;
  }

  const userCollege = collegeFromEmail(user.email);

  const TABS = [
    {id:"du", label:"DU"},
    {id:"college", label:"College"},
    {id:"saved", label:"Saved"}
  ];
  if (isAdmin) {
    TABS.push({id:"mod", label:"Mod Queue"});
  }

  const visible = posts.filter(p => {
    if (searchQ && !p.text?.toLowerCase().includes(searchQ.toLowerCase()) && !p.author?.toLowerCase().includes(searchQ.toLowerCase())) return false;
    if (searchCollege && p.college !== searchCollege) return false;
    if (tab === "college" && p.college !== userCollege) return false;
    if (tab === "saved" && !savedPosts.has(p.id)) return false;
    return true;
  });

  return (
    <div style={{fontFamily:"var(--sans)", background:"var(--paper)", minHeight:"100vh"}}>
      <style>{CSS}</style>

      {toast && (
        <div style={{position:"fixed", top:14, left:"50%", transform:"translateX(-50%)", background:"var(--ink)", color:"#fff", padding:"7px 16px", borderRadius:5, fontSize:"0.76rem", fontWeight:500, zIndex:9999, whiteSpace:"nowrap", boxShadow:"0 4px 16px rgba(0,0,0,0.18)", animation:"toastIn 0.22s ease"}}>
          {toast}
        </div>
      )}

      <nav style={{background:"rgba(242,239,232,0.96)", borderBottom:"1px solid var(--border)", padding:"0 2rem", position:"sticky", top:0, zIndex:100, backdropFilter:"blur(10px)"}}>
        <div style={{maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", height:52, gap:0}}>
          <a style={{fontFamily:"var(--serif)", fontSize:"1.5rem", color:"var(--ink)", textDecoration:"none", letterSpacing:"-0.02em", marginRight:28, flexShrink:0}}>
            Un<em style={{fontStyle:"italic", color:"var(--accent)"}}>rest</em>
          </a>

          <div style={{display:"flex", alignItems:"center", background:"rgba(14,13,11,0.07)", borderRadius:"100px", padding:"3px", gap:1}}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{padding:"5px 15px", borderRadius:100, border:"none", background: tab===t.id ? "var(--white)" : "transparent", fontSize:"0.76rem", fontWeight: tab===t.id ? 600 : 400, color: tab===t.id ? "var(--ink)" : "var(--ink3)", transition:"all 0.15s", boxShadow: tab===t.id ? "0 1px 3px rgba(0,0,0,0.09)" : "none"}}>
                {t.label} {t.id === "mod" && (pendingPosts.length + pendingVerifications.length) > 0 ? `(${pendingPosts.length + pendingVerifications.length})` : ""}
              </button>
            ))}
          </div>

          <div style={{marginLeft:"auto", display:"flex", alignItems:"center", gap:8}}>
            <div style={{display:"flex", alignItems:"center", gap:7, padding:"4px 10px 4px 5px", border:"1px solid var(--border)", borderRadius:5, background:"var(--white)"}}>
              <Avatar initials={initials(user.displayName)} college={userCollege} size={24}/>
              <span style={{fontSize:"0.78rem", fontWeight:500, color:"var(--ink2)"}}>{isAdmin ? "System Admin" : userCollege}</span>
            </div>
            <button onClick={() => signOut(fb().auth)} style={{fontSize:"0.72rem", color:"var(--ink3)", background:"none", border:"none", padding:"4px 6px"}}>Sign out</button>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"220px 1fr 210px", minHeight:"calc(100vh - 52px)"}}>

        <aside style={{padding:"24px 20px 24px 0", borderRight:"1px solid var(--border)"}}>
          <div style={{marginBottom:24}}>
            <div style={{fontSize:"0.58rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--ink4)", marginBottom:10}}>System Context</div>
            <div style={{background:"var(--white)", border:"1px solid var(--border)", borderRadius:7, padding:"9px 11px", display:"flex", alignItems:"center", gap:8}}>
              <div style={{width:7, height:7, borderRadius:"50%", background:"var(--accent)", animation:"dot-pulse 2s infinite", flexShrink:0}}/>
              <span style={{fontSize:"0.85rem", fontWeight:600, color:"var(--ink)", flex:1}}>{isAdmin ? "🛠️ Moderation Mode" : userCollege}</span>
            </div>
          </div>

          <div style={{marginBottom:24}}>
            <div style={{fontSize:"0.58rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--ink4)", marginBottom:10}}>Quick links</div>
            {TABS.map(t => (
              <div key={t.id} onClick={() => setTab(t.id)} style={{fontSize:"0.82rem", padding:"6px 0 6px 8px", color: tab===t.id ? "var(--accent)" : "var(--ink2)", fontWeight: tab===t.id ? 600 : 400, cursor:"pointer", borderLeft: tab===t.id ? "2px solid var(--accent)" : "2px solid transparent", marginLeft:-8, transition:"all 0.12s", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span>{t.label}</span>
                {t.id==="saved" && savedPosts.size>0 && (
                  <span style={{fontSize:"0.62rem", background:"var(--blue)", color:"#fff", borderRadius:10, padding:"1px 5px", fontWeight:700}}>{savedPosts.size}</span>
                )}
              </div>
            ))}
          </div>

          <div style={{fontSize:"0.72rem", color:"var(--ink3)", lineHeight:1.7}}>
            <div style={{fontWeight:600, marginBottom:4}}>Signed in as</div>
            <div style={{color:"var(--ink4)", fontSize:"0.65rem", wordBreak:"break-all"}}>{user.email}</div>
          </div>
        </aside>

        <main style={{padding:"24px 28px", minWidth:0}}>
          {tab !== "mod" ? (
            <>
              <ComposeBox user={user} onPost={() => notify("Posted! Pending approval.")}/>

              <div style={{display:"flex", gap:8, marginBottom:18}}>
                <div style={{flex:1, display:"flex", alignItems:"center", gap:8, background:"var(--white)", border:"1px solid var(--border)", borderRadius:6, padding:"7px 11px"}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink4)" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search posts..." style={{border:"none", outline:"none", fontSize:"0.82rem", background:"transparent", color:"var(--ink)", flex:1, fontFamily:"var(--sans)"}}/>
                  {searchQ && <button onClick={() => setSearchQ("")} style={{background:"none", border:"none", color:"var(--ink4)", cursor:"pointer", fontSize:"0.9rem", lineHeight:1}}>×</button>}
                </div>
                <select value={searchCollege} onChange={e => setSearchCollege(e.target.value)} style={{padding:"7px 10px", border:"1px solid var(--border)", borderRadius:6, fontSize:"0.78rem", color:"var(--ink2)", background:"var(--white)", outline:"none", cursor:"pointer", fontFamily:"var(--sans)"}}>
                  <option value="">All colleges</option>
                  {COLLEGES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {feedLoading ? (
                <div style={{textAlign:"center", padding:"3rem 0"}}>
                  <span style={{display:"inline-block", width:22, height:22, border:"2px solid var(--border)", borderTopColor:"var(--ink)", borderRadius:"50%", animation:"spin 0.7s linear infinite"}}/>
                </div>
              ) : visible.length === 0 ? (
                <div style={{textAlign:"center", padding:"3rem 0", color:"var(--ink3)", fontSize:"0.85rem"}}>
                  {tab === "saved" ? "Nothing saved yet." : searchQ || searchCollege ? "No posts match your search." : "No posts yet. Be the first to post!"}
                </div>
              ) : (
                visible.map(p => (
                  <PostCard key={p.id} post={p} voted={voted[p.id] || null} onVote={handleVote} saved={savedPosts.has(p.id)} onSave={handleSave} notify={notify}/>
                ))
              )}
            </>
          ) : (
            <div style={{display:"flex", flexDirection:"column", gap:32}}>
              <div>
                <h3 style={{fontFamily:"var(--serif)", fontSize:"1.8rem", marginBottom:12, color:"var(--accent)"}}>Feed Post Submissions ({pendingPosts.length})</h3>
                {pendingPosts.length === 0 ? (
                  <p style={{fontSize:"0.85rem", color:"var(--ink3)"}}>No posts waiting in the queue.</p>
                ) : (
                  pendingPosts.map(p => (
                    <div key={p.id} style={{background:"#fff", border:"1px solid var(--border)", borderRadius:8, padding:16, marginBottom:12}}>
                      <div style={{fontSize:"0.72rem", color:"var(--ink3)", fontWeight:600, marginBottom:6}}>{p.author} · {p.college}</div>
                      <p style={{fontSize:"0.9rem", marginBottom:12, color:"var(--ink)"}}>"...{p.text}"</p>
                      <div style={{display:"flex", gap:10}}>
                        <button onClick={() => approvePost(p.id)} style={{padding:"6px 14px", background:"var(--green)", border:"none", color:"#fff", borderRadius:5, fontSize:"0.75rem", fontWeight:600}}>Approve Live</button>
                        <button onClick={() => rejectPost(p.id)} style={{padding:"6px 14px", background:"transparent", border:"1px solid var(--accent)", color:"var(--accent)", borderRadius:5, fontSize:"0.75rem", fontWeight:600}}>Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <h3 style={{fontFamily:"var(--serif)", fontSize:"1.8rem", marginBottom:12, color:"var(--blue)"}}>Manual Profile Claims ({pendingVerifications.length})</h3>
                {pendingVerifications.length === 0 ? (
                  <p style={{fontSize:"0.85rem", color:"var(--ink3)"}}>No student credential proofs submitted.</p>
                ) : (
                  pendingVerifications.map(v => (
                    <div key={v.id} style={{background:"#fff", border:"1px solid var(--border)", borderRadius:8, padding:16, marginBottom:12, display:"flex", gap:16, flexWrap:"wrap"}}>
                      <div style={{flex:1, minWidth:240}}>
                        <div style={{fontSize:"0.85rem", fontWeight:700, marginBottom:4}}>{v.displayName}</div>
                        <div style={{fontSize:"0.76rem", color:"var(--ink2)", marginBottom:2}}><strong>Email:</strong> {v.email}</div>
                        <div style={{fontSize:"0.76rem", color:"var(--ink2)", marginBottom:2}}><strong>College:</strong> {v.college} ({v.year})</div>
                        {v.note && <div style={{fontSize:"0.74rem", color:"var(--ink3)", fontStyle:"italic", marginTop:6}}>Note: "{v.note}"</div>}

                        <div style={{display:"flex", gap:10, marginTop:14}}>
                          <button onClick={() => resolveVerification(v.id, "approved")} style={{padding:"6px 12px", background:"var(--blue)", border:"none", color:"#fff", borderRadius:5, fontSize:"0.74rem", fontWeight:600}}>Verify Account</button>
                          <button onClick={() => resolveVerification(v.id, "rejected")} style={{padding:"6px 12px", background:"rgba(0,0,0,0.05)", border:"none", color:"var(--ink2)", borderRadius:5, fontSize:"0.74rem", fontWeight:500}}>Deny Access</button>
                        </div>
                      </div>

                      <div style={{flexShrink:0, width:140, height:100, border:"1px solid var(--border)", borderRadius:6, overflow:"hidden", background:"#f9f9f9"}}>
                        <a href={v.proofUrl} target="_blank" rel="noopener noreferrer">
                          <img src={v.proofUrl} alt="ID Document Proof" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>

        <aside style={{padding:"24px 0 24px 20px", borderLeft:"1px solid var(--border)"}}>
          <div style={{marginBottom:24}}>
            <div style={{fontSize:"0.58rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--ink4)", marginBottom:12}}>About Unrest</div>
            <div style={{fontSize:"0.78rem", color:"var(--ink2)", lineHeight:1.8}}>
              <div>Delhi University's verified student network.</div>
              <div style={{marginTop:6, color:"var(--ink3)", fontSize:"0.72rem"}}>Launching 11 June 2026</div>
            </div>
          </div>

          <div style={{background:"rgba(200,75,47,0.06)", border:"1px solid rgba(200,75,47,0.14)", borderRadius:7, padding:"12px 14px", marginBottom:24}}>
            <div style={{fontSize:"0.68rem", fontWeight:700, color:"var(--accent)", marginBottom:6}}>How it works</div>
            {[
              "Post with your DU Google account",
              "Mods approve before it goes live",
              "W / L votes are real-time",
              "Your college is auto-detected"
            ].map((item, i) => (
              <div key={i} style={{display:"flex", gap:6, fontSize:"0.72rem", color:"var(--ink2)", padding:"3px 0", lineHeight:1.5}}>
                <span style={{color:"var(--ink4)", flexShrink:0}}>{i+1}.</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div style={{fontSize:"0.61rem", color:"var(--ink4)", lineHeight:1.75}}>
            <div>unrestdu.in · DU's verified student network</div>
            <div style={{marginTop:4, display:"flex", gap:8}}>
              <a href="/privacy.html" style={{color:"var(--ink3)", textDecoration:"none"}}>Privacy</a>
              <a href="/terms.html" style={{color:"var(--ink3)", textDecoration:"none"}}>Terms</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(UnrestFeed));
