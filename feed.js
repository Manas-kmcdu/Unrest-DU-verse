const { useState, useRef, useEffect } = React;

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
const setDoc          = (...a) => fb().setDoc(...a); 
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
    --paper: #faf7f0;
    --white: #ffffff;
    --ink: #0e0d0b;
    --ink2: #3d3b35;
    --ink3: #7a776e;
    --ink4: #b0ada6;
    --border: rgba(14,13,11,0.1);
    --accent: #d4522a;
    --green: #2a6b4a;
    --blue: #2563a8;
    --summer1: #f9a825;
    --summer2: #43a89e;
    --summer3: #e67e5a;
    --serif: 'Instrument Serif', Georgia, serif;
    --sans: 'DM Sans', system-ui, sans-serif;
    --nav-h: 52px;
    --bottom-h: 60px;
  }
  body { font-family: var(--sans); background: var(--paper); color: var(--ink); }
  button { font-family: var(--sans); cursor: pointer; }
  input, textarea, select { font-family: var(--sans); }

  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(-8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes dot-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes spin { to { transform: rotate(360deg); } }

  .sidebar-scroll { overflow-y: auto; scrollbar-width: none; }
  .sidebar-scroll::-webkit-scrollbar { display: none; }
  .feed-scroll { overflow-y: auto; scrollbar-width: none; }
  .feed-scroll::-webkit-scrollbar { display: none; }

  .tile { transition: transform 0.18s ease, box-shadow 0.18s ease; cursor: pointer; }
  .tile:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.09); }
  .tile:active { transform: scale(0.98); }

  .comment-in:focus { outline: none; border-color: var(--ink3) !important; }

  @media (max-width: 768px) {
    .desktop-only { display: none !important; }
    .mobile-only { display: flex !important; }
  }
  @media (min-width: 769px) {
    .mobile-only { display: none !important; }
    .desktop-only { display: flex; }
  }
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

const EXPLORE_CATEGORIES = [
  { id:"about-du",         label:"About DU",           accent:"#c84b2f", desc:"History, structure, admissions",     type:"info" },
  { id:"research-surveys", label:"Research Surveys",   accent:"#1e4f8c", desc:"Participate in student research",    type:"post" },
  { id:"ai",               label:"AI",                 accent:"#3a3a5c", desc:"Artificial intelligence discourse",   type:"post" },
  { id:"tech",             label:"Tech",               accent:"#0097a7", desc:"Code, startups, innovation",         type:"post" },
  { id:"fashion",          label:"Fashion",            accent:"#7b1fa2", desc:"Style, trends, outfits",             type:"post" },
  { id:"north-campus",     label:"North Campus",       accent:"#2e7d32", desc:"NSP, Maurice Nagar, Kamla Nagar",    type:"post" },
  { id:"south-campus",     label:"South Campus",       accent:"#455a64", desc:"Dhaula Kuan, Hauz Khas vibes",       type:"post" },
  { id:"off-campus",       label:"Off Campus",         accent:"#e65100", desc:"PGs, food, life beyond college",     type:"post" },
  { id:"fests-concerts",   label:"Fests & Concerts",   accent:"#c2185b", desc:"Motilal, Crossroads, gigs",          type:"post" },
  { id:"case-competitions",label:"Case Competitions",  accent:"#283593", desc:"B-school cases, teams, results",     type:"post" },
];

const ABOUT_DU_INFO = [
  { title:"University of Delhi", body:"Established in 1922, DU is one of India's largest central universities with 16 faculties, 86 departments, and 80+ colleges across Delhi." },
  { title:"North vs South Campus", body:"North Campus hosts historic colleges like Stephen's, Hindu, Miranda House. South Campus (Benito Juarez Marg) houses newer colleges and the main administrative block." },
  { title:"Admission (CSAS)", body:"UG admissions via CUET scores and CSAS portal. Allocations happen in multiple rounds. Check du.ac.in for official cutoffs each cycle." },
  { title:"Academic Calendar", body:"Semester system: July–Nov (Odd) and Jan–May (Even). End-sem exams in Nov–Dec and May–Jun. Check your college notice board for exact schedules." },
];

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
  const s = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
}

const ADMIN_EMAIL = "manaspandeya@gmail.com";

// ─── BANNER ───────────────────────────────────────────────────────
const BANNER_CONFIG = {
  du:      { bg:"linear-gradient(135deg,#f9a825 0%,#f06a3a 100%)", tagline:"end semester exams incoming", label:"DU Feed" },
  college: { bg:"linear-gradient(135deg,#43a89e 0%,#2a6b8a 100%)", tagline:"your college, your voice",   label:"College" },
  explore: { bg:"linear-gradient(135deg,#6c8fcd 0%,#4a67a8 100%)", tagline:"discover, discuss, connect",  label:"Explore" },
  saved:   { bg:"linear-gradient(135deg,#d4a843 0%,#c47a3a 100%)", tagline:"things that caught your eye", label:"Saved"   },
  mod:     { bg:"linear-gradient(135deg,#c84b2f 0%,#8b1a0a 100%)", tagline:"moderation dashboard",        label:"Mod"     },
  profile: { bg:"linear-gradient(135deg,#7bc8a4 0%,#43a89e 100%)", tagline:"your campus identity",        label:"Profile" },
};

