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
  @keyframes carouselFade { from{opacity:0.6} to{opacity:1} }
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

// Banner sets for each tab
const BANNERS = {
  du: [
    { bg: "#f5e6d3", title: "end semester", subtitle: "exams incoming", tag: "ACADEMICS", tagColor: "#d4a574" },
    { bg: "#e8f0f7", title: "placement", subtitle: "season starts", tag: "CAREERS", tagColor: "#5b9bd5" },
    { bg: "#f0e8f5", title: "fests &", subtitle: "cultural events", tag: "EVENTS", tagColor: "#a66ba6" },
    { bg: "#e6f5e6", title: "north campus", subtitle: "vibes only", tag: "CAMPUS", tagColor: "#5b9c5b" }
  ],
  college: [
    { bg: "#fff3e0", title: "your college", subtitle: "trending posts", tag: "HOT", tagColor: "#ff8a65" },
    { bg: "#f3e5f5", title: "college news", subtitle: "stay updated", tag: "UPDATES", tagColor: "#ba68c8" },
    { bg: "#e0f2f1", title: "alumni connect", subtitle: "network here", tag: "COMMUNITY", tagColor: "#4db6ac" }
  ],
  explore: [
    { bg: "#fce4ec", title: "trending", subtitle: "across DU", tag: "VIRAL", tagColor: "#f06292" },
    { bg: "#ede7f6", title: "discover new", subtitle: "perspectives", tag: "EXPLORE", tagColor: "#7e57c2" },
    { bg: "#e1f5fe", title: "join conversations", subtitle: "start connecting", tag: "COMMUNITY", tagColor: "#29b6f6" }
  ]
};

