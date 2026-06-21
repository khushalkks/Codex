import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Archive, FileText, File as FileIcon, Image as ImageIcon, Sparkles, Clock, Paperclip, AlertCircle, Lightbulb } from "lucide-react";

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
    const allowed = ["application/pdf", "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(f.type)) { setError("Unsupported file type. Use PDF, TXT, DOCX, or image."); return; }
    setError(""); setFile(f);
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://127.0.0.1:8000/api/summarize", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const rawSummary = data.summary || data.text || data.result || JSON.stringify(data);

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
      if (!t) return <div key={i} style={{ height: 10 }} />;
      if (/^#{1,3}\s/.test(t)) return <h3 key={i} style={{ fontFamily: "'Inter',sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#111827", margin: "20px 0 8px" }}>{t.replace(/^#+\s*/, "").replace(/\*+/g, "")}</h3>;
      if (/^\*\*(.+)\*\*:?$/.test(t)) return <p key={i} style={{ fontWeight: 600, color: "#1F2937", margin: "12px 0 4px", fontSize: "1rem" }}>{t.replace(/\*+/g, "")}</p>;
      if (/^[-•*]\s/.test(t)) {
        const c = t.replace(/^[-•*]\s+/, "").replace(/\*\*(.+?)\*\*/g, "$1");
        return <div key={i} style={{ display: "flex", gap: 10, margin: "6px 0", alignItems: "flex-start" }}><span style={{ color: "#4F46E5", marginTop: 7, flexShrink: 0, fontSize: 8 }}>◆</span><p style={{ fontSize: "1rem", color: "#4B5563", lineHeight: 1.65, margin: 0 }}>{c}</p></div>;
      }
      return <p key={i} style={{ fontSize: "1rem", color: "#4B5563", lineHeight: 1.7, margin: "6px 0" }}>{t.replace(/\*\*(.+?)\*\*/g, "$1")}</p>;
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        html, body, #root {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        :root {
            --pale: #1F2937;
            --mist: #111827; 
            --void: #FAFBFD;
            --deep: #FFFFFF;
            --ink: #E5E7EB;
            --vivid: #4F46E5;
            --bright: #6366F1;
            --glow: #38BDF8;
            --accent: #EC4899;
        }

        .sp-root{font-family:'Inter',sans-serif;background:var(--void);height:100vh;width:100%;display:flex;flex-direction:column;overflow:hidden;color:var(--pale);}
        .sp-nav{display:flex;align-items:center;justify-content:space-between;padding:20px 48px;background:rgba(255,255,255,0.7);border-bottom:1px solid var(--ink);flex-shrink:0;backdrop-filter:blur(20px);z-index:20;width:100%;}
        .sp-logo{font-family:'Inter',sans-serif;font-weight:800;font-size:1.2rem;color:var(--vivid);display:flex;align-items:center;gap:10px;cursor:pointer;}
        .sp-logo-dot{width:8px;height:8px;background:var(--vivid);border-radius:50%;box-shadow:0 0 12px var(--vivid);animation:pdot 2s ease-in-out infinite;}
        @keyframes pdot{0%,100%{transform:scale(1);}50%{transform:scale(1.5);opacity:0.6;}}
        .sp-nav-center{font-weight:700;color:var(--mist);display:flex;align-items:center;gap:10px;font-size:1rem;}
        .sp-nav-badge{font-size:0.7rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;padding:4px 12px;border-radius:100px;background:#EEF2FF;border:1px solid #C7D2FE;color:var(--vivid);}
        .sp-back{padding:8px 20px;background:#fff;border:1px solid #E5E7EB;border-radius:100px;color:#4B5563;font-family:'Inter',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer;transition:all .2s;box-shadow:0 4px 6px rgba(0,0,0,0.02);}
        .sp-back:hover{background:#F9FAFB;box-shadow:0 6px 12px rgba(0,0,0,0.04);transform:translateY(-1px);color:#111827;}

        .sp-body{display:flex;flex:1;overflow:hidden;width:100%;}

        .sp-sidebar{width:300px;flex-shrink:0;background:#FFFFFF;border-right:1px solid #E5E7EB;display:flex;flex-direction:column;overflow:hidden;box-shadow:2px 0 10px rgba(0,0,0,0.02);z-index:2;}
        .sp-sidebar-head{padding:24px 20px 16px;border-bottom:1px solid #E5E7EB;flex-shrink:0;}
        .sp-sidebar-title{font-size:0.75rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#6B7280;display:flex;align-items:center;justify-content:space-between;}
        .sp-sidebar-count{font-size:0.7rem;padding:2px 10px;border-radius:100px;background:#EEF2FF;border:1px solid #C7D2FE;color:var(--vivid);}
        .sp-sidebar-list{flex:1;overflow-y:auto;padding:12px;}
        .sp-sidebar-list::-webkit-scrollbar{width:4px;} .sp-sidebar-list::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:4px;}
        .sp-history-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px;text-align:center;}
        .sp-history-empty-icon{font-size:2.5rem;opacity:0.5;} .sp-history-empty p{font-size:0.85rem;color:#6B7280;line-height:1.6;}
        .sp-hist-item{padding:14px;border-radius:16px;cursor:pointer;border:1px solid transparent;transition:all .2s;margin-bottom:8px;position:relative;overflow:hidden;}
        .sp-hist-item::before{content:'';position:absolute;left:0;top:15%;bottom:15%;width:3px;border-radius:2px;background:var(--vivid);opacity:0;transition:opacity .22s;}
        .sp-hist-item:hover{background:#F9FAFB;border-color:#E5E7EB;}
        .sp-hist-item:hover::before,.sp-hist-item.active::before{opacity:1;}
        .sp-hist-item.active{background:#EEF2FF;border-color:#C7D2FE;box-shadow:0 4px 12px rgba(79,70,229,0.05);}
        .sp-hist-icon-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
        .sp-hist-ext{font-size:0.65rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6B7280;}
        .sp-hist-new{display:inline-block;font-size:0.6rem;font-weight:700;padding:2px 8px;border-radius:100px;background:#D1FAE5;border:1px solid #A7F3D0;color:#059669;margin-left:auto;}
        .sp-hist-name{font-size:0.9rem;font-weight:700;color:#111827;margin-bottom:4px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .sp-hist-fname{font-size:0.75rem;color:#6B7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:4px;}
        .sp-hist-date{font-size:0.7rem;color:#9CA3AF;margin-bottom:8px;}
        .sp-hist-preview{font-size:0.8rem;color:#4B5563;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}

        .sp-main{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative;min-width:0;}
        .sp-main-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
        .sp-gridlines{position:absolute;inset:0;background-image:linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px);background-size:40px 40px;}
        .sp-orb{position:absolute;border-radius:50%;filter:blur(100px);}
        .sp-orb-1{width:600px;height:600px;background:radial-gradient(circle,rgba(99,102,241,0.12),transparent 60%);top:-100px;right:-100px;}
        .sp-orb-2{width:400px;height:400px;background:radial-gradient(circle,rgba(236,72,153,0.08),transparent 60%);bottom:0px;right:20%;}
        .sp-orb-3{width:500px;height:500px;background:radial-gradient(circle,rgba(56,189,248,0.08),transparent 60%);top:40%;left:-100px;}

        .sp-main-inner{flex:1;overflow-y:auto;padding:40px 60px;position:relative;z-index:2;}
        .sp-main-inner::-webkit-scrollbar{width:6px;} .sp-main-inner::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:6px;}

        .sp-two-col{display:grid;grid-template-columns:minmax(350px, 1fr) minmax(400px, 1.2fr);gap:40px;align-items:start;width:100%;max-width:1400px;margin:0 auto;}
        @media(max-width:1024px){.sp-two-col{grid-template-columns:1fr;}}

        .sp-section-label{font-size:0.75rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#6B7280;margin-bottom:16px;display:flex;align-items:center;gap:12px;}
        .sp-section-label::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,#E5E7EB,transparent);}
        
        .sp-dropzone{border:2px dashed #D1D5DB;border-radius:24px;background:#FFFFFF;padding:40px 24px;text-align:center;cursor:pointer;transition:all .3s;box-shadow:0 4px 20px rgba(0,0,0,0.02);}
        .sp-dropzone:hover,.sp-dropzone.drag{border-color:var(--vivid);background:#EEF2FF;box-shadow:0 12px 30px rgba(79,70,229,0.08);}
        .sp-dz-icon{width:56px;height:56px;background:#F3F4F6;border:1px solid #E5E7EB;border-radius:18px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;transition:all .3s;}
        .sp-dropzone:hover .sp-dz-icon,.sp-dropzone.drag .sp-dz-icon{background:var(--vivid);border-color:var(--vivid);box-shadow:0 8px 20px rgba(79,70,229,0.3);}
        .sp-dz-icon svg{width:26px;height:26px;color:#9CA3AF;transition:color .3s;}
        .sp-dropzone:hover .sp-dz-icon svg,.sp-dropzone.drag .sp-dz-icon svg{color:white;}
        .sp-dz-title{font-size:1.05rem;font-weight:700;color:#111827;margin-bottom:6px;}
        .sp-dz-sub{font-size:0.85rem;color:#6B7280;margin-bottom:18px;}
        .sp-dz-types{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}
        .sp-dz-type{font-size:0.65rem;font-weight:700;letter-spacing:0.05em;padding:4px 10px;border-radius:100px;background:#F3F4F6;border:1px solid #E5E7EB;color:#4B5563;}

        .sp-file-picked{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;margin-top:16px;box-shadow:0 4px 15px rgba(0,0,0,0.03);}
        .sp-file-info{display:flex;align-items:center;gap:14px;min-width:0;}
        .sp-file-emoji{width:42px;height:42px;background:#EEF2FF;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
        .sp-file-name{font-size:0.9rem;font-weight:700;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .sp-file-size{font-size:0.75rem;color:#6B7280;margin-top:2px;}
        .sp-file-remove{background:#FEF2F2;border:1px solid #FCA5A5;border-radius:10px;padding:6px 14px;color:#DC2626;font-size:0.8rem;font-weight:600;cursor:pointer;transition:all .2s;flex-shrink:0;}
        .sp-file-remove:hover{background:#FEE2E2;}

        .sp-error{padding:14px 18px;background:#FEF2F2;border:1px solid #FCA5A5;border-radius:14px;color:#DC2626;font-size:0.85rem;margin-top:16px;display:flex;align-items:flex-start;gap:10px;line-height:1.5;}
        
        .sp-gen-btn{width:100%;padding:16px;margin-top:20px;background:linear-gradient(135deg, #4F46E5, #6366F1);color:white;border:none;border-radius:16px;font-family:'Inter',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;transition:all .3s;box-shadow:0 10px 24px rgba(79,70,229,0.25);display:flex;align-items:center;justify-content:center;gap:10px;}
        .sp-gen-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 14px 32px rgba(79,70,229,0.35);}
        .sp-gen-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;box-shadow:none;}
        @keyframes spin{to{transform:rotate(360deg);}}

        .sp-summary-card{background:#FFFFFF;border:1px solid #E5E7EB;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.05);}
        .sp-summary-head{padding:24px 30px 20px;border-bottom:1px solid #E5E7EB;background:#F9FAFB;}
        .sp-sum-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px;}
        .sp-sum-title{font-size:1.25rem;font-weight:800;color:#111827;letter-spacing:-0.02em;line-height:1.3;}
        .sp-sum-meta{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
        .sp-sum-file{font-size:0.8rem;color:#6B7280;font-weight:500;}
        .sp-sum-date{font-size:0.8rem;color:#9CA3AF;}
        .sp-copy-btn{padding:6px 14px;background:#FFFFFF;border:1px solid #D1D5DB;border-radius:100px;color:#4B5563;font-size:0.8rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0;box-shadow:0 2px 4px rgba(0,0,0,0.02);}
        .sp-copy-btn:hover{background:#F3F4F6;border-color:#9CA3AF;color:#111827;}
        
        .sp-summary-body{padding:30px;max-height:500px;overflow-y:auto;}
        .sp-summary-body::-webkit-scrollbar{width:6px;} .sp-summary-body::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:6px;}
        
        .sp-loading{display:flex;flex-direction:column;align-items:center;gap:20px;padding:80px 20px;text-align:center;}
        .sp-loading-ring{width:56px;height:56px;border-radius:50%;border:3px solid #EEF2FF;border-top-color:var(--vivid);animation:spin 0.8s linear infinite;}
        .sp-loading-text{font-size:1.1rem;font-weight:700;color:#111827;}
        .sp-loading-sub{font-size:0.9rem;color:#6B7280;margin-top:-8px;}
        
        .sp-empty{display:flex;flex-direction:column;align-items:center;gap:16px;padding:80px 20px;text-align:center;}
        .sp-empty-icon{font-size:3rem;opacity:0.3;}
        .sp-empty-title{font-size:1.1rem;font-weight:700;color:#4B5563;}
        .sp-empty-sub{font-size:0.9rem;color:#9CA3AF;max-width:280px;line-height:1.6;}
        
        .sp-hint{margin-top:20px;padding:14px 18px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:14px;font-size:0.8rem;color:#6B7280;line-height:1.6;}
        .sp-hint code{color:var(--vivid);background:#EEF2FF;padding:2px 6px;border-radius:6px;font-family:monospace;font-weight:600;}
      `}</style>

      <div className="sp-root">
        {/* Nav */}
        <nav className="sp-nav">
          <div className="sp-logo" onClick={() => navigate("/")}>
            <div className="sp-logo-dot" />
            CortexCraft
          </div>
          <div className="sp-nav-center">
            <FileText size={18} color="#4F46E5" /> Smart Summary
            {/* <span className="sp-nav-badge">FastAPI</span> */}
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
                  <div className="sp-history-empty-icon"><Archive size={40} color="#9CA3AF" strokeWidth={1} /></div>
                  <p>Generated summaries yahan save hoti rahegi is session mein.</p>
                </div>
              ) : history.map((item, idx) => (
                <div
                  key={item.id}
                  className={`sp-hist-item ${selectedIdx === idx ? "active" : ""}`}
                  onClick={() => setSelectedIdx(idx)}
                >
                  <div className="sp-hist-icon-row">
                    <span>{item.fileName.endsWith(".pdf") ? <FileIcon size={14} color="#6366F1" /> : item.fileName.match(/\.(png|jpg|jpeg|webp)$/i) ? <ImageIcon size={14} color="#6366F1" /> : <FileText size={14} color="#6366F1" />}</span>
                    <span className="sp-hist-ext">{item.fileName.split(".").pop().toUpperCase()}</span>
                    {idx === 0 && <span className="sp-hist-new">New</span>}
                  </div>
                  <div className="sp-hist-name">{truncate(item.title, 36)}</div>
                  <div className="sp-hist-fname">{truncate(item.fileName, 26)}</div>
                  <div className="sp-hist-date">{fmt(item.date)}</div>
                  <div className="sp-hist-preview">
                    {truncate(item.summary.replace(/[#*\-•◆]/g, " ").replace(/\s+/g, " ").trim(), 88)}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main className="sp-main">
            <div className="sp-main-bg">
              <div className="sp-gridlines" style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(79,70,229,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(79,70,229,0.03) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

              {/* Mesh Orbs */}
              <motion.div animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)', filter: 'blur(100px)', top: '-10%', right: '-10%', borderRadius: '50%' }} />
              <motion.div animate={{ x: [0, -30, 0], y: [0, -40, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', width: 500, height: 500, background: 'radial-gradient(circle, rgba(56,189,248,0.07), transparent 70%)', filter: 'blur(100px)', bottom: '10%', left: '-5%', borderRadius: '50%' }} />
            </div>

            <div className="sp-main-inner" style={{ background: 'radial-gradient(at 0% 0%, #f0f4ff 0%, transparent 40%), radial-gradient(at 100% 100%, #eff6ff 0%, transparent 40%)' }}>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="sp-dz-title">{dragging ? "Drop kar do! 🎯" : "Drag & Drop karo"}</div>
                    <div className="sp-dz-sub">ya click karke file chunno</div>
                    <div className="sp-dz-types">
                      {["PDF", "DOCX", "TXT", "PNG", "JPG"].map(t => <span key={t} className="sp-dz-type">{t}</span>)}
                    </div>
                  </div>

                  <input
                    ref={fileInputRef} type="file" style={{ display: "none" }}
                    accept=".pdf,.txt,.docx,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => { if (e.target.files[0]) pickFile(e.target.files[0]); e.target.value = ""; }}
                  />

                  {file && (
                    <div className="sp-file-picked">
                      <div className="sp-file-info">
                        <div className="sp-file-emoji">
                          {file.type.startsWith("image/") ? <ImageIcon size={20} color="#4F46E5" /> : file.type === "application/pdf" ? <FileIcon size={20} color="#4F46E5" /> : <FileText size={20} color="#4F46E5" />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="sp-file-name">{truncate(file.name, 28)}</div>
                          <div className="sp-file-size">{(file.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <button className="sp-file-remove" onClick={(e) => { e.stopPropagation(); setFile(null); }}>✕ Remove</button>
                    </div>
                  )}

                  {error && <div className="sp-error"><span><AlertCircle size={16} /></span><span>{error}</span></div>}

                  <button className="sp-gen-btn" disabled={!file || loading} onClick={handleGenerate}>
                    {loading ? (
                      <>
                        <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        Generating…
                      </>
                    ) : (
                      <>
                        <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Summary
                      </>
                    )}
                  </button>

                  <div className="sp-hint" style={{ display: 'flex', gap: 8 }}>
                    <Lightbulb size={16} color="#6366F1" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <code>FormData</code> se <code>file</code> field bhejta hai <code>/summarize</code> pe.
                      Backend <code>{"{ summary: \"...\" }"}</code> return kare.
                    </div>
                  </div>
                </div>

                {/* Result col */}
                <div>
                  <div className="sp-section-label">✦ {displayed ? "Summary Result" : "Output"}</div>

                  {loading ? (
                    <div className="sp-summary-card">
                      <div className="sp-loading">
                        <div className="sp-loading-ring" />
                        <div className="sp-loading-text">Document analyse ho raha hai…</div>
                        <div className="sp-loading-sub">FastAPI backend process kar raha hai</div>
                      </div>
                    </div>
                  ) : displayed ? (
                    <div className="sp-summary-card">
                      <div className="sp-summary-head">
                        <div className="sp-sum-top">
                          <div className="sp-sum-title">{displayed.title}</div>
                          <button className="sp-copy-btn" onClick={() => navigator.clipboard.writeText(displayed.summary)}>📋 Copy</button>
                        </div>
                        <div className="sp-sum-meta">
                          <span className="sp-sum-file" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Paperclip size={12} /> {truncate(displayed.fileName, 26)}</span>
                          <span className="sp-sum-date" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {fmt(displayed.date)}</span>
                        </div>
                      </div>
                      <div className="sp-summary-body">{renderSummary(displayed.summary)}</div>
                    </div>
                  ) : (
                    <div className="sp-summary-card">
                      <div className="sp-empty">
                        <div className="sp-empty-icon"><Sparkles size={48} color="#9CA3AF" strokeWidth={1} /></div>
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