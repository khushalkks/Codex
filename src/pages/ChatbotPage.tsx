import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CHAT_API = "http://127.0.0.1:8000/chat";
const SUMMARIZE_API = "http://127.0.0.1:8000/summarize";

const fmt = (d) =>
  new Date(d).toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
const trunc = (s, n=50) => s.length > n ? s.slice(0,n)+"…" : s;

export default function ChatbotPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role:"assistant", text:"Namaste! 👋 Koi bhi document upload karo ya left sidebar se summary select karo — main usi context se jawab dunga.", ts:Date.now() }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sources, setSources] = useState([]);                  // all uploaded summaries
  const [activeSourceIds, setActiveSourceIds] = useState(new Set()); // selected for context

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, sending]);

  /* ── Upload → /summarize → store as source ── */
  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);                                 // backend expects "file" field
      const res = await fetch(SUMMARIZE_API, { method:"POST", body:fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const raw = data.summary || data.text || "";
      const lines = raw.trim().split("\n").filter(l => l.trim());
      let title = file.name.replace(/\.[^.]+$/, "");
      const first = lines[0]?.replace(/^#+\s*/,"").replace(/\*+/g,"").trim();
      if (first && first.length < 80 && !first.endsWith(".")) title = first;

      const entry = { id: Date.now().toString(), title, fileName:file.name, summary:raw, date:Date.now() };
      setSources(p => [entry, ...p]);
      setActiveSourceIds(p => new Set([...p, entry.id]));     // auto-activate
      setMessages(p => [...p, {
        role:"assistant",
        text:`✅ "${entry.title}" upload ho gaya! Ab iske baare mein kuch bhi pucho.`,
        ts:Date.now()
      }]);
    } catch (err) {
      setMessages(p => [...p, { role:"assistant", text:`❌ Upload failed: ${err.message}`, ts:Date.now() }]);
    } finally { setUploading(false); }
  };

  const toggleSource = (id) => {
    setActiveSourceIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ── Build context from selected sources ── */
  const buildContext = () => {
    const selected = sources.filter(s => activeSourceIds.has(s.id));
    if (!selected.length) return "No document context. Answer generally.";
    return selected.map(s => `=== ${s.title} ===\n${s.summary}`).join("\n\n");
  };

  /* ── Send to /chat with context ── */
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setMessages(p => [...p, { role:"user", text, ts:Date.now() }]);
    setInput("");
    setSending(true);
    if (textareaRef.current) textareaRef.current.style.height = "44px";
    try {
      const res = await fetch(CHAT_API, {
        method:"POST",
        headers:{ "Content-Type":"application/json", accept:"application/json" },
        // backend expects: { message: string, context: string }
        body:JSON.stringify({ message:text, context:buildContext() }),
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      // accepts reply / answer / response / text
      const reply = data.reply || data.answer || data.response || data.text || JSON.stringify(data);
      setMessages(p => [...p, { role:"assistant", text:reply, ts:Date.now() }]);
    } catch (err) {
      setMessages(p => [...p, {
        role:"assistant",
        text:`❌ Error: ${err.message}. Backend check karo: http://127.0.0.1:8000/chat`,
        ts:Date.now()
      }]);
    } finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "44px";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  const activeCount = activeSourceIds.size;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeup{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-6px);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes pdot{0%,100%{transform:scale(1);}50%{transform:scale(1.5);opacity:0.6;}}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#06030f;overflow:hidden;}
        textarea{resize:none;font-family:'DM Sans',sans-serif;}
        textarea:focus{outline:none;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.25);border-radius:3px;}

        .cb-root{font-family:'DM Sans',sans-serif;background:#06030f;height:100vh;display:flex;flex-direction:column;overflow:hidden;color:#e9d5ff;position:relative;}
        .cb-orb1{position:fixed;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(91,33,182,0.1),transparent 70%);filter:blur(80px);top:-150px;right:-150px;pointer-events:none;z-index:0;}
        .cb-orb2{position:fixed;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(168,85,247,0.07),transparent 70%);filter:blur(80px);bottom:0;left:20%;pointer-events:none;z-index:0;}
        .cb-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(124,58,237,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.02) 1px,transparent 1px);background-size:48px 48px;pointer-events:none;z-index:0;}
        /* Nav */
        .cb-nav{display:flex;align-items:center;justify-content:space-between;padding:13px 28px;background:rgba(6,3,15,0.92);border-bottom:1px solid rgba(124,58,237,0.14);backdrop-filter:blur(20px);z-index:20;flex-shrink:0;position:relative;}
        .cb-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;background:linear-gradient(135deg,#c084fc,#f0abfc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:flex;align-items:center;gap:8px;cursor:pointer;}
        .cb-logo-dot{width:7px;height:7px;background:#7c3aed;border-radius:50%;box-shadow:0 0 10px #7c3aed;-webkit-text-fill-color:initial;animation:pdot 2s ease-in-out infinite;flex-shrink:0;}
        .cb-nav-badge{font-size:0.62rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;padding:3px 10px;border-radius:100px;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.3);color:#c084fc;}
        .cb-back{padding:7px 16px;background:transparent;border:1px solid rgba(168,85,247,0.22);border-radius:8px;color:rgba(233,213,255,0.55);font-size:0.8rem;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;}
        .cb-back:hover{background:rgba(45,22,114,0.35);border-color:rgba(168,85,247,0.45);color:#e9d5ff;}
        /* Body */
        .cb-body{display:flex;flex:1;overflow:hidden;position:relative;z-index:2;}
        /* Sidebar */
        .cb-sidebar{width:270px;flex-shrink:0;background:rgba(10,5,26,0.97);border-right:1px solid rgba(91,33,182,0.16);display:flex;flex-direction:column;overflow:hidden;}
        .cb-sidebar-top{padding:14px 14px 10px;border-bottom:1px solid rgba(91,33,182,0.12);flex-shrink:0;}
        .cb-upload-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:10px;background:linear-gradient(135deg,rgba(124,58,237,0.22),rgba(168,85,247,0.08));border:1px dashed rgba(124,58,237,0.32);border-radius:12px;color:#c084fc;font-size:0.82rem;font-weight:500;cursor:pointer;transition:all .25s;font-family:'DM Sans',sans-serif;}
        .cb-upload-btn:hover{background:linear-gradient(135deg,rgba(124,58,237,0.35),rgba(168,85,247,0.15));border-style:solid;}
        .cb-mini-spin{width:14px;height:14px;border-radius:50%;border:2px solid rgba(192,132,252,0.2);border-top-color:#c084fc;animation:spin 0.8s linear infinite;}
        .cb-sidebar-lbl{padding:12px 14px 8px;font-size:0.68rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(192,132,252,0.4);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
        .cb-active-count{font-size:0.62rem;padding:2px 8px;border-radius:100px;background:rgba(124,58,237,0.22);border:1px solid rgba(124,58,237,0.3);color:#c084fc;}
        .cb-sources-list{flex:1;overflow-y:auto;padding:0 10px 10px;}
        .cb-sources-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 16px;gap:10px;}
        .cb-source-card{padding:11px;border-radius:12px;cursor:pointer;border:1px solid transparent;transition:all .22s;margin-bottom:6px;position:relative;overflow:hidden;background:rgba(13,7,32,0.4);}
        .cb-source-card:hover{background:rgba(45,22,114,0.2);border-color:rgba(91,33,182,0.18);}
        .cb-source-card.active{background:rgba(45,22,114,0.32);border-color:rgba(124,58,237,0.32);box-shadow:0 0 16px rgba(91,33,182,0.1);}
        .cb-source-bar{position:absolute;left:0;top:15%;bottom:15%;width:2.5px;border-radius:2px;background:linear-gradient(180deg,#7c3aed,#a855f7);}
        .cb-check{width:16px;height:16px;border-radius:4px;border:1.5px solid rgba(124,58,237,0.25);background:transparent;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s;margin-left:auto;}
        .cb-check.on{background:#7c3aed;border-color:#7c3aed;}
        .cb-ctx-hint{margin:0 10px 12px;padding:10px 12px;background:rgba(45,22,114,0.14);border:1px solid rgba(91,33,182,0.13);border-radius:10px;display:flex;gap:8px;align-items:flex-start;flex-shrink:0;}
        /* Chat */
        .cb-chat-main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
        .cb-messages{flex:1;overflow-y:auto;padding:24px 28px;}
        .cb-msg{display:flex;flex-direction:column;margin-bottom:16px;animation:fadeup .3s ease;}
        .cb-msg.user{align-items:flex-end;} .cb-msg.assistant{align-items:flex-start;}
        .cb-bubble-row{display:flex;align-items:flex-end;gap:8px;}
        .cb-msg.user .cb-bubble-row{flex-direction:row-reverse;}
        .cb-avatar{width:30px;height:30px;border-radius:50%;flex-shrink:0;border:1px solid rgba(124,58,237,0.35);display:flex;align-items:center;justify-content:center;font-size:12px;}
        .cb-bubble{max-width:72%;padding:12px 16px;}
        .cb-bubble.user{border-radius:18px 4px 18px 18px;background:linear-gradient(135deg,#7c3aed,#a855f7);box-shadow:0 4px 20px rgba(124,58,237,0.3);}
        .cb-bubble.assistant{border-radius:4px 18px 18px 18px;background:rgba(13,7,32,0.85);border:1px solid rgba(91,33,182,0.22);box-shadow:0 2px 12px rgba(0,0,0,0.3);backdrop-filter:blur(10px);}
        .cb-bubble p{font-size:0.875rem;line-height:1.65;margin:0;white-space:pre-wrap;word-break:break-word;}
        .cb-bubble.user p{color:rgba(255,255,255,0.95);} .cb-bubble.assistant p{color:rgba(233,213,255,0.82);}
        .cb-ts{font-size:0.62rem;color:rgba(233,213,255,0.2);margin-top:4px;}
        /* Typing dots */
        .cb-typing{display:flex;align-items:flex-end;gap:8px;margin-bottom:16px;}
        .cb-typing-bubble{padding:14px 18px;background:rgba(13,7,32,0.85);border:1px solid rgba(91,33,182,0.22);border-radius:4px 18px 18px 18px;backdrop-filter:blur(10px);display:flex;gap:5px;align-items:center;}
        .cb-dot{width:7px;height:7px;border-radius:50%;background:#7c3aed;}
        .cb-dot:nth-child(1){animation:bounce 1.2s ease-in-out 0s infinite;}
        .cb-dot:nth-child(2){animation:bounce 1.2s ease-in-out 0.2s infinite;}
        .cb-dot:nth-child(3){animation:bounce 1.2s ease-in-out 0.4s infinite;}
        /* Input */
        .cb-input-bar{padding:12px 20px 14px;background:rgba(6,3,15,0.9);border-top:1px solid rgba(91,33,182,0.14);backdrop-filter:blur(20px);flex-shrink:0;}
        .cb-chips{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;}
        .cb-chip{display:flex;align-items:center;gap:5px;padding:4px 10px;background:rgba(45,22,114,0.35);border:1px solid rgba(124,58,237,0.28);border-radius:100px;}
        .cb-input-row{display:flex;gap:10px;align-items:flex-end;background:rgba(13,7,32,0.7);border:1px solid rgba(91,33,22,0.22);border-radius:16px;padding:8px 8px 8px 14px;backdrop-filter:blur(10px);}
        .cb-attach{width:36px;height:36px;border-radius:10px;flex-shrink:0;background:rgba(45,22,114,0.3);border:1px solid rgba(124,58,237,0.22);display:flex;align-items:center;justify-content:center;color:rgba(192,132,252,0.6);cursor:pointer;transition:all 0.2s;margin-bottom:2px;}
        .cb-attach:hover{background:rgba(45,22,114,0.5);border-color:rgba(124,58,237,0.45);color:#c084fc;}
        .cb-textarea{flex:1;background:transparent;border:none;color:#e9d5ff;font-size:0.9rem;line-height:1.6;height:44px;max-height:140px;overflow-y:auto;}
        .cb-send{width:40px;height:40px;border-radius:12px;flex-shrink:0;background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(124,58,237,0.35);transition:all 0.2s;margin-bottom:2px;}
        .cb-send:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 32px rgba(168,85,247,0.45);}
        .cb-send:disabled{opacity:0.4;cursor:not-allowed;}
        .cb-hint{font-size:0.65rem;color:rgba(233,213,255,0.2);text-align:center;margin-top:6px;}
      `}</style>

      <div className="cb-root">
        <div className="cb-orb1"/><div className="cb-orb2"/><div className="cb-grid"/>

        {/* Nav */}
        <nav className="cb-nav">
          <div className="cb-logo" onClick={() => navigate("/")}><div className="cb-logo-dot"/>AI-LLM Notebook</div>
          <div style={{display:"flex",alignItems:"center",gap:10,color:"#e9d5ff"}}>
            <span>🤖</span>
            <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.95rem"}}>AI Chatbot</span>
            <span className="cb-nav-badge">Context-Aware</span>
          </div>
          <button className="cb-back" onClick={() => navigate("/dashboard")}>← Dashboard</button>
        </nav>

        <div className="cb-body">

          {/* ── SIDEBAR ── */}
          <aside className="cb-sidebar">
            <div className="cb-sidebar-top">
              <label className="cb-upload-btn" style={uploading?{opacity:0.6,cursor:"not-allowed"}:{}}>
                {uploading ? <><div className="cb-mini-spin"/>Uploading…</> : <><span>📎</span>Upload Document</>}
                <input type="file" style={{display:"none"}} accept=".pdf,.txt,.docx,.png,.jpg,.jpeg,.webp"
                  disabled={uploading}
                  onChange={e=>{if(e.target.files[0])handleUpload(e.target.files[0]);e.target.value="";}}
                />
              </label>
            </div>

            <div className="cb-sidebar-lbl">
              <span>✦ Context Sources</span>
              {activeCount>0 && <span className="cb-active-count">{activeCount} active</span>}
            </div>

            <div className="cb-sources-list">
              {sources.length === 0 ? (
                <div className="cb-sources-empty">
                  <div style={{fontSize:"2rem",opacity:0.2}}>📂</div>
                  <p style={{fontSize:"0.75rem",color:"rgba(233,213,255,0.22)",lineHeight:1.6,textAlign:"center"}}>
                    Document upload karo — summary automatically context mein add ho jaayegi.
                  </p>
                </div>
              ) : sources.map(src => {
                const isActive = activeSourceIds.has(src.id);
                return (
                  <div key={src.id} className={`cb-source-card ${isActive?"active":""}`} onClick={()=>toggleSource(src.id)}>
                    {isActive && <div className="cb-source-bar"/>}
                    <div style={{position:"relative",zIndex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                        <span>{src.fileName.endsWith(".pdf")?"📕":src.fileName.match(/\.(png|jpg|jpeg|webp)$/i)?"🖼️":"📄"}</span>
                        <span style={{fontSize:"0.6rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:isActive?"#c084fc":"rgba(192,132,252,0.38)"}}>
                          {src.fileName.split(".").pop().toUpperCase()}
                        </span>
                        <div className={`cb-check ${isActive?"on":""}`}>
                          {isActive && <span style={{color:"white",fontSize:10,lineHeight:1}}>✓</span>}
                        </div>
                      </div>
                      <div style={{fontFamily:"'Syne',sans-serif",fontSize:"0.78rem",fontWeight:700,color:isActive?"#f5f3ff":"#e9d5ff",marginBottom:2,lineHeight:1.25,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {trunc(src.title,30)}
                      </div>
                      <div style={{fontSize:"0.64rem",color:"rgba(233,213,255,0.24)",marginBottom:4}}>{fmt(src.date)}</div>
                      <div style={{fontSize:"0.7rem",color:"rgba(233,213,255,0.3)",lineHeight:1.45,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                        {src.summary.replace(/[#*\-•◆]/g," ").replace(/\s+/g," ").trim().slice(0,85)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {activeCount > 0 && (
              <div className="cb-ctx-hint">
                <span style={{color:"#c084fc",fontSize:"0.7rem"}}>🧠</span>
                <span style={{fontSize:"0.7rem",color:"rgba(233,213,255,0.32)",lineHeight:1.5}}>
                  {activeCount} source{activeCount>1?"s":""} context mein hai{activeCount>1?"n":""}. Chatbot isi ke basis pe jawab dega.
                </span>
              </div>
            )}
          </aside>

          {/* ── CHAT ── */}
          <main className="cb-chat-main">
            <div className="cb-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`cb-msg ${msg.role}`}>
                  <div className="cb-bubble-row">
                    <div className="cb-avatar" style={{
                      background:msg.role==="user"?"linear-gradient(135deg,#7c3aed,#a855f7)":"linear-gradient(135deg,#1e0f45,#2d1672)"
                    }}>{msg.role==="user"?"👤":"🤖"}</div>
                    <div className={`cb-bubble ${msg.role}`}>
                      <p>{msg.text.replace(/\*\*(.+?)\*\*/g,"$1")}</p>
                    </div>
                  </div>
                  {msg.ts && (
                    <span className="cb-ts" style={{marginLeft:msg.role==="user"?0:38,marginRight:msg.role==="user"?38:0}}>
                      {fmt(msg.ts)}
                    </span>
                  )}
                </div>
              ))}

              {sending && (
                <div className="cb-typing">
                  <div className="cb-avatar" style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#1e0f45,#2d1672)",border:"1px solid rgba(124,58,237,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🤖</div>
                  <div className="cb-typing-bubble">
                    <div className="cb-dot"/><div className="cb-dot"/><div className="cb-dot"/>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}/>
            </div>

            {/* Input bar */}
            <div className="cb-input-bar">
              {activeCount > 0 && (
                <div className="cb-chips">
                  <span style={{fontSize:"0.65rem",color:"rgba(192,132,252,0.38)",letterSpacing:"0.08em",textTransform:"uppercase"}}>Context:</span>
                  {sources.filter(s=>activeSourceIds.has(s.id)).map(s => (
                    <div key={s.id} className="cb-chip">
                      <span style={{fontSize:"0.75rem"}}>{s.fileName.endsWith(".pdf")?"📕":"📄"}</span>
                      <span style={{fontSize:"0.7rem",color:"rgba(233,213,255,0.7)"}}>{trunc(s.title,18)}</span>
                      <button style={{background:"none",border:"none",color:"rgba(233,213,255,0.38)",cursor:"pointer",fontSize:10,lineHeight:1,padding:"0 2px"}}
                        onClick={()=>toggleSource(s.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="cb-input-row">
                <label className="cb-attach" title="Document attach karo">
                  <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                  </svg>
                  <input type="file" style={{display:"none"}} accept=".pdf,.txt,.docx,.png,.jpg,.jpeg,.webp"
                    onChange={e=>{if(e.target.files[0])handleUpload(e.target.files[0]);e.target.value="";}}
                  />
                </label>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={activeCount>0 ? `${activeCount} document ke baare mein pucho…` : "Kuch bhi pucho — ya pehle document upload karo…"}
                  rows={1}
                  className="cb-textarea"
                />

                <button className="cb-send" disabled={!input.trim()||sending} onClick={sendMessage}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V6M5 12l7-7 7 7"/>
                  </svg>
                </button>
              </div>

              <div className="cb-hint">
                Enter = send &nbsp;·&nbsp; Shift+Enter = new line &nbsp;·&nbsp;
                {activeCount>0 ? `${activeCount} source${activeCount>1?"s":""} active` : "No context — general mode"}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}