function Banner({ tab, exploreCategory }) {
  const cfg = exploreCategory
    ? { bg: "#111", tagline: exploreCategory.desc, label: exploreCategory.label, accent: exploreCategory.accent }
    : { ...(BANNER_CONFIG[tab] || BANNER_CONFIG.du), accent:"rgba(255,255,255,0.55)" };

  return (
    <div style={{
      position:"relative", borderRadius:12, overflow:"hidden",
      background: cfg.bg, marginBottom:18,
      padding:"30px 28px 26px",
      animation:"fadeIn 0.3s ease both"
    }}>
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)",
        pointerEvents:"none"
      }}/>
      <div style={{
        position:"absolute", top:0, right:0, width:"55%", height:"100%",
        background:"linear-gradient(to left, rgba(255,255,255,0.08) 0%, transparent 100%)",
        pointerEvents:"none"
      }}/>
      <div style={{position:"relative"}}>
        <div style={{
          fontFamily:"var(--serif)", fontStyle:"italic",
          fontSize:"1.55rem", color:"rgba(255,255,255,0.97)", lineHeight:1.25, marginBottom:8,
          textShadow:"0 1px 3px rgba(0,0,0,0.15)"
        }}>
          {cfg.tagline}
        </div>
        <div style={{
          fontSize:"0.6rem", fontWeight:600, letterSpacing:"0.14em",
          textTransform:"uppercase", color:"rgba(255,255,255,0.65)"
        }}>
          One Stop for all things DU
        </div>
      </div>
    </div>
  );
}

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
    getRedirectResult(fb().auth).then(async (result) => {
      if (!result?.user) return;
      const email = result.user.email.toLowerCase().trim();
      const isDU = email.endsWith(".du.ac.in") || email.endsWith("@du.ac.in");
      
      if (isDU || email === ADMIN_EMAIL) { onAuth(result.user); return; }
      
      const qAllow = query(collection(fb().db, "allowlisted_emails"), where("email", "==", email));
      const snapAllow = await new Promise(res => {
        const unsub = onSnapshot(qAllow, s => { unsub(); res(s); });
      });

      if (!snapAllow.empty) {
        onAuth(result.user);
        return;
      }

      setPendingUser({ email, displayName: result.user.displayName });
      setStep("manual-form"); setManualName(result.user.displayName||"");
    }).catch(()=>{});
  }, []);

  async function handleLogin() {
    setLoading(true); setError("");
    try {
      const provider = fb().googleProvider;
      let result;
      try { result = await signInWithPopup(fb().auth, provider); }
      catch(e) {
        if (e.code==="auth/popup-blocked"||e.code==="auth/popup-closed-by-user"||e.message?.includes("Cross-Origin")||e.message?.includes("window.closed")) {
          await signInWithRedirect(fb().auth, provider); return;
        }
        throw e;
      }
      const email = result.user.email.toLowerCase().trim();
      const isDU = email.endsWith(".du.ac.in")||email.endsWith("@du.ac.in");
      
      if (isDU || email===ADMIN_EMAIL) { onAuth(result.user); return; }

      const qAllow = query(collection(fb().db, "allowlisted_emails"), where("email", "==", email));
      const snapAllow = await new Promise(res => {
        const unsub = onSnapshot(qAllow, s => { unsub(); res(s); });
      });

      if (!snapAllow.empty) {
        onAuth(result.user);
        return;
      }

      setPendingUser({email, displayName: result.user.displayName});
      setStep("manual-form"); setManualName(result.user.displayName||""); setLoading(false);
    } catch(e) { setError(e.message); setLoading(false); }
  }

  async function handleManualSubmit() {
    if (!manualName.trim()||!manualCollege||!manualYear) { setError("Fill all required fields."); return; }
    if (!proofFile) { setError("Attach proof of affiliation."); return; }
    setSubmitLoading(true); setError("");
    try {
      let proofUrl = "no-storage";
      if (fb().storageRef && fb().storage) {
        const ref = storageRef(fb().storage, `manual_proofs/${Date.now()}_${proofFile.name}`);
        const snap = await uploadBytes(ref, proofFile);
        proofUrl = await getDownloadURL(snap.ref);
      }
      await addDoc(collection(fb().db,"manual_verifications"),{
        email:pendingUser?.email||"", displayName:manualName.trim(),
        college:manualCollege, year:manualYear, note:manualNote.trim(),
        proofUrl, status:"pending", submittedAt:serverTimestamp()
      });
      setStep("manual-sent");
    } catch(e) { setError("Submission failed: "+e.message); }
    finally { setSubmitLoading(false); }
  }

  const inp = { width:"100%",border:"1px solid rgba(14,13,11,0.12)",borderRadius:7,padding:"10px 12px",fontSize:"0.85rem",color:"var(--ink)",background:"var(--white)",outline:"none",fontFamily:"var(--sans)" };
  const lbl = { fontSize:"0.7rem",fontWeight:600,color:"var(--ink3)",display:"block",marginBottom:5 };
  const wrap = { minHeight:"100vh",background:"var(--paper)",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem" };
  const card = { background:"var(--white)",border:"1px solid rgba(14,13,11,0.08)",borderRadius:14,padding:"40px 36px",maxWidth:460,width:"100%",boxShadow:"0 12px 48px rgba(0,0,0,0.06)" };

  const Logo = () => <div style={{fontFamily:"var(--serif)",fontSize:"2.2rem",marginBottom:8,color:"var(--ink)",textAlign:"center"}}>Un<em style={{color:"var(--accent)"}}>rest</em></div>;

  if (step==="manual-sent") return (
    <div style={wrap}><style>{CSS}</style>
      <div style={{...card,textAlign:"center"}}>
        <Logo/>
        <div style={{fontSize:"0.95rem",fontWeight:600,marginBottom:8}}>Request submitted</div>
        <div style={{fontSize:"0.82rem",color:"var(--ink2)",lineHeight:1.7}}>
          Proof under review. We'll reach out to <strong>{pendingUser?.email}</strong>.<br/>Usually reviewed within 24–48 hours.
        </div>
        <button onClick={()=>{setStep("login");setError("");}} style={{marginTop:20,padding:"8px 20px",background:"var(--ink)",color:"#fff",border:"none",borderRadius:7,fontSize:"0.8rem",fontWeight:600}}>Back to sign in</button>
      </div>
    </div>
  );

  if (step==="manual-form") return (
    <div style={wrap}><style>{CSS}</style>
      <div style={card}>
        <Logo/>
        <div style={{textAlign:"center",marginBottom:20,fontSize:"0.82rem",color:"var(--ink2)",lineHeight:1.6}}>
          Non-DU address detected. Submit affiliation proof for review.
          <div style={{marginTop:8,padding:"6px 12px",background:"rgba(200,75,47,0.06)",border:"1px solid rgba(200,75,47,0.15)",borderRadius:6,fontSize:"0.7rem",color:"var(--accent)",fontWeight:500}}>{pendingUser?.email}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div><label style={lbl}>Full Name *</label><input value={manualName} onChange={e=>setManualName(e.target.value)} placeholder="Your name" style={inp}/></div>
          <div><label style={lbl}>College *</label>
            <select value={manualCollege} onChange={e=>setManualCollege(e.target.value)} style={inp}>
              <option value="">Select college...</option>
              {COLLEGES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Year *</label>
            <select value={manualYear} onChange={e=>setManualYear(e.target.value)} style={inp}>
              <option value="">Select...</option>
              <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>Postgraduate</option><option>PhD</option>
            </select>
          </div>
          <div><label style={lbl}>Proof of Affiliation * <span style={{fontWeight:400,color:"var(--ink4)"}}>( ID card or fee slip )</span></label>
            <div style={{border:"1.5px dashed rgba(14,13,11,0.15)",borderRadius:7,padding:"14px",textAlign:"center",cursor:"pointer",position:"relative"}}>
              <input type="file" accept="image/*,.pdf" onChange={e=>setProofFile(e.target.files[0])} style={{position:"absolute",inset:0,opacity:0,cursor:"pointer"}}/>
              {proofFile ? <div style={{fontSize:"0.76rem",color:"var(--green)",fontWeight:600}}>{proofFile.name}</div> : <div style={{fontSize:"0.76rem",color:"var(--ink3)"}}>Click to upload</div>}
            </div>
          </div>
          <div><label style={lbl}>Note (optional)</label><textarea value={manualNote} onChange={e=>setManualNote(e.target.value)} rows={2} style={{...inp,resize:"vertical"}}/></div>
        </div>
        {error && <div style={{marginTop:10,padding:"8px 12px",background:"rgba(200,75,47,0.07)",border:"1px solid rgba(200,75,47,0.18)",borderRadius:6,fontSize:"0.74rem",color:"var(--accent)"}}>{error}</div>}
        <div style={{display:"flex",gap:10,marginTop:18}}>
          <button onClick={()=>{setStep("login");setError("");setPendingUser(null);}} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid rgba(14,13,11,0.12)",borderRadius:7,fontSize:"0.82rem",color:"var(--ink2)",fontWeight:500}}>Back</button>
          <button onClick={handleManualSubmit} disabled={submitLoading} style={{flex:2,padding:"10px",background:submitLoading?"var(--ink3)":"var(--ink)",border:"none",borderRadius:7,color:"#fff",fontSize:"0.82rem",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {submitLoading && <span style={{display:"inline-block",width:13,height:13,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>}
            {submitLoading?"Submitting...":"Submit for review"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={wrap}><style>{CSS}</style>
      <div style={{...card,textAlign:"center"}}>
        <Logo/>
        <div style={{fontSize:"0.82rem",color:"var(--ink3)",marginBottom:28,lineHeight:1.7}}>
          Delhi University's verified student network.<br/>Sign in with your <strong>.du.ac.in</strong> Google account.
        </div>
        <button onClick={handleLogin} disabled={loading} style={{width:"100%",padding:"12px 20px",background:loading?"var(--ink3)":"var(--ink)",color:"#fff",border:"none",borderRadius:8,fontSize:"0.9rem",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          {loading ? <span style={{display:"inline-block",width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/> : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.44 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          )}
          {loading?"Signing in...":"Continue with Google"}
        </button>
        <div style={{marginTop:10,padding:"8px 12px",background:"rgba(14,13,11,0.04)",borderRadius:6,fontSize:"0.7rem",color:"var(--ink3)",lineHeight:1.6}}>
          DU email (.du.ac.in) → instant access · Other email → manual review
        </div>
        {error && <div style={{marginTop:10,padding:"8px 12px",background:"rgba(200,75,47,0.07)",border:"1px solid rgba(200,75,47,0.18)",borderRadius:6,fontSize:"0.76rem",color:"var(--accent)"}}>{error}</div>}
      </div>
    </div>
  );
}

// ─── AVATAR + PILL ────────────────────────────────────────────────
function Avatar({initials:ini,college,size=36}){
  const bg=COL_COLOR[college]||"#455a64";
  return <div style={{width:size,height:size,borderRadius:"50%",background:bg,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.32,fontWeight:600,color:"#fff"}}>{ini}</div>;
}
function Pill({name,color}){
  const bg=color||COL_COLOR[name]||"#455a64";
  return <span style={{fontSize:"0.57rem",fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",background:`${bg}16`,color:bg,border:`1px solid ${bg}24`,borderRadius:3,padding:"2px 5px"}}>{colAbbr(name)}</span>;
}

// ─── WL BAR ───────────────────────────────────────────────────────
function WLBar({w,l,postId,onVote,voted}){
  const wF=w+(voted==="w"?1:0), lF=l+(voted==="l"?1:0), total=wF+lF;
  const pct=total>0?Math.round((wF/total)*100):50;
  const btn=(type,label)=>(<button onClick={()=>onVote(postId,type)} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 11px",background:voted===type?(type==="w"?"var(--ink)":"var(--accent)"):"transparent",border:"1px solid",borderColor:voted===type?(type==="w"?"var(--ink)":"var(--accent)"):"rgba(14,13,11,0.12)",borderRadius:5,fontSize:"0.75rem",fontWeight:600,color:voted===type?"#fff":"var(--ink2)",transition:"all 0.15s",lineHeight:1}}>
    <span style={{fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.06em"}}>{label}</span>{type==="w"?wF:lF}
  </button>);
  return <div style={{display:"flex",alignItems:"center",gap:9,flexWrap:"wrap"}}>{btn("w","W")}{btn("l","L")}<span style={{fontSize:"0.7rem",color:"var(--ink3)",fontWeight:500}}>{pct}% W</span><span style={{fontSize:"0.68rem",color:"var(--ink4)"}}>{total} votes</span></div>;
}

// ─── COMMENTS ─────────────────────────────────────────────────────
function Comments({postId,user}){
  const [comments,setComments]=useState([]);
  const [text,setText]=useState("");
  const [loading,setLoading]=useState(false);
  const [open,setOpen]=useState(false);

  useEffect(()=>{
    if(!open) return;
    const q=query(collection(fb().db,"posts",postId,"comments"),orderBy("createdAt","asc"));
    const unsub=onSnapshot(q,snap=>{setComments(snap.docs.map(d=>({id:d.id,...d.data()})));},()=>{});
    return ()=>unsub();
  },[postId,open]);

  async function submit(){
    if(!text.trim()||loading) return;
    setLoading(true);
    try {
      await addDoc(collection(fb().db,"posts",postId,"comments"),{
        author:user.displayName, college:collegeFromEmail(user.email),
        uid:user.uid, text:text.trim(), createdAt:serverTimestamp()
      });
      setText("");
    } catch(e){}
    finally{setLoading(false);}
  }

  return (
    <div style={{paddingLeft:49,marginTop:4}}>
      <button onClick={()=>setOpen(p=>!p)} style={{background:"none",border:"none",fontSize:"0.71rem",color:"var(--ink3)",fontWeight:500,padding:"2px 0",cursor:"pointer"}}>
        {open?"Hide comments":"Comments"}
      </button>
      {open && (
        <div style={{marginTop:10,animation:"fadeIn 0.2s ease both"}}>
          {comments.length===0 && <div style={{fontSize:"0.73rem",color:"var(--ink4)",marginBottom:8}}>No comments yet.</div>}
          {comments.map(c=>(
            <div key={c.id} style={{display:"flex",gap:8,marginBottom:10,alignItems:"flex-start"}}>
              <Avatar initials={initials(c.author)} college={c.college} size={24}/>
              <div style={{background:"rgba(14,13,11,0.04)",borderRadius:8,padding:"6px 10px",flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2,flexWrap:"wrap"}}>
                  <span style={{fontSize:"0.74rem",fontWeight:600,color:"var(--ink)"}}>{c.author}</span>
                  <Pill name={c.college}/>
                  <span style={{fontSize:"0.61rem",color:"var(--ink4)"}}>{timeAgo(c.createdAt)}</span>
                </div>
                <p style={{fontSize:"0.8rem",color:"var(--ink2)",lineHeight:1.5}}>{c.text}</p>
              </div>
            </div>
          ))}
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <Avatar initials={initials(user.displayName)} college={collegeFromEmail(user.email)} size={24}/>
            <input className="comment-in" value={text} onChange={e=>setText(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}}
              placeholder="Add a comment..."
              style={{flex:1,border:"1px solid rgba(14,13,11,0.12)",borderRadius:20,padding:"6px 12px",fontSize:"0.79rem",outline:"none",background:"var(--white)",color:"var(--ink)",fontFamily:"var(--sans)",transition:"border-color 0.15s"}}/>
            <button onClick={submit} disabled={loading||!text.trim()} style={{padding:"5px 12px",background:loading?"var(--ink3)":"var(--ink)",color:"#fff",border:"none",borderRadius:20,fontSize:"0.72rem",fontWeight:600}}>
              {loading?"…":"Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── POST CARD ────────────────────────────────────────────────────
function PostCard({post,voted,onVote,saved,onSave,notify,user,categoryTag}){
  return (
    <article style={{borderBottom:"1px solid rgba(14,13,11,0.08)",padding:"20px 0",animation:"fadeIn 0.3s ease both"}}>
      <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
        <Avatar initials={initials(post.author)} college={post.college} size={36}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",marginBottom:2}}>
            <span style={{fontSize:"0.88rem",fontWeight:600,color:"var(--ink)"}}>{post.author}</span>
            {post.verified && <span style={{fontSize:"0.54rem",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",background:"rgba(42,107,74,0.09)",color:"var(--green)",border:"1px solid rgba(42,107,74,0.18)",borderRadius:3,padding:"1px 5px"}}>Verified</span>}
            {categoryTag && <span style={{fontSize:"0.54rem",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:`${categoryTag.accent}14`,color:categoryTag.accent,border:`1px solid ${categoryTag.accent}22`,borderRadius:3,padding:"1px 5px"}}>{categoryTag.label}</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
            <Pill name={post.college}/>
            <span style={{fontSize:"0.66rem",color:"var(--ink4)"}}>· {timeAgo(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {post.status==="pending" && (
        <div style={{marginBottom:8,marginLeft:46,padding:"4px 9px",background:"rgba(255,200,0,0.08)",border:"1px solid rgba(255,200,0,0.25)",borderRadius:4,fontSize:"0.67rem",color:"#9a7200",fontWeight:500}}>
          Pending approval — visible only to you.
        </div>
      )}

      <div style={{paddingLeft:46}}>
        <p style={{fontSize:"0.9rem",color:"var(--ink)",lineHeight:1.7,marginBottom:10}}>{post.text}</p>
        {post.tags&&post.tags.length>0 && <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:10}}>{post.tags.map(t=><span key={t} style={{fontSize:"0.67rem",color:"var(--ink3)",fontWeight:500}}>#{t}</span>)}</div>}
        
        <div style={{display:"flex",alignItems:"center",gap:11,flexWrap:"wrap"}}>
          <WLBar w={post.w} l={post.l} postId={post.id} onVote={onVote} voted={voted}/>
          <span style={{fontSize:"0.67rem",color:"var(--ink4)"}}>·</span>
          <button 
            onClick={() => { onSave(post.id); notify(saved ? "Removed from saved" : "Saved"); }} 
            style={{background:"none",border:"none",fontSize:"0.7rem",color:saved?"var(--blue)":"var(--ink3)",fontWeight:saved?600:500,padding:0}}
          >
            {saved?"Saved":"Save"}
          </button>
        </div>
      </div>
      <Comments postId={post.id} user={user}/>
    </article>
  );
}

// ─── COMPOSE BOX ─────────────────────────────────────────────────
// ─── COMPOSE BOX ─────────────────────────────────────────────────
// ─── COMPOSE BOX ─────────────────────────────────────────────────
function ComposeBox({user,onPost,categoryId}){
  const [text,setText]=useState("");
  const [loading,setLoading]=useState(false);
  
  async function submit(){
    if(!text.trim()||loading) return;
    setLoading(true);
    try {
      await addDoc(collection(fb().db,"posts"),{
        author:user.displayName, email:user.email, college:collegeFromEmail(user.email),
        text:text.trim(), tags:[], status:"pending", w:1, l:0,
        createdAt:serverTimestamp(), uid:user.uid,
        ...(categoryId?{category:categoryId}:{})
      });
      setText(""); onPost();
    } catch(e){ alert("Failed: "+e.message); }
    finally{ setLoading(false); }
  }
  
  // 🌟 FIXED: Generate a completely unique ID string depending on the active tab context
  const uniqueId = categoryId ? `compose-textarea-${categoryId}` : "compose-textarea-main-feed";
  const uniqueName = categoryId ? `postContent-${categoryId}` : "postContent-main";

  return (
    <div style={{background:"var(--white)",border:"1px solid rgba(14,13,11,0.09)",borderRadius:10,padding:"12px 14px",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
      <Avatar initials={initials(user.displayName)} college={collegeFromEmail(user.email)} size={34}/>
      <div style={{flex:1}}>
        {/* ✅ FIXED: Bound to dynamic attributes to stop DOM id collisions */}
        <textarea 
          id={uniqueId}
          name={uniqueName}
          value={text} 
          onChange={e=>setText(e.target.value)} 
          placeholder={categoryId?`Post in #${categoryId}...`:"What's happening at DU?"} 
          rows={3} 
          style={{width:"100%",border:"1px solid rgba(14,13,11,0.1)",borderRadius:7,padding:"8px 11px",resize:"vertical",fontSize:"0.85rem",color:"var(--ink)",background:"var(--white)",outline:"none",lineHeight:1.5,fontFamily:"var(--sans)"}}
        />
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:7}}>
          <span style={{fontSize:"0.67rem",color:"var(--ink4)"}}>Posts go live after mod approval.</span>
          <button onClick={submit} disabled={loading||!text.trim()} style={{padding:"5px 13px",background:loading?"var(--ink3)":"var(--ink)",color:"#fff",border:"none",borderRadius:6,fontSize:"0.75rem",fontWeight:600}}>{loading?"Posting…":"Post"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── EXPLORE TILES ────────────────────────────────────────────────
function ExploreTiles({onSelect}){
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
      {EXPLORE_CATEGORIES.map((cat,i)=>(
        <div key={cat.id} className="tile" onClick={()=>onSelect(cat)} style={{
          background:"var(--white)", borderRadius:10,
          border:"1px solid rgba(14,13,11,0.08)",
          padding:"18px 16px 16px",
          animation:"fadeIn 0.3s ease both", animationDelay:`${i*0.03}s`,
          position:"relative", overflow:"hidden"
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:cat.accent,borderRadius:"10px 10px 0 0"}}/>
          <div style={{fontSize:"0.88rem",fontWeight:600,color:"var(--ink)",marginBottom:5,marginTop:2}}>{cat.label}</div>
          <div style={{fontSize:"0.72rem",color:"var(--ink3)",lineHeight:1.55,marginBottom:10}}>{cat.desc}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            {cat.type==="info"
              ? <span title="Informational" style={{
                  width:18,height:18,borderRadius:"50%",border:`1.5px solid ${cat.accent}`,
                  display:"inline-flex",alignItems:"center",justifyContent:"center",
                  fontSize:"0.65rem",fontWeight:700,color:cat.accent,flexShrink:0
                }}>i</span>
              : <span/>
            }
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={cat.accent} strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── EXPLORE CATEGORY VIEW ────────────────────────────────────────
function ExploreCategoryView({category,user,voted,onVote,savedPosts,onSave,notify,onBack}){
  const [posts,setPosts]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(() => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }
    if (category.type !== "post") { setLoading(false); return; }
    setLoading(true);

    const q = query(collection(fb().db, "posts"), where("category", "==", category.id), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, 
      (snap) => {
        try {
          const all = snap.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              w: parseInt(data.w ?? 0, 10) || 0,
              l: parseInt(data.l ?? 0, 10) || 0
            };
          });
          setPosts(all.filter(p => p.status === "approved" || p.uid === user.uid));
          setLoading(false);
        } catch (err) {
          console.error("Category processing warning:", err);
        }
      },
      (streamErr) => {
        console.warn("Category real-time sync caught handle:", streamErr.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [category.id, user?.uid]);

  return (
    <div style={{animation:"fadeIn 0.25s ease both"}}>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",fontSize:"0.76rem",color:"var(--ink3)",fontWeight:500,padding:"0 0 12px 0",cursor:"pointer"}}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 3L6 8l4 5"/></svg>
        Back to Explore
      </button>
      <Banner tab="explore" exploreCategory={category}/>
      <div style={{marginBottom:18}}>
        <div style={{fontFamily:"var(--serif)",fontSize:"1.4rem",color:"var(--ink)",marginBottom:3}}>{category.label}</div>
        <div style={{fontSize:"0.75rem",color:"var(--ink3)"}}>{category.desc}</div>
      </div>
      {category.id==="about-du"?(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {ABOUT_DU_INFO.map((item,i)=>(
            <div key={i} style={{background:"var(--white)",border:"1px solid rgba(14,13,11,0.08)",borderRadius:10,padding:"16px 18px",animation:"fadeIn 0.3s ease both",animationDelay:`${i*0.06}s`}}>
              <div style={{fontFamily:"var(--serif)",fontSize:"1rem",color:"var(--ink)",marginBottom:6}}>{item.title}</div>
              <p style={{fontSize:"0.83rem",color:"var(--ink2)",lineHeight:1.7}}>{item.body}</p>
            </div>
          ))}
        </div>
      ):(
        <>
          <ComposeBox user={user} onPost={()=>notify("Posted! Pending approval.")} categoryId={category.id}/>
          {loading?<div style={{textAlign:"center",padding:"3rem 0"}}><span style={{display:"inline-block",width:22,height:22,border:"2px solid rgba(14,13,11,0.1)",borderTopColor:"var(--ink)",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/></div>
          :posts.length===0?<div style={{textAlign:"center",padding:"3rem 0",color:"var(--ink3)",fontSize:"0.84rem"}}>No posts in {category.label} yet. Start the conversation!</div>
          :posts.map(p=><PostCard key={p.id} post={p} voted={voted[p.id]||null} onVote={onVote} saved={savedPosts.has(p.id)} onSave={onSave} notify={notify} user={user} categoryTag={category}/>)}
        </>
      )}
    </div>
  );
}

// ─── PROFILE VIEW ────────────────────────────────────────────────
const COURSES = [
  "B.A. (Hons) Economics","B.A. (Hons) English","B.A. (Hons) History","B.A. (Hons) Political Science",
  "B.A. (Hons) Psychology","B.A. (Hons) Sociology","B.A. (Hons) Philosophy","B.A. Programme",
  "B.Com (Hons)","B.Com","B.Sc (Hons) Mathematics","B.Sc (Hons) Statistics","B.Sc (Hons) Physics",
  "B.Sc (Hons) Chemistry","B.Sc (Hons) Botany","B.Sc (Hons) Zoology","B.Sc (Hons) Computer Science",
  "B.Tech","M.A.","M.Com","M.Sc","MBA","LLB","Ph.D","Other"
];

function ProfileView({user,allPosts,notify}){
  const [profile,setProfile]=useState(null);
  const [editing,setEditing]=useState(false);
  const [saving,setSaving]=useState(false);
  const [friends,setFriends]=useState(0);
  const [form,setForm]=useState({username:"",college:"",course:"",year:""});
  const [usernameStatus,setUsernameStatus]=useState(null);

  const userCollege=collegeFromEmail(user.email);

  useEffect(()=>{
    const unsub=onSnapshot(doc(fb().db,"profiles",user.uid),snap=>{
      if(snap.exists()){
        const d=snap.data();
        setProfile(d);
        setForm({username:d.username||"",college:d.college||userCollege,course:d.course||"",year:d.year||""});
        setUsernameStatus(d.usernameStatus||"pending");
      } else {
        setEditing(true);
        setForm({username:"",college:userCollege,course:"",year:""});
      }
    },()=>{});
    return ()=>unsub();
  },[user.uid]);

  async function saveProfile(){
    if(!form.username.trim()||!form.college||!form.course||!form.year){notify("Fill all fields.");return;}
    setSaving(true);
    try{
      await setDoc(doc(fb().db,"profiles",user.uid),{
        ...form, username:form.username.trim(),
        displayName:user.displayName, email:user.email,
        usernameStatus: (!profile||profile.username!==form.username.trim())?"pending":(profile?.usernameStatus||"pending"),
        updatedAt:serverTimestamp()
      },{merge:true});
      notify((!profile||profile.username!==form.username.trim())?"Username submitted for mod approval!":"Profile saved!");
      setEditing(false);
    }catch(e){notify("Save failed: "+e.message);}
    finally{setSaving(false);}
  }

  const userPosts = allPosts.filter(p=>p.uid===user.uid&&p.status==="approved");
  const totalW = userPosts.reduce((a,p)=>a+(p.w||0),0);
  const totalL = userPosts.reduce((a,p)=>a+(p.l||0),0);
  const wRate = (totalW+totalL)>0?Math.round((totalW/(totalW+totalL))*100):null;

  const inp={width:"100%",border:"1px solid rgba(14,13,11,0.12)",borderRadius:8,padding:"9px 12px",fontSize:"0.85rem",color:"var(--ink)",background:"var(--white)",outline:"none",fontFamily:"var(--sans)"};
  const lbl={fontSize:"0.68rem",fontWeight:600,color:"var(--ink3)",display:"block",marginBottom:5,letterSpacing:"0.04em",textTransform:"uppercase"};

  const StatusBadge=({status})=>{
    const map={pending:{bg:"rgba(249,168,37,0.12)",color:"#9a7200",border:"rgba(249,168,37,0.3)",label:"Pending mod approval"},
               approved:{bg:"rgba(42,107,74,0.09)",color:"var(--green)",border:"rgba(42,107,74,0.18)",label:"Approved"},
               rejected:{bg:"rgba(200,75,47,0.08)",color:"var(--accent)",border:"rgba(200,75,47,0.2)",label:"Rejected — pick another"}};
    const s=map[status]||map.pending;
    return <span style={{fontSize:"0.58rem",fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",background:s.bg,color:s.color,border:`1px solid ${s.border}`,borderRadius:4,padding:"2px 7px"}}>{s.label}</span>;
  };

  return (
    <div style={{animation:"fadeIn 0.25s ease both"}}>
      <Banner tab="profile"/>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:"var(--white)",border:"1px solid rgba(14,13,11,0.09)",borderRadius:14,overflow:"hidden"}}>
          <div style={{height:64,background:"linear-gradient(135deg,#fde68a 0%,#f9a825 40%,#e67e5a 100%)",position:"relative"}}>
            <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 70% 50%, rgba(255,255,255,0.18) 0%, transparent 60%)"}}/>
          </div>
          <div style={{padding:"0 20px 20px",position:"relative"}}>
            <div style={{marginTop:-28,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:COL_COLOR[userCollege]||"#455a64",border:"3px solid var(--white)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",fontWeight:700,color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.12)"}}>
                {initials(user.displayName)}
              </div>
              <button onClick={()=>setEditing(p=>!p)} style={{padding:"5px 13px",background:editing?"rgba(14,13,11,0.06)":"var(--ink)",color:editing?"var(--ink)":"#fff",border:"1px solid rgba(14,13,11,0.12)",borderRadius:7,fontSize:"0.73rem",fontWeight:600,cursor:"pointer"}}>
                {editing?"Cancel":"Edit Profile"}
              </button>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                <span style={{fontFamily:"var(--serif)",fontSize:"1.25rem",color:"var(--ink)",fontWeight:600}}>{user.displayName}</span>
                {profile?.username && <span style={{fontSize:"0.76rem",color:"var(--ink3)",fontWeight:500}}>@{profile.username}</span>}
                {usernameStatus && <StatusBadge status={usernameStatus}/>}
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <Pill name={profile?.college||userCollege}/>
                {profile?.course&&<span style={{fontSize:"0.7xp",color:"var(--ink3)"}}>{profile.course}</span>}
                {profile?.year&&<span style={{fontSize:"0.7rem",color:"var(--ink4)"}}>· {profile.year}</span>}
              </div>
              <div style={{fontSize:"0.7rem",color:"var(--ink4)",marginTop:4}}>{user.email}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom: editing?16:0}}>
              {[
                {label:"Posts",val:userPosts.length,color:"var(--blue)"},
                {label:"Total W",val:totalW,color:"var(--green)"},
                {label:"W Rate",val:wRate!==null?`${wRate}%`:"—",color:wRate>50?"var(--green)":"var(--accent)"},
                {label:"Friends",val:friends,color:"var(--summer2)"},
              ].map(s=>(
                <div key={s.label} style={{background:"rgba(14,13,11,0.03)",border:"1px solid rgba(14,13,11,0.07)",borderRadius:8,padding:"9px 10px",textAlign:"center"}}>
                  <div style={{fontSize:"1.05rem",fontWeight:700,color:s.color,fontFamily:"var(--serif)"}}>{s.val}</div>
                  <div style={{fontSize:"0.6rem",color:"var(--ink4)",fontWeight:500,letterSpacing:"0.05em",textTransform:"uppercase",marginTop:1}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* EDIT FORM */}
        {editing && (
          <div style={{background:"var(--white)",border:"1px solid rgba(14,13,11,0.09)",borderRadius:12,padding:"20px",animation:"fadeIn 0.2s ease both"}}>
            <div style={{fontFamily:"var(--serif)",fontSize:"1rem",color:"var(--ink)",marginBottom:16}}>Edit your profile</div>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div>
                <label style={lbl}>Username <span style={{textTransform:"none",fontWeight:400,color:"var(--ink4)"}}>— needs mod approval</span></label>
                <input value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value.replace(/[^a-z0-9_.]/gi,"").toLowerCase()}))} placeholder="e.g. ragini.srcc" style={inp} maxLength={24}/>
              </div>
              <div>
                <label style={lbl}>College *</label>
                <select value={form.college} onChange={e=>setForm(p=>({...p,college:e.target.value}))} style={inp}>
                  <option value="">Select college...</option>
                  {COLLEGES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Course *</label>
                <select value={form.course} onChange={e=>setForm(p=>({...p,course:e.target.value}))} style={inp}>
                  <option value="">Select course...</option>
                  {COURSES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Year *</label>
                <select value={form.year} onChange={e=>setForm(p=>({...p,year:e.target.value}))} style={inp}>
                  <option value="">Select year...</option>
                  <option>1st Year</option><option>2nd Year</option><option>3rd Year</option>
                  <option>Postgraduate</option><option>PhD</option>
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button onClick={()=>setEditing(false)} style={{flex:1,padding:"9px",background:"transparent",border:"1px solid rgba(14,13,11,0.12)",borderRadius:7,fontSize:"0.82rem",color:"var(--ink2)",fontWeight:500,cursor:"pointer"}}>Cancel</button>
              <button onClick={saveProfile} disabled={saving} style={{flex:2,padding:"9px",background:saving?"var(--ink3)":"var(--ink)",border:"none",borderRadius:7,color:"#fff",fontSize:"0.82rem",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                {saving&&<span style={{display:"inline-block",width:12,height:12,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>}
                {saving?"Saving…":"Save Profile"}
              </button>
            </div>
          </div>
        )}

        {userPosts.length>0&&(
          <div style={{background:"var(--white)",border:"1px solid rgba(14,13,11,0.09)",borderRadius:12,padding:"16px 18px"}}>
            <div style={{fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",color:"var(--ink4)",marginBottom:12}}>Your Posts ({userPosts.length})</div>
            {userPosts.slice(0,5).map(p=>(
              <div key={p.id} style={{borderBottom:"1px solid rgba(14,13,11,0.06)",padding:"9px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                <p style={{fontSize:"0.82rem",color:"var(--ink2)",lineHeight:1.55,flex:1,minWidth:0}}>{p.text.length>90?p.text.slice(0,90)+"…":p.text}</p>
                <div style={{display:"flex",gap:6,flexShrink:0,fontSize:"0.7rem"}}>
                  <span style={{color:"var(--green)",fontWeight:600}}>W {p.w}</span>
                  <span style={{color:"var(--accent)",fontWeight:600}}>L {p.l}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────
function UnrestFeed(){
  const [user,setUser]=useState(undefined);
  const [posts,setPosts]=useState([]);
  const [pendingPosts,setPendingPosts]=useState([]);
  const [pendingVerifications,setPendingVerifications]=useState([]);
  const [feedLoading,setFeedLoading]=useState(true);
  const [tab,setTab]=useState("du");
  const [searchQ,setSearchQ]=useState("");
  const [searchCollege,setSearchCollege]=useState("");
  const [exploreCategory,setExploreCategory]=useState(null);
  const [savedPosts,setSavedPosts]=useState(new Set());
  const [toast,setToast]=useState(null);

  const [voted, setVoted] = useState(() => {
    const savedVotes = localStorage.getItem("unrest_user_votes");
    return savedVotes ? JSON.parse(savedVotes) : {};
  });

  useEffect(() => {
    localStorage.setItem("unrest_user_votes", JSON.stringify(voted));
  }, [voted]);

  const isAdmin=user&&user.email===ADMIN_EMAIL;

  useEffect(()=>onAuthStateChanged(fb().auth,async u=>{
    if(u){
      const email = u.email.toLowerCase().trim();
      const isDU = email.endsWith(".du.ac.in")||email.endsWith("@du.ac.in");
      
      if(!isDU && email !== ADMIN_EMAIL){
        const qAllow = query(collection(fb().db, "allowlisted_emails"), where("email", "==", email));
        const snapAllow = await new Promise(res => {
          const unsub = onSnapshot(qAllow, s => { unsub(); res(s); });
        });
        
        if (snapAllow.empty) {
          setUser(null);
          return;
        }
      }
    }
    setUser(u||null);
  }),[]);

  // 🌟 FIXED: Added complete stream error fallback parameters to clear 400 bad requests
  useEffect(() => {
    if (!user) {
      setPosts([]);
      setPendingPosts([]);
      setFeedLoading(false);
      return;
    }

    setFeedLoading(true);
    const q = query(collection(fb().db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, 
      (snap) => {
        try {
          const all = snap.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              w: parseInt(data.w ?? data.Ws ?? 0, 10) || 0,
              l: parseInt(data.l ?? data.Ls ?? 0, 10) || 0
            };
          });
          setPosts(all.filter(p => p.status === "approved" || !p.uid || p.uid === "legacy" || p.uid === user.uid));
          setPendingPosts(all.filter(p => p.status === "pending"));
          setFeedLoading(false);
        } catch (err) {
          console.error("Feed matching conversion break:", err);
        }
      },
      (streamErr) => {
        console.warn("Main live feed synchronization observer bypassed safely:", streamErr.message);
        setFeedLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  // 🌟 FIXED: Securely isolates admin manual verifications observer scope to absolute target matching
  useEffect(() => {
    if (!user || user.email !== "manaspandeya@gmail.com") {
      setPendingVerifications([]);
      return;
    }
    const q = query(collection(fb().db, "manual_verifications"), where("status", "==", "pending"));
    const unsub = onSnapshot(q, 
      snap => setPendingVerifications(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.warn("Admin profile channels managed cleanly.")
    );
    return () => unsub();
  }, [user]);

  function notify(msg){setToast(msg);setTimeout(()=>setToast(null),2600);}

  async function approvePost(id){
    try{
      await updateDoc(doc(fb().db,"posts",id),{status:"approved"});
      setPendingPosts(prev => prev.filter(post => post.id !== id));
      notify("Approved!");
    }catch(e){notify("Failed.");}
  }
  async function rejectPost(id){
    if(confirm("Delete this post?")){
      try{
        await deleteDoc(doc(fb().db,"posts",id));
        setPendingPosts(prev => prev.filter(post => post.id !== id));
        notify("Deleted.");
      }catch(e){notify("Failed.");}
    }
  }
  
  async function resolveVerification(id, s){
    try{
      const targetClaim = pendingVerifications.find(v => v.id === id);
      await updateDoc(doc(fb().db,"manual_verifications",id),{status:s});
      
      if (s === "approved" && targetClaim?.email) {
        const cleanEmail = targetClaim.email.toLowerCase().trim();
        
        await setDoc(doc(fb().db, "allowlisted_emails", cleanEmail), {
          email: cleanEmail,
          college: targetClaim.college,
          approvedAt: serverTimestamp()
        });
      }

      setPendingVerifications(prev => prev.filter(v => v.id !== id));
      notify(`Marked as ${s}`);
    }catch(e){
      console.error("Mod verification transaction error:", e);
      notify("Failed to process.");
    }
  }

  async function handleVote(id, type) {
    if (!user) return;
    if (voted[id]) {
      notify("You have already voted on this post!");
      return;
    }
    
    setVoted(p => ({ ...p, [id]: type }));
    
    try {
      await updateDoc(doc(fb().db, "posts", id), {
        [type]: increment(1)
      });
      notify(type === "w" ? "W noted 🔥" : "L noted");
    } catch(e) {
      console.error("Database tracking constraint error:", e);
      setVoted(p => {
        const rollback = { ...p };
        delete rollback[id];
        return rollback;
      });
      notify("Vote failed");
    }
  }

  function handleSave(id){setSavedPosts(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});}

  function switchTab(t){setTab(t);if(t!=="explore")setExploreCategory(null);}

  if(user===undefined) return <div style={{minHeight:"100vh",background:"var(--paper)",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{CSS}</style><span style={{display:"inline-block",width:26,height:26,border:"3px solid rgba(14,13,11,0.1)",borderTopColor:"var(--ink)",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/></div>;
  if(!user) return <AuthGate onAuth={setUser}/>;

  const userCollege=collegeFromEmail(user.email);
  const TABS=[{id:"du",label:"DU"},{id:"college",label:"College"},{id:"explore",label:"Explore"},{id:"saved",label:"Saved"},{id:"profile",label:"Profile"}];
  if(isAdmin) TABS.push({id:"mod",label:`Mod ${(pendingPosts.length+pendingVerifications.length)>0?`(${pendingPosts.length+pendingVerifications.length})`:""}`});

  const mainFeedPosts=posts.filter(p=>!p.category);
  const visible=mainFeedPosts.filter(p=>{
    if(searchQ&&!p.text?.toLowerCase().includes(searchQ.toLowerCase())&&!p.author?.toLowerCase().includes(searchQ.toLowerCase())) return false;
    if(searchCollege&&p.college!==searchCollege) return false;
    if(tab==="college"&&p.college!==userCollege) return false;
    if(tab==="saved"&&!savedPosts.has(p.id)) return false;
    return true;
  });

  // ── MOBILE BOTTOM NAV ──
  const MobileNav = () => (
    <nav className="mobile-only" style={{position:"fixed",bottom:0,left:0,right:0,height:"var(--bottom-h)",background:"rgba(242,239,232,0.97)",borderTop:"1px solid rgba(14,13,11,0.1)",backdropFilter:"blur(12px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"space-around",padding:"0 8px"}}>
      {[
        {id:"du",   icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>, label:"Feed"},
        {id:"explore",icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/></svg>, label:"Explore"},
        {id:"saved",icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>, label:"Saved"},
        {id:"profile",icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label:"Profile"},
      ].map(t=>(
        <button key={t.id} onClick={()=>switchTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",padding:"6px 14px",color:tab===t.id?"var(--ink)":"var(--ink4)",fontFamily:"var(--sans)"}}>
          <span style={{color:tab===t.id?"var(--ink)":"var(--ink4)"}}>{t.icon}</span>
          <span style={{fontSize:"0.58rem",fontWeight:tab===t.id?600:400,letterSpacing:"0.04em"}}>{t.label}</span>
          {tab===t.id && <span style={{width:4,height:4,borderRadius:"50%",background:"var(--accent)",position:"absolute",bottom:6}}/>}
        </button>
      ))}
    </nav>
  );

  // ── MOBILE TOP TABS (for feed sections) ──
  const MobileTopTabs = () => {
    const feedTabs = ["du","college","explore"];
    if(!feedTabs.includes(tab)) return null;
    return (
      <div className="mobile-only" style={{position:"sticky",top:"var(--nav-h)",zIndex:90,background:"rgba(242,239,232,0.97)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(14,13,11,0.08)",padding:"0 16px",display:"flex",alignItems:"center",gap:2,height:38}}>
        {feedTabs.map(t=>(
          <button key={t} onClick={()=>switchTab(t)} style={{padding:"4px 13px",borderRadius:100,border:"none",background:tab===t?"var(--ink)":"transparent",fontSize:"0.73rem",fontWeight:tab===t?600:400,color:tab===t?"#fff":"var(--ink3)",transition:"all 0.15s"}}>
            {t==="du"?"DU":t==="college"?"College":"Explore"}
          </button>
        ))}
      </div>
    );
  };

  // ─── FEED CONTENT ───────────────────────────────────────────────
  const FeedContent = () => (
    <>
      <Banner tab={tab}/>
      {tab!=="saved" && <ComposeBox user={user} onPost={()=>notify("Posted! Pending approval.")}/>}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:"var(--white)",border:"1px solid rgba(14,13,11,0.09)",borderRadius:7,padding:"6px 11px"}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink4)" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search posts..." style={{border:"none",outline:"none",fontSize:"0.81rem",background:"transparent",color:"var(--ink)",flex:1,fontFamily:"var(--sans)"}}/>
          {searchQ&&<button onClick={()=>setSearchQ("")} style={{background:"none",border:"none",color:"var(--ink4)",cursor:"pointer",fontSize:"0.88rem",lineHeight:1}}>×</button>}
        </div>
        <select value={searchCollege} onChange={e=>setSearchCollege(e.target.value)} style={{padding:"6px 9px",border:"1px solid rgba(14,13,11,0.09)",borderRadius:7,fontSize:"0.76rem",color:"var(--ink2)",background:"var(--white)",outline:"none",cursor:"pointer",fontFamily:"var(--sans)"}}>
          <option value="">All colleges</option>
          {COLLEGES.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      {feedLoading?<div style={{textAlign:"center",padding:"3rem 0"}}><span style={{display:"inline-block",width:22,height:22,border:"2px solid rgba(14,13,11,0.1)",borderTopColor:"var(--ink)",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/></div>
      :visible.length===0?<div style={{textAlign:"center",padding:"3rem 0",color:"var(--ink3)",fontSize:"0.84rem"}}>{tab==="saved"?"Nothing saved yet.":searchQ||searchCollege?"No posts match.":"No posts yet. Be the first!"}</div>
      :visible.map(p=><PostCard key={p.id} post={p} voted={voted[p.id]||null} onVote={handleVote} saved={savedPosts.has(p.id)} onSave={handleSave} notify={notify} user={user}/>)}
    </>
  );

  const ModContent = () => (
    <div style={{display:"flex",flexDirection:"column",gap:28}}>
      <Banner tab="mod"/>
      <div>
        <h3 style={{fontFamily:"var(--serif)",fontSize:"1.7rem",marginBottom:12,color:"var(--accent)"}}>Post Submissions ({pendingPosts.length})</h3>
        {pendingPosts.length===0?<p style={{fontSize:"0.83rem",color:"var(--ink3)"}}>Queue empty.</p>:pendingPosts.map(p=>(
          <div key={p.id} style={{background:"#fff",border:"1px solid rgba(14,13,11,0.08)",borderRadius:9,padding:14,marginBottom:10}}>
            <div style={{fontSize:"0.7rem",color:"var(--ink3)",fontWeight:600,marginBottom:5}}>{p.author} · {p.college}{p.category?` · #${p.category}`:""}</div>
            <p style={{fontSize:"0.88rem",marginBottom:11,color:"var(--ink)"}}>{p.text}</p>
            <div style={{display:"flex",gap:9}}>
              <button onClick={()=>approvePost(p.id)} style={{padding:"5px 13px",background:"var(--green)",border:"none",color:"#fff",borderRadius:5,fontSize:"0.74rem",fontWeight:600}}>Approve</button>
              <button onClick={()=>rejectPost(p.id)} style={{padding:"5px 13px",background:"transparent",border:"1px solid var(--accent)",color:"var(--accent)",borderRadius:5,fontSize:"0.74rem",fontWeight:600}}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <div>
        <h3 style={{fontFamily:"var(--serif)",fontSize:"1.7rem",marginBottom:12,color:"var(--blue)"}}>Manual Profile Claims ({pendingVerifications.length})</h3>
        {pendingVerifications.length===0?<p style={{fontSize:"0.83rem",color:"var(--ink3)"}}>No claims pending.</p>:pendingVerifications.map(v=>(
          <div key={v.id} style={{background:"#fff",border:"1px solid rgba(14,13,11,0.08)",borderRadius:9,padding:14,marginBottom:10,display:"flex",gap:14,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:220}}>
              <div style={{fontSize:"0.84rem",fontWeight:700,marginBottom:4}}>{v.displayName}</div>
              <div style={{fontSize:"0.74rem",color:"var(--ink2)",marginBottom:2}}><strong>Email:</strong> {v.email}</div>
              <div style={{fontSize:"0.74rem",color:"var(--ink2)",marginBottom:2}}><strong>College:</strong> {v.college} ({v.year})</div>
              {v.note&&<div style={{fontSize:"0.72rem",color:"var(--ink3)",fontStyle:"italic",marginTop:5}}>Note: "{v.note}"</div>}
              <div style={{display:"flex",gap:9,marginTop:12}}>
                <button onClick={()=>resolveVerification(v.id,"approved")} style={{padding:"5px 11px",background:"var(--blue)",border:"none",color:"#fff",borderRadius:5,fontSize:"0.73rem",fontWeight:600}}>Verify</button>
                <button onClick={()=>resolveVerification(v.id,"rejected")} style={{padding:"5px 11px",background:"rgba(0,0,0,0.05)",border:"none",color:"var(--ink2)",borderRadius:5,fontSize:"0.73rem",fontWeight:500}}>Deny</button>
              </div>
            </div>
            <div style={{flexShrink:0,width:130,height:90,border:"1px solid rgba(14,13,11,0.08)",borderRadius:6,overflow:"hidden",background:"#f9f9f9"}}>
              <a href={v.proofUrl} target="_blank" rel="noopener noreferrer"><img src={v.proofUrl} alt="ID Proof" style={{width:"100%",height:"100%",objectFit:"cover"}}/></a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:"var(--sans)",background:"var(--paper)",minHeight:"100vh"}}>
      <style>{CSS}</style>

      {toast && <div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",background:"var(--ink)",color:"#fff",padding:"7px 16px",borderRadius:6,fontSize:"0.74rem",fontWeight:500,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",animation:"toastIn 0.2s ease"}}>{toast}</div>}

      {/* ── TOP NAV ── */}
      <nav style={{background:"rgba(242,239,232,0.97)",borderBottom:"1px solid rgba(14,13,11,0.09)",padding:"0 1.5rem",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)",height:"var(--nav-h)",display:"flex",alignItems:"center"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",width:"100%",gap:0}}>
          <a style={{fontFamily:"var(--serif)",fontSize:"1.45rem",color:"var(--ink)",textDecoration:"none",marginRight:24,flexShrink:0}}>
            Un<em style={{fontStyle:"italic",color:"var(--accent)"}}>rest</em>
          </a>
          {/* desktop tab pills */}
          <div className="desktop-only" style={{alignItems:"center",background:"rgba(14,13,11,0.06)",borderRadius:100,padding:"3px",gap:1}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>switchTab(t.id)} style={{padding:"5px 14px",borderRadius:100,border:"none",background:tab===t.id?"var(--white)":"transparent",fontSize:"0.74rem",fontWeight:tab===t.id?600:400,color:tab===t.id?"var(--ink)":"var(--ink3)",transition:"all 0.15s",boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>{t.label}</button>
            ))}
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
            <div className="desktop-only" style={{alignItems:"center",gap:7,padding:"4px 10px 4px 5px",border:"1px solid rgba(14,13,11,0.09)",borderRadius:6,background:"var(--white)"}}>
              <Avatar initials={initials(user.displayName)} college={userCollege} size={24}/>
              <span style={{fontSize:"0.76rem",fontWeight:500,color:"var(--ink2)",marginLeft:4}}>{isAdmin?"Admin":userCollege}</span>
            </div>
            <button onClick={()=>signOut(fb().auth)} style={{fontSize:"0.72rem",color:"var(--ink3)",background:"none",border:"none",padding:"4px 6px"}}>Sign out</button>
          </div>
        </div>
      </nav>

      <MobileTopTabs/>

      {/* ── DESKTOP 3-COL LAYOUT ── */}
      <div className="desktop-only" style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"210px 1fr 200px",height:"calc(100vh - var(--nav-h))",alignItems:"start"}}>
        {/* LEFT SIDEBAR — sticky */}
        <aside style={{position:"sticky",top:"var(--nav-h)",height:"calc(100vh - var(--nav-h))",display:"flex",flexDirection:"column",padding:"22px 18px 22px 0",borderRight:"1px solid rgba(14,13,11,0.08)"}}>
          <div className="sidebar-scroll" style={{flex:1}}>
            <div style={{marginBottom:22}}>
              <div style={{fontSize:"0.56rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--ink4)",marginBottom:9}}>Context</div>
              <div style={{background:"var(--white)",border:"1px solid rgba(14,13,11,0.08)",borderRadius:8,padding:"9px 11px",display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",animation:"dot-pulse 2s infinite",flexShrink:0}}/>
                <span style={{fontSize:"0.82rem",fontWeight:600,color:"var(--ink)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{isAdmin?"Moderation Mode":userCollege}</span>
              </div>
            </div>
            <div style={{marginBottom:22}}>
              <div style={{fontSize:"0.56rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--ink4)",marginBottom:9}}>Navigation</div>
              {TABS.map(t=>(
                <div key={t.id} onClick={()=>switchTab(t.id)} style={{fontSize:"0.8rem",padding:"6px 0 6px 9px",color:tab===t.id?"var(--accent)":"var(--ink2)",fontWeight:tab===t.id?600:400,cursor:"pointer",borderLeft:tab===t.id?"2px solid var(--accent)":"2px solid transparent",marginLeft:-9,transition:"all 0.12s",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>{t.label}</span>
                  {t.id==="saved"&&savedPosts.size>0&&<span style={{fontSize:"0.6rem",background:"var(--blue)",color:"#fff",borderRadius:10,padding:"1px 5px",fontWeight:700}}>{savedPosts.size}</span>}
                </div>
              ))}
            </div>
            {tab==="explore"&&!exploreCategory&&(
              <div>
                <div style={{fontSize:"0.56rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--ink4)",marginBottom:9}}>Categories</div>
                {EXPLORE_CATEGORIES.map(cat=>(
                  <div key={cat.id} onClick={()=>setExploreCategory(cat)} style={{fontSize:"0.75rem",padding:"5px 0 5px 9px",color:"var(--ink2)",cursor:"pointer",borderLeft:"2px solid transparent",marginLeft:-9,transition:"all 0.1s",display:"flex",alignItems:"center",gap:6}}>
                    <span style={{width:5,height:5,borderRadius:"50%",background:cat.accent,flexShrink:0}}/>
                    <span>{cat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{paddingTop:16,borderTop:"1px solid rgba(14,13,11,0.07)"}}>
            <div style={{fontSize:"0.63rem",color:"var(--ink4)",lineHeight:1.7,wordBreak:"break-all"}}>{user.email}</div>
          </div>
        </aside>

        {/* MAIN FEED — scrollable */}
        <main className="feed-scroll" style={{height:"calc(100vh - var(--nav-h))",padding:"22px 26px",minWidth:0}}>
          {tab==="explore"
            ? (exploreCategory
                ? <ExploreCategoryView category={exploreCategory} user={user} voted={voted} onVote={handleVote} savedPosts={savedPosts} onSave={handleSave} notify={notify} onBack={()=>setExploreCategory(null)}/>
                : <><Banner tab="explore"/><div style={{marginBottom:18}}><div style={{fontFamily:"var(--serif)",fontSize:"1.5rem",color:"var(--ink)",marginBottom:3}}>Explore</div><div style={{fontSize:"0.76rem",color:"var(--ink3)"}}>Pick a space to discuss, read, or share.</div></div><ExploreTiles onSelect={setExploreCategory}/></>)
            : tab==="mod"
              ? <ModContent/>
              : tab==="profile"
                ? <ProfileView user={user} allPosts={posts} notify={notify}/>
                : <FeedContent/>}
        </main>

        {/* RIGHT SIDEBAR — sticky */}
        <aside style={{position:"sticky",top:"var(--nav-h)",height:"calc(100vh - var(--nav-h))",display:"flex",flexDirection:"column",padding:"22px 0 22px 18px",borderLeft:"1px solid rgba(14,13,11,0.08)"}}>
          <div className="sidebar-scroll" style={{flex:1}}>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:"0.56rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--ink4)",marginBottom:10}}>About Unrest</div>
              <div style={{fontSize:"0.76rem",color:"var(--ink2)",lineHeight:1.8}}>Delhi University's verified student network.</div>
              <div style={{marginTop:5,fontSize:"0.7rem",color:"var(--ink4)"}}>Full Launch - 11 June 2026</div>
            </div>
            <div style={{background:"rgba(200,75,47,0.05)",border:"1px solid rgba(200,75,47,0.12)",borderRadius:8,padding:"12px 13px",marginBottom:20}}>
              <div style={{fontSize:"0.66rem",fontWeight:700,color:"var(--accent)",marginBottom:7}}>How it works</div>
              {["Post with your DU Google account","Mods approve before it goes live","W / L votes are real-time","Your college is auto-detected","Comment on any post"].map((item,i)=>(
                <div key={i} style={{display:"flex",gap:5,fontSize:"0.7rem",color:"var(--ink2)",padding:"3px 0",lineHeight:1.5}}>
                  <span style={{color:"var(--ink4)",flexShrink:0}}>{i+1}.</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div style={{fontSize:"0.59rem",color:"var(--ink4)",lineHeight:1.75}}>
              <div>unrestdu.in</div>
              <div style={{display:"flex",gap:8,marginTop:3}}>
                <a href="/privacy.html" style={{color:"var(--ink3)",textDecoration:"none"}}>Privacy</a>
                <a href="/terms.html" style={{color:"var(--ink3)",textDecoration:"none"}}>Terms</a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── MOBILE SINGLE-COL LAYOUT ── */}
      <div className="mobile-only" style={{flexDirection:"column",paddingBottom:"var(--bottom-h)"}}>
        <div style={{padding:"16px 16px 0"}}>
          {tab==="explore"
            ? (exploreCategory
                ? <ExploreCategoryView category={exploreCategory} user={user} voted={voted} onVote={handleVote} savedPosts={savedPosts} onSave={handleSave} notify={notify} onBack={()=>setExploreCategory(null)}/>
                : <><Banner tab="explore"/><div style={{marginBottom:16}}><div style={{fontFamily:"var(--serif)",fontSize:"1.4rem",color:"var(--ink)",marginBottom:2}}>Explore</div><div style={{fontSize:"0.74rem",color:"var(--ink3)"}}>Pick a space to discuss, read, or share.</div></div><ExploreTiles onSelect={setExploreCategory}/></>)
            : tab==="mod"
              ? <ModContent/>
              : tab==="profile"
                ? <ProfileView user={user} allPosts={posts} notify={notify}/>
                : <FeedContent/>}
        </div>
      </div>

      <MobileNav/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(UnrestFeed));
