import React, { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import { useNavigate } from "react-router-dom";

const MindmapPage: React.FC = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [mindmapCode, setMindmapCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        darkMode: true,
        background: "#06030f",
        primaryColor: "#3b0764",
        primaryTextColor: "#f0abfc",
        primaryBorderColor: "#a855f7",
        lineColor: "#7c3aed",
        secondaryColor: "#1e1b4b",
        tertiaryColor: "#0f172a",
        edgeLabelBackground: "#1e0f45",
        clusterBkg: "#130a2e",
        titleColor: "#e9d5ff",
        nodeTextColor: "#e9d5ff",
        mainBkg: "#06030f",
        nodeBorder: "#7c3aed",
        clusterBorder: "#5b21b6",
        defaultLinkColor: "#7c3aed",
        fontFamily: "'Syne', sans-serif",
        fontSize: "16px",
      },
      mindmap: {
        padding: 20,
        maxNodeWidth: 200,
      },
    });
  }, []);

  useEffect(() => {
    if (mindmapCode && mermaidRef.current) {
      mermaidRef.current.innerHTML = mindmapCode;
      mermaidRef.current.removeAttribute("data-processed");
      mermaid.run({ nodes: [mermaidRef.current] })
        .then(() => {
          const svg = mermaidRef.current?.querySelector("svg");
          if (!svg) return;
          // Force dark fill on ALL rect/polygon — Mermaid injects white inline styles
          svg.querySelectorAll("rect").forEach((el) => {
            el.style.fill = "#130a2e";
            el.style.stroke = "#7c3aed";
            el.style.strokeWidth = "1.5px";
          });
          svg.querySelectorAll("polygon").forEach((el) => {
            el.style.fill = "#1e0f45";
            el.style.stroke = "#a855f7";
          });
          // Circles — root gets brighter purple
          svg.querySelectorAll("circle").forEach((el, i) => {
            el.style.fill = i === 0 ? "#3b0764" : "#2d1672";
            el.style.stroke = i === 0 ? "#c084fc" : "#7c3aed";
          });
          // All text — dark/black
          svg.querySelectorAll("text, tspan").forEach((el) => {
            (el as SVGElement).style.fill = "#0a0010";
            (el as SVGElement).style.fontFamily = "'Syne', sans-serif";
            (el as SVGElement).style.fontWeight = "800";
          });
        })
        .catch(console.error);
    }
  }, [mindmapCode]);

  const generateMindmap = async () => {
    if (!topic.trim()) { setError("Topic daalo pehle!"); return; }
    setLoading(true); setError(""); setMindmapCode(""); setGenerated(false);
    try {
      const response = await fetch("http://localhost:8000/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to generate mindmap");
      setMindmapCode(data.mindmap);
      setGenerated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") generateMindmap();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --void: #06030f; --deep: #0d0720; --ink: #130a2e; --mid: #1e0f45;
          --rich: #2d1672; --vivid: #7c3aed; --bright: #a855f7;
          --glow: #c084fc; --pale: #e9d5ff; --mist: #f5f3ff; --accent: #f0abfc;
        }
        body { background: var(--void); overflow-x: hidden; }
        @keyframes pdot { 0%,100%{transform:scale(1);}50%{transform:scale(1.5);opacity:0.6;} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeup { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        @keyframes pulse-ring { 0%{transform:scale(0.95);opacity:0.8;}50%{transform:scale(1.05);opacity:0.4;}100%{transform:scale(0.95);opacity:0.8;} }
        @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);} }

        /* ── Mermaid deep overrides ── */
        .mm-root .mermaid svg {
          background: transparent !important;
          width: 100% !important;
          height: 100% !important;
          min-height: 500px;
        }

        /* ALL rectangle / polygon node shapes — force dark fill */
        .mm-root .mermaid svg rect,
        .mm-root .mermaid svg polygon,
        .mm-root .mermaid svg .mindmap-node rect,
        .mm-root .mermaid svg .mindmap-node polygon,
        .mm-root .mermaid svg .node rect,
        .mm-root .mermaid svg .node polygon {
          fill: #130a2e !important;
          stroke: #7c3aed !important;
          stroke-width: 1.5px !important;
          rx: 10px !important;
          filter: drop-shadow(0 0 8px rgba(124,58,237,0.5)) !important;
        }

        /* Circle / ellipse nodes */
        .mm-root .mermaid svg circle,
        .mm-root .mermaid svg ellipse,
        .mm-root .mermaid svg .mindmap-node circle,
        .mm-root .mermaid svg .mindmap-node ellipse {
          fill: #2d1672 !important;
          stroke: #a855f7 !important;
          stroke-width: 2.5px !important;
          filter: drop-shadow(0 0 12px rgba(168,85,247,0.7)) !important;
        }

        /* ALL text inside SVG — force dark/black */
        .mm-root .mermaid svg text,
        .mm-root .mermaid svg tspan,
        .mm-root .mermaid svg .mindmap-node text,
        .mm-root .mermaid svg .label,
        .mm-root .mermaid svg .nodeLabel {
          fill: #0a0010 !important;
          color: #0a0010 !important;
          font-family: 'Syne', sans-serif !important;
          font-weight: 800 !important;
        }

        /* Root node special */
        .mm-root .mermaid svg .mindmap-node:first-child circle,
        .mm-root .mermaid svg .mindmap-node:first-child ellipse {
          fill: #3b0764 !important;
          stroke: #c084fc !important;
          stroke-width: 3px !important;
          filter: drop-shadow(0 0 20px rgba(192,132,252,0.8)) !important;
        }

        /* Edges / lines */
        .mm-root .mermaid svg path,
        .mm-root .mermaid svg .edge,
        .mm-root .mermaid svg line {
          stroke: #7c3aed !important;
          stroke-width: 1.8px !important;
          stroke-opacity: 0.7 !important;
        }

        /* Keep rect fill consistent — override any inline style Mermaid injects */
        .mm-root .mermaid svg [style*="fill: rgb(255"] rect,
        .mm-root .mermaid svg [style*="fill: white"] rect,
        .mm-root .mermaid svg [style*="fill:#fff"] rect {
          fill: #130a2e !important;
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 4px; }
      `}</style>

      <div className="mm-root" style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "var(--void)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "var(--pale)",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* BG Orbs */}
        <div style={{ position:"fixed", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(91,33,182,0.12),transparent 70%)", filter:"blur(100px)", top:-200, right:-200, pointerEvents:"none", zIndex:0 }}/>
        <div style={{ position:"fixed", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,0.08),transparent 70%)", filter:"blur(100px)", bottom:-100, left:-100, pointerEvents:"none", zIndex:0 }}/>
        <div style={{ position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(124,58,237,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.022) 1px,transparent 1px)", backgroundSize:"52px 52px", pointerEvents:"none", zIndex:0 }}/>

        {/* NAV */}
        <nav style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"14px 28px",
          background:"rgba(6,3,15,0.92)",
          borderBottom:"1px solid rgba(124,58,237,0.14)",
          backdropFilter:"blur(20px)",
          zIndex:20, flexShrink:0, position:"relative",
        }}>
          <div onClick={() => navigate("/")} style={{
            fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem",
            background:"linear-gradient(135deg,#c084fc,#f0abfc)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            display:"flex", alignItems:"center", gap:8, cursor:"pointer",
          }}>
            <div style={{ width:7, height:7, background:"#7c3aed", borderRadius:"50%", boxShadow:"0 0 10px #7c3aed", WebkitTextFillColor:"initial", animation:"pdot 2s ease-in-out infinite", flexShrink:0 }}/>
            AI-LLM Notebook
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, color:"var(--pale)" }}>
            <span>🧠</span>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"0.95rem" }}>Mind Map</span>
            <span style={{ fontSize:"0.62rem", fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", padding:"3px 10px", borderRadius:100, background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)", color:"#c084fc" }}>
              Ollama · Mistral
            </span>
          </div>
          <button onClick={() => navigate("/dashboard")} style={{
            padding:"7px 16px", background:"transparent",
            border:"1px solid rgba(168,85,247,0.22)", borderRadius:8,
            color:"rgba(233,213,255,0.55)", fontSize:"0.8rem", cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif",
          }}>← Dashboard</button>
        </nav>

        {/* MAIN */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:2 }}>

          {/* ── INPUT SECTION ── */}
          <div style={{
            padding:"36px 40px 28px",
            borderBottom:"1px solid rgba(91,33,182,0.12)",
            background:"rgba(13,7,32,0.5)",
            backdropFilter:"blur(10px)",
          }}>
            <div style={{ maxWidth:900, margin:"0 auto" }}>
              <div style={{ fontSize:"0.68rem", fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(192,132,252,0.45)", marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
                <span>✦</span> Enter Topic
                <span style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(124,58,237,0.2),transparent)" }}/>
              </div>

              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                {/* Input */}
                <div style={{ flex:1, position:"relative" }}>
                  <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", fontSize:"1.1rem", pointerEvents:"none" }}>🧠</div>
                  <input
                    type="text"
                    placeholder="e.g. Machine Learning, Quantum Physics, History of Rome…"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                      width:"100%", padding:"14px 18px 14px 46px",
                      background:"rgba(13,7,32,0.8)",
                      border:"1px solid rgba(124,58,237,0.28)",
                      borderRadius:14, color:"var(--pale)",
                      fontSize:"0.95rem", fontFamily:"'DM Sans',sans-serif",
                      outline:"none",
                      boxShadow:"inset 0 0 20px rgba(91,33,182,0.08)",
                      transition:"all 0.25s",
                    }}
                    onFocus={e => { e.target.style.borderColor="rgba(168,85,247,0.55)"; e.target.style.boxShadow="0 0 0 3px rgba(124,58,237,0.12), inset 0 0 20px rgba(91,33,182,0.1)"; }}
                    onBlur={e => { e.target.style.borderColor="rgba(124,58,237,0.28)"; e.target.style.boxShadow="inset 0 0 20px rgba(91,33,182,0.08)"; }}
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateMindmap}
                  disabled={loading || !topic.trim()}
                  style={{
                    padding:"14px 28px",
                    background: loading ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                    border:"none", borderRadius:14,
                    color:"white",
                    fontFamily:"'Syne',sans-serif", fontSize:"0.92rem", fontWeight:700,
                    cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
                    opacity: !topic.trim() && !loading ? 0.5 : 1,
                    boxShadow: loading ? "none" : "0 0 28px rgba(124,58,237,0.4)",
                    display:"flex", alignItems:"center", gap:10,
                    transition:"all 0.25s", whiteSpace:"nowrap",
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"white", animation:"spin 0.8s linear infinite" }}/>
                      Generating…
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                      Generate Map
                    </>
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div style={{ marginTop:12, padding:"10px 14px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, color:"#fca5a5", fontSize:"0.82rem", display:"flex", gap:8 }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Quick topics */}
              {!generated && !loading && (
                <div style={{ marginTop:14, display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ fontSize:"0.68rem", color:"rgba(192,132,252,0.35)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Try:</span>
                  {["Machine Learning","Photosynthesis","World War II","Blockchain","Climate Change","Solar System"].map(t => (
                    <button key={t} onClick={() => setTopic(t)} style={{
                      padding:"4px 12px", background:"rgba(45,22,114,0.25)",
                      border:"1px solid rgba(124,58,237,0.2)", borderRadius:100,
                      color:"rgba(192,132,252,0.65)", fontSize:"0.72rem", cursor:"pointer",
                      fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.background="rgba(45,22,114,0.5)"; (e.target as HTMLElement).style.color="#c084fc"; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.background="rgba(45,22,114,0.25)"; (e.target as HTMLElement).style.color="rgba(192,132,252,0.65)"; }}
                    >{t}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── MINDMAP DISPLAY ── */}
          <div style={{ flex:1, padding:"32px 40px", overflow:"auto" }}>
            <div style={{ maxWidth:1200, margin:"0 auto", minHeight:500 }}>

              {/* Empty state */}
              {!generated && !loading && (
                <div style={{
                  display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", minHeight:480, gap:20,
                  animation:"fadeup 0.5s ease",
                }}>
                  <div style={{ position:"relative", width:120, height:120 }}>
                    <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid rgba(124,58,237,0.2)", animation:"pulse-ring 3s ease-in-out infinite" }}/>
                    <div style={{ position:"absolute", inset:8, borderRadius:"50%", border:"2px solid rgba(124,58,237,0.15)", animation:"pulse-ring 3s ease-in-out 0.5s infinite" }}/>
                    <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:"linear-gradient(135deg,rgba(45,22,114,0.6),rgba(124,58,237,0.2))", border:"1px solid rgba(124,58,237,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"3rem", animation:"float 4s ease-in-out infinite" }}>
                      🧠
                    </div>
                  </div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.4rem", fontWeight:800, color:"rgba(233,213,255,0.2)", letterSpacing:"-0.03em" }}>
                    Mind Map Ready to Generate
                  </div>
                  <div style={{ fontSize:"0.85rem", color:"rgba(233,213,255,0.12)", maxWidth:320, textAlign:"center", lineHeight:1.7 }}>
                    Koi bhi topic daalo — Ollama/Mistral se ek visual mind map ban jaayega
                  </div>
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div style={{
                  display:"flex", flexDirection:"column", alignItems:"center",
                  justifyContent:"center", minHeight:480, gap:24,
                }}>
                  {/* Animated nodes preview */}
                  <div style={{ position:"relative", width:200, height:200 }}>
                    {[0,1,2,3,4,5].map(i => (
                      <div key={i} style={{
                        position:"absolute",
                        width: i===0 ? 60 : 36,
                        height: i===0 ? 60 : 36,
                        borderRadius:"50%",
                        background:`radial-gradient(circle, ${["#3b0764","#1e1b4b","#0f172a","#0a0f1e","#0f0a00","#1a0010"][i]}, transparent)`,
                        border:`2px solid ${["#a855f7","#6366f1","#06b6d4","#10b981","#f59e0b","#f43f5e"][i]}`,
                        boxShadow:`0 0 16px ${["rgba(168,85,247,0.6)","rgba(99,102,241,0.5)","rgba(6,182,212,0.5)","rgba(16,185,129,0.5)","rgba(245,158,11,0.5)","rgba(244,63,94,0.5)"][i]}`,
                        top:`${[70, 10, 10, 70, 130, 130][i]}px`,
                        left:`${[70, 140, 10, 150, 140, 10][i]}px`,
                        animation:`pulse-ring ${1.5 + i*0.2}s ease-in-out ${i*0.15}s infinite`,
                      }}/>
                    ))}
                  </div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1rem", fontWeight:700, color:"rgba(233,213,255,0.6)" }}>
                    Building your mind map…
                  </div>
                  <div style={{ fontSize:"0.78rem", color:"rgba(233,213,255,0.25)" }}>
                    Ollama → Mistral → Mermaid → Render
                  </div>
                </div>
              )}

              {/* Mermaid output */}
              {generated && !loading && (
                <div style={{ animation:"fadeup 0.5s ease" }}>
                  {/* Header row */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                    <div>
                      <div style={{ fontSize:"0.68rem", fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(192,132,252,0.45)", marginBottom:4 }}>✦ Generated Mind Map</div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.2rem", fontWeight:800, color:"var(--mist)", letterSpacing:"-0.02em" }}>
                        {topic}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button
                        onClick={() => { setGenerated(false); setMindmapCode(""); setTopic(""); }}
                        style={{ padding:"8px 16px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:10, color:"rgba(252,165,165,0.7)", fontSize:"0.78rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                      >✕ Clear</button>
                      <button
                        onClick={generateMindmap}
                        style={{ padding:"8px 16px", background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:10, color:"#c084fc", fontSize:"0.78rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                      >↺ Regenerate</button>
                    </div>
                  </div>

                  {/* Mermaid container */}
                  <div style={{
                    background:"linear-gradient(135deg,rgba(13,7,32,0.9),rgba(6,3,15,0.95))",
                    border:"1px solid rgba(124,58,237,0.22)",
                    borderRadius:24,
                    padding:"32px",
                    minHeight:520,
                    position:"relative",
                    overflow:"auto",
                    boxShadow:"0 0 60px rgba(91,33,182,0.12), inset 0 0 80px rgba(91,33,182,0.04)",
                  }}>
                    {/* Corner accents */}
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(168,85,247,0.4),rgba(240,171,252,0.2),transparent)", borderRadius:"24px 24px 0 0" }}/>
                    <div style={{ position:"absolute", top:16, left:16, width:8, height:8, borderRadius:2, background:"rgba(168,85,247,0.4)" }}/>
                    <div style={{ position:"absolute", top:16, right:16, width:8, height:8, borderRadius:2, background:"rgba(168,85,247,0.4)" }}/>

                    <div
                      ref={mermaidRef}
                      className="mermaid"
                      style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:450 }}
                    />
                  </div>

                  {/* Raw code toggle */}
                  <details style={{ marginTop:16 }}>
                    <summary style={{ cursor:"pointer", fontSize:"0.72rem", color:"rgba(192,132,252,0.4)", userSelect:"none", letterSpacing:"0.08em" }}>
                      ▸ Raw Mermaid Code
                    </summary>
                    <pre style={{
                      marginTop:8, padding:"16px 20px",
                      background:"rgba(13,7,32,0.8)", border:"1px solid rgba(91,33,182,0.15)",
                      borderRadius:12, fontSize:"0.75rem", color:"rgba(192,132,252,0.6)",
                      overflowX:"auto", lineHeight:1.7, fontFamily:"monospace",
                    }}>
                      {mindmapCode}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MindmapPage;

// import React, { useState, useEffect } from "react";
// import mermaid from "mermaid";

// const Mindmap: React.FC = () => {
//   const [file, setFile] = useState<File | null>(null);
//   const [keywords, setKeywords] = useState<string[]>([]);
//   const [selectedKeyword, setSelectedKeyword] = useState("");
//   const [mindmap, setMindmap] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     mermaid.initialize({ startOnLoad: true });
//   }, []);

//   // Upload file and get keywords
//   const uploadFile = async () => {
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await fetch("http://localhost:8000/upload-file", {
//         method: "POST",
//         body: formData
//       });

//       const data = await res.json();
//       setKeywords(data.keywords);
//     } catch (error) {
//       console.error("Upload error", error);
//     }
//   };

//   // Generate mindmap
//   const generateMindmap = async () => {
//     if (!selectedKeyword) return;

//     setLoading(true);

//     try {
//       const res = await fetch("http://localhost:8000/mindmap/upload-file", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ topic: selectedKeyword })
//       });

//       const data = await res.json();
//       setMindmap(data.mindmap);
//     } catch (error) {
//       console.error(error);
//     }

//     setLoading(false);
//   };

//   useEffect(() => {
//     if (mindmap) {
//       mermaid.contentLoaded();
//     }
//   }, [mindmap]);

//   return (
//     <div style={{ padding: "30px" }}>
//       <h2>AI Mindmap Generator</h2>

//       {/* File Upload */}
//       <div style={{ marginBottom: "20px" }}>
//         <input
//           type="file"
//           onChange={(e) => setFile(e.target.files?.[0] || null)}
//         />

//         <button onClick={uploadFile}>
//           Upload File
//         </button>
//       </div>

//       {/* Keywords */}
//       {keywords.length > 0 && (
//         <div style={{ marginBottom: "20px" }}>
//           <h4>Select Topic</h4>

//           {keywords.map((word, index) => (
//             <button
//               key={index}
//               onClick={() => setSelectedKeyword(word)}
//               style={{
//                 margin: "5px",
//                 padding: "8px 12px"
//               }}
//             >
//               {word}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Generate Mindmap */}
//       {selectedKeyword && (
//         <button onClick={generateMindmap}>
//           {loading ? "Generating..." : "Generate Mindmap"}
//         </button>
//       )}

//       {/* Mermaid Mindmap */}
//       <div style={{ marginTop: "30px" }}>
//         <div className="mermaid">{mindmap}</div>
//       </div>
//     </div>
//   );
// };

// export default Mindmap;