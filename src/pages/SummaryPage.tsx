import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const fmt = (d) =>
  new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const truncate = (str, n = 60) => (str.length > n ? str.slice(0, n) + "…" : str);

export default function SummaryPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [error, setError] = useState("");

  const onDragOver = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }, []);

  const pickFile = (f) => {
    const allowed = ["application/pdf","text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png","image/jpeg","image/webp"];
    if (!allowed.includes(f.type)) { setError("Unsupported file type. Use PDF, TXT, DOCX, or image."); return; }
    setError(""); setFile(f);
  };

  // ✅ FIXED: FormData use karta hai, data.summary leta hai — bilkul UploadModal ki tarah
  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file); // backend "file" field expect karta hai

      const res = await fetch("http://127.0.0.1:8000/summarize", {
        method: "POST",
        body: formData,
        // ⚠️ Content-Type header BILKUL MAT LAGAO — browser khud lagata hai multipart boundary ke saath
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server ${res.status}: ${errText}`);
      }

      const data = await res.json();

      // backend { summary: "..." } return karta hai
      const rawSummary = data.summary || data.text || data.result || JSON.stringify(data);

      // First line se title extract karo
      const lines = rawSummary.trim().split("\n").filter(l => l.trim());
      let title = file.name.replace(/\.[^.]+$/, "");
      let summaryText = rawSummary;
      const firstLine = lines[0]?.replace(/^#+\s*/, "").replace(/\*+/g, "").trim();
      if (firstLine && firstLine.length < 80 && !firstLine.endsWith(".")) {
        title = firstLine;
        summaryText = lines.slice(1).join("\n").trim();
      }

      const entry = { id: Date.now(), title, summary: summaryText, fileName: file.name, date: Date.now() };
      setHistory(prev => [entry, ...prev]);
      setSelectedIdx(0);
      setFile(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Summary generate nahi ho saki. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  const displayed = selectedIdx !== null ? history[selectedIdx] : null;

  const renderSummary = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      const t = line.trim();
      if (!t) return <div key={i} style={{height:10}}/>;
      if (/^#{1,3}\s/.test(t)) return <h3 key={i} style={{fontFamily:"'Syne',sans-serif",fontSize:"0.95rem",fontWeight:700,color:"#c084fc",margin:"18px 0 6px"}}>{t.replace(/^#+\s*/,"").replace(/\*+/g,"")}</h3>;
      if (/^\*\*(.+)\*\*:?$/.test(t)) return <p key={i} style={{fontWeight:600,color:"#e9d5ff",margin:"10px 0 3px",fontSize:"0.88rem"}}>{t.replace(/\*+/g,"")}</p>;
      if (/^[-•*]\s/.test(t)) {
        const c = t.replace(/^[-•*]\s+/,"").replace(/\*\*(.+?)\*\*/g,"$1");
        return <div key={i} style={{display:"flex",gap:10,margin:"4px 0",alignItems:"flex-start"}}><span style={{color:"#7c3aed",marginTop:7,flexShrink:0,fontSize:7}}>◆</span><p style={{fontSize:"0.875rem",color:"rgba(233,213,255,0.72)",lineHeight:1.65,margin:0}}>{c}</p></div>;
      }
      return <p key={i} style={{fontSize:"0.875rem",color:"rgba(233,213,255,0.58)",lineHeight:1.7,margin:"3px 0"}}>{t.replace(/\*\*(.+?)\*\*/g,"$1")}</p>;
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--void:#06030f;--deep:#0d0720;--ink:#130a2e;--mid:#1e0f45;--rich:#2d1672;--vivid:#7c3aed;--bright:#a855f7;--glow:#c084fc;--pale:#e9d5ff;--mist:#f5f3ff;--accent:#f0abfc;}
        body{background:var(--void);overflow:hidden;}
        .sp-root{font-family:'DM Sans',sans-serif;background:var(--void);height:100vh;display:flex;flex-direction:column;overflow:hidden;color:var(--pale);}
        .sp-nav{display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:rgba(6,3,15,0.92);border-bottom:1px solid rgba(124,58,237,0.15);flex-shrink:0;backdrop-filter:blur(20px);z-index:20;}
        .sp-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;background:linear-gradient(135deg,var(--glow),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:flex;align-items:center;gap:8px;cursor:pointer;}
        .sp-logo-dot{width:7px;height:7px;background:var(--vivid);border-radius:50%;box-shadow:0 0 10px var(--vivid);-webkit-text-fill-color:initial;animation:pdot 2s ease-in-out infinite;}
        @keyframes pdot{0%,100%{transform:scale(1);}50%{transform:scale(1.5);opacity:0.6;}}
        .sp-nav-center{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;color:var(--pale);display:flex;align-items:center;gap:10px;}
        .sp-nav-badge{font-family:'DM Sans',sans-serif;font-size:0.65rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;padding:3px 10px;border-radius:100px;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.3);color:var(--glow);}
        .sp-back{padding:7px 16px;background:transparent;border:1px solid rgba(168,85,247,0.25);border-radius:8px;color:rgba(233,213,255,0.6);font-family:'DM Sans',sans-serif;font-size:0.8rem;cursor:pointer;transition:all .2s;}
        .sp-back:hover{background:rgba(45,22,114,0.4);border-color:rgba(168,85,247,0.5);color:var(--pale);}
        .sp-body{display:flex;flex:1;overflow:hidden;}
        .sp-sidebar{width:272px;flex-shrink:0;background:rgba(10,5,26,0.98);border-right:1px solid rgba(91,33,182,0.18);display:flex;flex-direction:column;overflow:hidden;}
        .sp-sidebar-head{padding:16px 18px 12px;border-bottom:1px solid rgba(91,33,182,0.13);flex-shrink:0;}
        .sp-sidebar-title{font-family:'Syne',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(192,132,252,0.5);display:flex;align-items:center;justify-content:space-between;}
        .sp-sidebar-count{font-size:0.65rem;padding:2px 8px;border-radius:100px;background:rgba(124,58,237,0.18);border:1px solid rgba(124,58,237,0.22);color:var(--glow);}
        .sp-sidebar-list{flex:1;overflow-y:auto;padding:8px;}
        .sp-sidebar-list::-webkit-scrollbar{width:3px;} .sp-sidebar-list::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.25);border-radius:3px;}
        .sp-history-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:44px 16px;gap:10px;text-align:center;}
        .sp-history-empty-icon{font-size:2rem;opacity:0.25;} .sp-history-empty p{font-size:0.76rem;color:rgba(233,213,255,0.2);line-height:1.6;}
        .sp-hist-item{padding:11px;border-radius:11px;cursor:pointer;border:1px solid transparent;transition:all .22s;margin-bottom:5px;position:relative;overflow:hidden;}
        .sp-hist-item::before{content:'';position:absolute;left:0;top:15%;bottom:15%;width:2.5px;border-radius:2px;background:linear-gradient(180deg,var(--vivid),var(--bright));opacity:0;transition:opacity .22s;}
        .sp-hist-item:hover{background:rgba(45,22,114,0.22);border-color:rgba(91,33,182,0.18);}
        .sp-hist-item:hover::before,.sp-hist-item.active::before{opacity:1;}
        .sp-hist-item.active{background:rgba(45,22,114,0.38);border-color:rgba(124,58,237,0.32);box-shadow:0 0 18px rgba(91,33,182,0.12);}
        .sp-hist-icon-row{display:flex;align-items:center;gap:6px;margin-bottom:5px;}
        .sp-hist-ext{font-size:0.6rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:rgba(192,132,252,0.45);}
        .sp-hist-new{display:inline-block;font-size:0.58rem;font-weight:700;padding:1px 6px;border-radius:100px;background:rgba(124,58,237,0.3);border:1px solid rgba(168,85,247,0.4);color:var(--glow);margin-left:4px;}
        .sp-hist-name{font-family:'Syne',sans-serif;font-size:0.8rem;font-weight:700;color:var(--pale);margin-bottom:3px;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .sp-hist-fname{font-size:0.67rem;color:rgba(233,213,255,0.28);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:3px;}
        .sp-hist-date{font-size:0.65rem;color:rgba(233,213,255,0.25);margin-bottom:5px;}
        .sp-hist-preview{font-size:0.7rem;color:rgba(233,213,255,0.3);line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .sp-main{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative;}
        .sp-main-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
        .sp-gridlines{position:absolute;inset:0;background-image:linear-gradient(rgba(124,58,237,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.022) 1px,transparent 1px);background-size:48px 48px;}
        .sp-orb{position:absolute;border-radius:50%;filter:blur(90px);}
        .sp-orb-1{width:480px;height:480px;background:radial-gradient(circle,rgba(91,33,182,0.1),transparent 70%);top:-80px;right:-80px;}
        .sp-orb-2{width:280px;height:280px;background:radial-gradient(circle,rgba(168,85,247,0.07),transparent 70%);bottom:40px;left:15%;}
        .sp-main-inner{flex:1;overflow-y:auto;padding:32px 36px;position:relative;z-index:2;}
        .sp-main-inner::-webkit-scrollbar{width:4px;} .sp-main-inner::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.2);border-radius:4px;}
        .sp-two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;}
        @media(max-width:900px){.sp-two-col{grid-template-columns:1fr;}}
        .sp-section-label{font-size:0.68rem;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:rgba(192,132,252,0.45);margin-bottom:12px;display:flex;align-items:center;gap:8px;}
        .sp-section-label::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(124,58,237,0.18),transparent);}
        .sp-dropzone{border:1.5px dashed rgba(124,58,237,0.28);border-radius:18px;background:rgba(13,7,32,0.55);padding:32px 24px;text-align:center;cursor:pointer;transition:all .3s;backdrop-filter:blur(10px);}
        .sp-dropzone:hover,.sp-dropzone.drag{border-color:rgba(168,85,247,0.55);background:rgba(45,22,114,0.18);box-shadow:0 0 36px rgba(91,33,182,0.12);}
        .sp-dropzone.drag{border-style:solid;border-color:var(--bright);}
        .sp-dz-icon{width:48px;height:48px;background:linear-gradient(135deg,rgba(91,33,182,0.35),rgba(168,85,247,0.12));border:1px solid rgba(124,58,237,0.28);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;transition:all .3s;}
        .sp-dropzone:hover .sp-dz-icon,.sp-dropzone.drag .sp-dz-icon{background:linear-gradient(135deg,var(--vivid),var(--bright));border-color:transparent;box-shadow:0 0 18px rgba(124,58,237,0.4);}
        .sp-dz-icon svg{width:20px;height:20px;color:var(--glow);transition:color .3s;}
        .sp-dropzone:hover .sp-dz-icon svg,.sp-dropzone.drag .sp-dz-icon svg{color:white;}
        .sp-dz-title{font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;color:var(--pale);margin-bottom:4px;}
        .sp-dz-sub{font-size:0.75rem;color:rgba(233,213,255,0.3);margin-bottom:14px;}
        .sp-dz-types{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;}
        .sp-dz-type{font-size:0.6rem;font-weight:600;letter-spacing:0.08em;padding:2px 9px;border-radius:100px;background:rgba(45,22,114,0.5);border:1px solid rgba(124,58,237,0.18);color:rgba(192,132,252,0.55);}
        .sp-file-picked{display:flex;align-items:center;justify-content:space-between;padding:12px 15px;background:rgba(45,22,114,0.28);border:1px solid rgba(124,58,237,0.28);border-radius:12px;margin-top:10px;backdrop-filter:blur(10px);}
        .sp-file-info{display:flex;align-items:center;gap:10px;min-width:0;}
        .sp-file-emoji{width:34px;height:34px;background:linear-gradient(135deg,var(--vivid),var(--bright));border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
        .sp-file-name{font-family:'Syne',sans-serif;font-size:0.8rem;font-weight:700;color:var(--pale);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .sp-file-size{font-size:0.68rem;color:rgba(233,213,255,0.3);margin-top:1px;}
        .sp-file-remove{background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.18);border-radius:7px;padding:5px 10px;color:rgba(252,165,165,0.65);font-size:0.72rem;cursor:pointer;transition:all .2s;flex-shrink:0;}
        .sp-file-remove:hover{background:rgba(239,68,68,0.22);color:#fca5a5;}
        .sp-error{padding:11px 14px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:11px;color:#fca5a5;font-size:0.8rem;margin-top:10px;display:flex;align-items:flex-start;gap:8px;line-height:1.5;}
        .sp-gen-btn{width:100%;padding:13px;margin-top:14px;background:linear-gradient(135deg,var(--vivid),var(--bright));color:white;border:none;border-radius:12px;font-family:'Syne',sans-serif;font-size:0.92rem;font-weight:700;cursor:pointer;transition:all .3s;box-shadow:0 0 28px rgba(124,58,237,0.35);display:flex;align-items:center;justify-content:center;gap:9px;}
        .sp-gen-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 44px rgba(168,85,247,0.45);}
        .sp-gen-btn:disabled{opacity:0.45;cursor:not-allowed;transform:none;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .sp-summary-card{background:rgba(13,7,32,0.78);border:1px solid rgba(91,33,182,0.2);border-radius:18px;overflow:hidden;backdrop-filter:blur(20px);}
        .sp-summary-head{padding:18px 22px 14px;border-bottom:1px solid rgba(91,33,182,0.13);background:linear-gradient(135deg,rgba(45,22,114,0.25),transparent);}
        .sp-sum-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px;}
        .sp-sum-title{font-family:'Syne',sans-serif;font-size:1.05rem;font-weight:800;color:var(--mist);letter-spacing:-0.02em;line-height:1.2;}
        .sp-sum-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
        .sp-sum-file{font-size:0.68rem;color:rgba(233,213,255,0.3);}
        .sp-sum-date{font-size:0.68rem;color:rgba(233,213,255,0.22);}
        .sp-copy-btn{padding:5px 12px;background:rgba(124,58,237,0.14);border:1px solid rgba(124,58,237,0.22);border-radius:7px;color:var(--glow);font-size:0.72rem;cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0;}
        .sp-copy-btn:hover{background:rgba(124,58,237,0.28);border-color:rgba(124,58,237,0.45);}
        .sp-summary-body{padding:20px 22px;max-height:400px;overflow-y:auto;}
        .sp-summary-body::-webkit-scrollbar{width:3px;} .sp-summary-body::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.25);border-radius:3px;}
        .sp-loading{display:flex;flex-direction:column;align-items:center;gap:16px;padding:52px 16px;text-align:center;}
        .sp-loading-ring{width:48px;height:48px;border-radius:50%;border:2px solid rgba(124,58,237,0.12);border-top-color:var(--vivid);border-right-color:var(--bright);animation:spin 0.9s linear infinite;}
        .sp-loading-text{font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;color:var(--pale);}
        .sp-loading-sub{font-size:0.75rem;color:rgba(233,213,255,0.28);margin-top:-8px;}
        .sp-empty{display:flex;flex-direction:column;align-items:center;gap:12px;padding:52px 16px;text-align:center;}
        .sp-empty-icon{font-size:2.5rem;opacity:0.18;}
        .sp-empty-title{font-family:'Syne',sans-serif;font-size:0.9rem;font-weight:700;color:rgba(233,213,255,0.22);}
        .sp-empty-sub{font-size:0.75rem;color:rgba(233,213,255,0.14);max-width:220px;line-height:1.6;}
        .sp-hint{margin-top:14px;padding:11px 13px;background:rgba(45,22,114,0.14);border:1px solid rgba(91,33,182,0.14);border-radius:10px;font-size:0.7rem;color:rgba(233,213,255,0.28);line-height:1.6;}
        .sp-hint code{color:rgba(192,132,252,0.5);font-family:monospace;}
      `}</style>

      <div className="sp-root">
        {/* Nav */}
        <nav className="sp-nav">
          <div className="sp-logo" onClick={() => navigate("/")}>
            <div className="sp-logo-dot" />
            AI-LLM Notebook
          </div>
          <div className="sp-nav-center">
            <span>📄</span> Smart Summary
            <span className="sp-nav-badge">FastAPI</span>
          </div>
          <button className="sp-back" onClick={() => navigate("/dashboard")}>← Dashboard</button>
        </nav>

        <div className="sp-body">
          {/* Sidebar */}
          <aside className="sp-sidebar">
            <div className="sp-sidebar-head">
              <div className="sp-sidebar-title">
                History <span className="sp-sidebar-count">{history.length}</span>
              </div>
            </div>
            <div className="sp-sidebar-list">
              {history.length === 0 ? (
                <div className="sp-history-empty">
                  <div className="sp-history-empty-icon">🗂️</div>
                  <p>Generated summaries yahan save hoti rahegi is session mein.</p>
                </div>
              ) : history.map((item, idx) => (
                <div
                  key={item.id}
                  className={`sp-hist-item ${selectedIdx === idx ? "active" : ""}`}
                  onClick={() => setSelectedIdx(idx)}
                >
                  <div className="sp-hist-icon-row">
                    <span>{item.fileName.endsWith(".pdf") ? "📕" : item.fileName.match(/\.(png|jpg|jpeg|webp)$/i) ? "🖼️" : "📄"}</span>
                    <span className="sp-hist-ext">{item.fileName.split(".").pop().toUpperCase()}</span>
                    {idx === 0 && <span className="sp-hist-new">New</span>}
                  </div>
                  <div className="sp-hist-name">{truncate(item.title, 36)}</div>
                  <div className="sp-hist-fname">{truncate(item.fileName, 26)}</div>
                  <div className="sp-hist-date">{fmt(item.date)}</div>
                  <div className="sp-hist-preview">
                    {truncate(item.summary.replace(/[#*\-•◆]/g," ").replace(/\s+/g," ").trim(), 88)}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main className="sp-main">
            <div className="sp-main-bg">
              <div className="sp-gridlines" />
              <div className="sp-orb sp-orb-1" />
              <div className="sp-orb sp-orb-2" />
            </div>

            <div className="sp-main-inner">
              <div className="sp-two-col">

                {/* Upload col */}
                <div>
                  <div className="sp-section-label">✦ Upload Document</div>

                  <div
                    ref={dropRef}
                    className={`sp-dropzone ${dragging ? "drag" : ""}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => !file && fileInputRef.current?.click()}
                  >
                    <div className="sp-dz-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                    </div>
                    <div className="sp-dz-title">{dragging ? "Drop kar do! 🎯" : "Drag & Drop karo"}</div>
                    <div className="sp-dz-sub">ya click karke file chunno</div>
                    <div className="sp-dz-types">
                      {["PDF","DOCX","TXT","PNG","JPG"].map(t => <span key={t} className="sp-dz-type">{t}</span>)}
                    </div>
                  </div>

                  <input
                    ref={fileInputRef} type="file" style={{display:"none"}}
                    accept=".pdf,.txt,.docx,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => { if (e.target.files[0]) pickFile(e.target.files[0]); e.target.value=""; }}
                  />

                  {file && (
                    <div className="sp-file-picked">
                      <div className="sp-file-info">
                        <div className="sp-file-emoji">
                          {file.type.startsWith("image/") ? "🖼️" : file.type==="application/pdf" ? "📕" : "📄"}
                        </div>
                        <div style={{minWidth:0}}>
                          <div className="sp-file-name">{truncate(file.name, 28)}</div>
                          <div className="sp-file-size">{(file.size/1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <button className="sp-file-remove" onClick={(e)=>{e.stopPropagation();setFile(null);}}>✕ Remove</button>
                    </div>
                  )}

                  {error && <div className="sp-error"><span>⚠️</span><span>{error}</span></div>}

                  <button className="sp-gen-btn" disabled={!file || loading} onClick={handleGenerate}>
                    {loading ? (
                      <>
                        <div style={{width:16,height:16,border:"2px solid rgba(255,255,255,0.2)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                        Generating…
                      </>
                    ) : (
                      <>
                        <svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        Generate Summary
                      </>
                    )}
                  </button>

                  <div className="sp-hint">
                    💡 <code>FormData</code> se <code>file</code> field bhejta hai <code>/summarize</code> pe.
                    Backend <code>{"{ summary: \"...\" }"}</code> return kare.
                  </div>
                </div>

                {/* Result col */}
                <div>
                  <div className="sp-section-label">✦ {displayed ? "Summary Result" : "Output"}</div>

                  {loading ? (
                    <div className="sp-summary-card">
                      <div className="sp-loading">
                        <div className="sp-loading-ring"/>
                        <div className="sp-loading-text">Document analyse ho raha hai…</div>
                        <div className="sp-loading-sub">FastAPI backend process kar raha hai</div>
                      </div>
                    </div>
                  ) : displayed ? (
                    <div className="sp-summary-card">
                      <div className="sp-summary-head">
                        <div className="sp-sum-top">
                          <div className="sp-sum-title">{displayed.title}</div>
                          <button className="sp-copy-btn" onClick={()=>navigator.clipboard.writeText(displayed.summary)}>📋 Copy</button>
                        </div>
                        <div className="sp-sum-meta">
                          <span className="sp-sum-file">📎 {truncate(displayed.fileName,26)}</span>
                          <span className="sp-sum-date">🕐 {fmt(displayed.date)}</span>
                        </div>
                      </div>
                      <div className="sp-summary-body">{renderSummary(displayed.summary)}</div>
                    </div>
                  ) : (
                    <div className="sp-summary-card">
                      <div className="sp-empty">
                        <div className="sp-empty-icon">✨</div>
                        <div className="sp-empty-title">Abhi koi summary nahi</div>
                        <div className="sp-empty-sub">File upload karo aur Generate dabao — result yahan aayega.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}