function BannerCarousel({ banners }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const banner = banners[current];

  return (
    <div style={{
      background: banner.bg,
      borderRadius: 8,
      padding: "32px 28px",
      marginBottom: 20,
      minHeight: 140,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      animation: "carouselFade 0.5s ease-in-out"
    }}>
      <div>
        <div style={{
          fontFamily: "var(--serif)",
          fontSize: "2.2rem",
          fontStyle: "italic",
          color: "var(--ink)",
          lineHeight: 1.1,
          marginBottom: 8
        }}>
          {banner.title}
        </div>
        <div style={{
          fontSize: "1.8rem",
          fontStyle: "italic",
          color: "var(--ink2)",
          fontWeight: 300
        }}>
          {banner.subtitle}
        </div>
      </div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{
          display: "flex",
          gap: 6
        }}>
          {banners.map((_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: i === current ? "var(--ink)" : "var(--ink4)",
                transition: "background 0.3s"
              }}
            />
          ))}
        </div>
        <span style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: banner.tagColor
        }}>
          {banner.tag}
        </span>
      </div>
    </div>
  );
}

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
        setPendingUser({ email, displayName: result.user.displayName });
        signOut(fb().auth);
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
            popupErr.message?.includes("Cross-Origin")) {
          signInWithRedirect(fb().auth, provider);
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
        await signOut(fb().auth);
        setStep("manual-form");
        setManualName(result.user.displayName || "");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleManualSubmit() {
    if (!manualName.trim() || !manualCollege || !proofFile) {
      setError("Name, college, and proof required");
      return;
    }
    setSubmitLoading(true);
    try {
      const bucket = fb().storage;
      const proofRef = fb().storageRef(bucket, `proofs/${Date.now()}_${proofFile.name}`);
      await fb().uploadBytes(proofRef, proofFile);
      const proofUrl = await fb().getDownloadURL(proofRef);

      await addDoc(collection(fb().db, "manual_verifications"), {
        email: pendingUser.email,
        displayName: manualName,
        college: manualCollege,
        year: manualYear || "N/A",
        note: manualNote,
        proofUrl: proofUrl,
        createdAt: serverTimestamp(),
        status: "pending"
      });

      setStep("submitted");
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div style={{minHeight:"100vh", background:"var(--paper)", display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
      <style>{CSS}</style>
      <div style={{maxWidth:420, width:"100%"}}>
        {step === "login" && (
          <div style={{background:"var(--white)", border:"1px solid var(--border)", borderRadius:12, padding:32}}>
            <div style={{fontFamily:"var(--serif)", fontSize:"2rem", marginBottom:8, color:"var(--accent)"}}>Unrest</div>
            <div style={{fontSize:"0.9rem", color:"var(--ink3)", marginBottom:32}}>Delhi University's verified student feed</div>

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width:"100%",
                padding:"12px 16px",
                background:"var(--ink)",
                color:"var(--white)",
                border:"none",
                borderRadius:6,
                fontSize:"0.9rem",
                fontWeight:600,
                cursor:"pointer",
                opacity: loading ? 0.7 : 1,
                transition:"opacity 0.2s"
              }}
            >
              {loading ? "Signing in..." : "Sign in with Google"}
            </button>

            {error && <div style={{color:"var(--accent)", fontSize:"0.8rem", marginTop:12}}>{error}</div>}

            <div style={{fontSize:"0.75rem", color:"var(--ink4)", marginTop:20, lineHeight:1.6}}>
              DU email gets instant access. Others: submit credentials for verification.
            </div>
          </div>
        )}

        {step === "manual-form" && (
          <div style={{background:"var(--white)", border:"1px solid var(--border)", borderRadius:12, padding:32}}>
            <div style={{fontSize:"1.1rem", fontWeight:600, marginBottom:20}}>Verify your identity</div>

            <input
              type="text"
              value={manualName}
              onChange={e => setManualName(e.target.value)}
              placeholder="Full name"
              style={{
                width:"100%",
                padding:"10px 12px",
                border:"1px solid var(--border)",
                borderRadius:6,
                fontSize:"0.9rem",
                marginBottom:12,
                fontFamily:"var(--sans)",
                outline:"none"
              }}
            />

            <select
              value={manualCollege}
              onChange={e => setManualCollege(e.target.value)}
              style={{
                width:"100%",
                padding:"10px 12px",
                border:"1px solid var(--border)",
                borderRadius:6,
                fontSize:"0.9rem",
                marginBottom:12,
                fontFamily:"var(--sans)",
                outline:"none"
              }}
            >
              <option value="">Select college</option>
              {COLLEGES.map(c => <option key={c}>{c}</option>)}
            </select>

            <select
              value={manualYear}
              onChange={e => setManualYear(e.target.value)}
              style={{
                width:"100%",
                padding:"10px 12px",
                border:"1px solid var(--border)",
                borderRadius:6,
                fontSize:"0.9rem",
                marginBottom:12,
                fontFamily:"var(--sans)",
                outline:"none"
              }}
            >
              <option value="">Year (optional)</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
            </select>

            <textarea
              value={manualNote}
              onChange={e => setManualNote(e.target.value)}
              placeholder="Additional note (optional)"
              style={{
                width:"100%",
                padding:"10px 12px",
                border:"1px solid var(--border)",
                borderRadius:6,
                fontSize:"0.9rem",
                marginBottom:12,
                fontFamily:"var(--sans)",
                outline:"none",
                minHeight:80,
                resize:"none"
              }}
            />

            <div style={{marginBottom:12}}>
              <label style={{display:"block", fontSize:"0.85rem", fontWeight:600, marginBottom:8}}>
                Upload ID proof
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setProofFile(e.target.files?.[0] || null)}
                style={{
                  width:"100%",
                  padding:"10px",
                  border:"1px solid var(--border)",
                  borderRadius:6,
                  fontSize:"0.85rem",
                  fontFamily:"var(--sans)"
                }}
              />
            </div>

            <button
              onClick={handleManualSubmit}
              disabled={submitLoading}
              style={{
                width:"100%",
                padding:"12px 16px",
                background:"var(--ink)",
                color:"var(--white)",
                border:"none",
                borderRadius:6,
                fontSize:"0.9rem",
                fontWeight:600,
                cursor:"pointer",
                opacity: submitLoading ? 0.7 : 1
              }}
            >
              {submitLoading ? "Submitting..." : "Submit for verification"}
            </button>

            {error && <div style={{color:"var(--accent)", fontSize:"0.8rem", marginTop:12}}>{error}</div>}
          </div>
        )}

        {step === "submitted" && (
          <div style={{background:"var(--white)", border:"1px solid var(--border)", borderRadius:12, padding:32, textAlign:"center"}}>
            <div style={{fontSize:"3rem", marginBottom:12}}>✓</div>
            <div style={{fontSize:"1.1rem", fontWeight:600, marginBottom:8}}>Submitted!</div>
            <div style={{fontSize:"0.85rem", color:"var(--ink3)", lineHeight:1.6}}>
              Your verification is pending. Check back soon!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMPOSE BOX ───────────────────────────────────────────────────
function ComposeBox({ user, onPost }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePost() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(fb().db, "posts"), {
        author: user.displayName || "Anonymous",
        email: user.email,
        college: collegeFromEmail(user.email),
        text: text.trim(),
        createdAt: serverTimestamp(),
        w_count: 0,
        l_count: 0,
        approved: user.email === ADMIN_EMAIL
      });
      setText("");
      onPost();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{background:"var(--white)", border:"1px solid var(--border)", borderRadius:8, padding:16, marginBottom:20}}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What's happening at DU?"
        style={{
          width:"100%",
          border:"none",
          fontSize:"1rem",
          fontFamily:"var(--sans)",
          outline:"none",
          minHeight:80,
          resize:"none",
          color:"var(--ink)"
        }}
      />
      <div style={{display:"flex", justifyContent:"flex-end", marginTop:12, gap:8}}>
        {error && <span style={{color:"var(--accent)", fontSize:"0.8rem"}}>{error}</span>}
        <button
          onClick={handlePost}
          disabled={loading || !text.trim()}
          style={{
            padding:"8px 20px",
            background: text.trim() && !loading ? "var(--ink)" : "var(--ink4)",
            color:"var(--white)",
            border:"none",
            borderRadius:6,
            fontSize:"0.85rem",
            fontWeight:600,
            cursor: text.trim() && !loading ? "pointer" : "default",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}

// ─── POST CARD ─────────────────────────────────────────────────────
function PostCard({ post, voted, onVote, saved, onSave, notify }) {
  return (
    <div style={{
      background:"var(--white)",
      border:"1px solid var(--border)",
      borderRadius:8,
      padding:"16px 20px",
      marginBottom:12,
      animation:"fadeIn 0.3s ease-out"
    }}>
      <div style={{display:"flex", gap:12, marginBottom:10}}>
        <div style={{
          width:40,
          height:40,
          borderRadius:"50%",
          background: COL_COLOR[post.college] || "var(--ink3)",
          color:"white",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          fontWeight:600,
          fontSize:"0.9rem",
          flexShrink:0
        }}>
          {initials(post.author)}
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:"0.9rem", fontWeight:600, color:"var(--ink)"}}>
            {post.author}
          </div>
          <div style={{fontSize:"0.75rem", color:"var(--ink3)"}}>
            {colAbbr(post.college)} · {timeAgo(post.createdAt)}
          </div>
        </div>
      </div>

      <p style={{fontSize:"0.95rem", lineHeight:1.6, marginBottom:12, color:"var(--ink)"}}>{post.text}</p>

      <div style={{display:"flex", gap:16, fontSize:"0.8rem", color:"var(--ink3)"}}>
        <button
          onClick={() => onVote(post.id, voted === "w" ? null : "w")}
          style={{
            background:"none",
            border:"none",
            color: voted === "w" ? "var(--green)" : "var(--ink3)",
            cursor:"pointer",
            fontWeight: voted === "w" ? 600 : 400,
            fontSize:"0.8rem"
          }}
        >
          W {post.w_count}
        </button>
        <button
          onClick={() => onVote(post.id, voted === "l" ? null : "l")}
          style={{
            background:"none",
            border:"none",
            color: voted === "l" ? "var(--accent)" : "var(--ink3)",
            cursor:"pointer",
            fontWeight: voted === "l" ? 600 : 400,
            fontSize:"0.8rem"
          }}
        >
          L {post.l_count}
        </button>
        <button
          onClick={() => onSave(post.id)}
          style={{
            background:"none",
            border:"none",
            color: saved ? "var(--blue)" : "var(--ink3)",
            cursor:"pointer",
            fontWeight: saved ? 600 : 400,
            fontSize:"0.8rem"
          }}
        >
          {saved ? "✓" : "○"} Save
        </button>
      </div>
    </div>
  );
}

// ─── MAIN FEED ─────────────────────────────────────────────────────
function UnrestFeed() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [voted, setVoted] = useState({});
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [tab, setTab] = useState("du");
  const [searchQ, setSearchQ] = useState("");
  const [searchCollege, setSearchCollege] = useState("");
  const [feedLoading, setFeedLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);

  const TABS = [
    { id: "du", label: "DU Feed" },
    { id: "college", label: "College" },
    { id: "explore", label: "Explore" },
    { id: "saved", label: "Saved" },
    { id: "mod", label: "Mod Panel" }
  ];

  useEffect(() => {
    const unsub = onAuthStateChanged(fb().auth, user => {
      if (user) {
        setUser(user);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    setFeedLoading(true);

    let q = query(collection(fb().db, "posts"), where("approved", "==", true), orderBy("createdAt", "desc"));
    if (tab === "college") {
      const userCollege = collegeFromEmail(user.email);
      q = query(collection(fb().db, "posts"), where("college", "==", userCollege), where("approved", "==", true), orderBy("createdAt", "desc"));
    }

    const unsub = onSnapshot(q, snapshot => {
      setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setFeedLoading(false);
    });

    return () => unsub();
  }, [user, tab]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(fb().db, "votes"), snapshot => {
      const voteMap = {};
      snapshot.docs.forEach(d => {
        const data = d.data();
        if (data.userId === user.uid) {
          voteMap[data.postId] = data.vote;
        }
      });
      setVoted(voteMap);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(fb().db, "saves"), snapshot => {
      const saved = new Set();
      snapshot.docs.forEach(d => {
        const data = d.data();
        if (data.userId === user.uid) {
          saved.add(data.postId);
        }
      });
      setSavedPosts(saved);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    const unsub = onSnapshot(query(collection(fb().db, "posts"), where("approved", "==", false)), snapshot => {
      setPendingPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    const unsub = onSnapshot(collection(fb().db, "manual_verifications"), snapshot => {
      setPendingVerifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter(v => v.status === "pending"));
    });
    return () => unsub();
  }, [user]);

  function notify(msg) {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }

  async function handleVote(postId, voteType) {
    if (!user) return;
    try {
      const existing = await query(collection(fb().db, "votes"), where("postId", "==", postId), where("userId", "==", user.uid));
      const snap = await onSnapshot(existing, s => {
        s.docs.forEach(d => deleteDoc(d.ref));
      });
      if (voteType) {
        await addDoc(collection(fb().db, "votes"), { postId, userId: user.uid, vote: voteType, createdAt: serverTimestamp() });
        const postRef = doc(fb().db, "posts", postId);
        if (voteType === "w") await updateDoc(postRef, { w_count: increment(1) });
        else await updateDoc(postRef, { l_count: increment(1) });
      }
    } catch (err) {
      notify("Vote failed: " + err.message);
    }
  }

  async function handleSave(postId) {
    if (!user) return;
    try {
      if (savedPosts.has(postId)) {
        const snap = await query(collection(fb().db, "saves"), where("postId", "==", postId), where("userId", "==", user.uid));
        const unsub = onSnapshot(snap, s => {
          s.docs.forEach(d => deleteDoc(d.ref));
        });
      } else {
        await addDoc(collection(fb().db, "saves"), { postId, userId: user.uid, createdAt: serverTimestamp() });
      }
    } catch (err) {
      notify("Save failed: " + err.message);
    }
  }

  async function approvePost(postId) {
    try {
      await updateDoc(doc(fb().db, "posts", postId), { approved: true });
      notify("Post approved");
    } catch (err) {
      notify("Approve failed: " + err.message);
    }
  }

  async function rejectPost(postId) {
    try {
      await deleteDoc(doc(fb().db, "posts", postId));
      notify("Post deleted");
    } catch (err) {
      notify("Delete failed: " + err.message);
    }
  }

  async function resolveVerification(verificationId, action) {
    try {
      await updateDoc(doc(fb().db, "manual_verifications", verificationId), { status: action === "approved" ? "verified" : "rejected" });
      notify(`Verification ${action}`);
    } catch (err) {
      notify("Resolution failed: " + err.message);
    }
  }

  if (loading) {
    return (
      <div style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--paper)"}}>
        <style>{CSS}</style>
        <span style={{display:"inline-block", width:32, height:32, border:"2px solid var(--border)", borderTopColor:"var(--ink)", borderRadius:"50%", animation:"spin 0.7s linear infinite"}}/>
      </div>
    );
  }

  if (!user) {
    return <AuthGate onAuth={setUser}/>;
  }

  const visible = posts.filter(p => {
    if (tab === "saved") return savedPosts.has(p.id);
    if (searchQ && !p.text.toLowerCase().includes(searchQ.toLowerCase())) return false;
    if (searchCollege && p.college !== searchCollege) return false;
    return true;
  });

  return (
    <div style={{minHeight:"100vh", background:"var(--paper)"}}>
      <style>{CSS}</style>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            position:"fixed",
            bottom:20,
            left:"50%",
            transform:"translateX(-50%)",
            background:"var(--ink)",
            color:"var(--white)",
            padding:"12px 20px",
            borderRadius:6,
            fontSize:"0.85rem",
            animation:"toastIn 0.2s ease-out",
            zIndex:9999
          }}
        >
          {t.msg}
        </div>
      ))}

      <div style={{display:"grid", gridTemplateColumns:"280px 1fr 240px", gap:20, maxWidth:"1400px", margin:"0 auto", minHeight:"100vh", padding:"20px", "@media (max-width: 1024px)": {gridTemplateColumns:"1fr"}}}>
        
        <aside style={{padding:"24px 0", borderRight:"1px solid var(--border)", "@media (max-width: 1024px)": {display:"none"}}}>
          <div style={{fontSize:"1.2rem", fontWeight:700, marginBottom:24, color:"var(--ink)"}}>Unrest</div>

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

        <main style={{padding:"0", minWidth:0, "@media (max-width: 1024px)": {padding:0}}}>
          {/* Mobile nav */}
          <div style={{display:"none", "@media (max-width: 1024px)": {display:"flex", gap:8, marginBottom:12, overflowX:"auto", paddingBottom:8}}}>
            {TABS.filter(t => t.id !== "mod").map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding:"8px 14px",
                  background: tab === t.id ? "var(--ink)" : "var(--white)",
                  color: tab === t.id ? "var(--white)" : "var(--ink)",
                  border: tab === t.id ? "none" : "1px solid var(--border)",
                  borderRadius:6,
                  fontSize:"0.8rem",
                  fontWeight: tab === t.id ? 600 : 400,
                  cursor:"pointer",
                  whiteSpace:"nowrap",
                  flexShrink:0
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab !== "mod" ? (
            <>
              <ComposeBox user={user} onPost={() => notify("Posted! Pending approval.")}/>

              {/* Banner carousel */}
              <BannerCarousel banners={BANNERS[tab] || BANNERS.du}/>

              <div style={{display:"flex", gap:8, marginBottom:18, "@media (max-width: 768px)": {flexDirection:"column"}}}>
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

        <aside style={{padding:"24px 0", borderLeft:"1px solid var(--border)", "@media (max-width: 1024px)": {display:"none"}}}>
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
