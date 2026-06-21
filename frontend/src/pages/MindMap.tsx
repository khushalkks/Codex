import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UploadCloud,
  Search,
  Workflow,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3;
type ToastType = "success" | "error" | "info";

interface Toast {
  msg: string;
  type: ToastType;
}

const API = "http://localhost:8000/api";
const ACCEPTED = [".pdf", ".docx", ".txt"];

function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepTracker({ step }: { step: Step }) {
  const steps = ["Upload", "Topics", "Mindmap"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 44 }}>
      {steps.map((label, i) => {
        const num = (i + 1) as Step;
        const isDone = num < step;
        const isActive = num === step;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `2px solid ${isDone ? "#4f46e5" : isActive ? "#6366f1" : "#e2e8f0"}`,
                  background: isDone ? "#4f46e5" : isActive ? "#6366f1" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: isDone || isActive ? "#fff" : "#94a3b8",
                  transition: "all 0.35s",
                  fontWeight: 700,
                  boxShadow: isActive ? "0 0 15px rgba(99, 102, 241, 0.3)" : "none"
                }}
              >
                {isDone ? "✓" : num}
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isDone || isActive ? "#1e293b" : "#94a3b8",
                  transition: "color 0.35s",
                }}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                style={{
                  width: 60,
                  height: 2,
                  background: isDone ? "#4f46e5" : "#e2e8f0",
                  margin: "0 12px",
                  transition: "background 0.4s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 24,
        padding: 40,
        marginBottom: 20,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        animation: "fadeUp 0.5s ease forwards",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 16, padding: 40 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "4px solid #f1f5f9",
          borderTopColor: "#4f46e5",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span style={{ fontWeight: 600, fontSize: 14, color: "#64748b" }}>
        AI is thinking…
      </span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MindMapGenerator() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [customTopic, setCustomTopic] = useState("");
  const [mermaidCode, setMermaidCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [mermaidSvg, setMermaidSvg] = useState("");
  const mermaidRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (mermaidCode) renderMermaid(mermaidCode);
  }, [mermaidCode]);

  async function renderMermaid(code: string) {
    try {
      const m = await import("https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs" as string) as any;
      m.default.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "loose" });
      const id = "mm-" + Date.now();
      const { svg } = await m.default.render(id, code);
      setMermaidSvg(svg);
    } catch {
      setMermaidSvg(`<p style="color:#ef4444;font-family:sans-serif;font-size:14px">Could not render diagram.</p>`);
    }
  }

  function showToast(msg: string, type: ToastType = "info") {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  function validateFile(f: File): boolean {
    const ext = "." + f.name.split(".").pop()!.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      showToast(`Unsupported type: ${ext}. Use PDF, DOCX, or TXT.`, "error");
      return false;
    }
    return true;
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && validateFile(f)) setFile(f);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) setFile(f);
  }

  async function extractKeywords() {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/mindmap/upload`, { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      if (!data.keywords?.length) throw new Error("No keywords found in document");
      setKeywords(data.keywords);
      setStep(2);
      showToast(`${data.keywords.length} topics extracted!`, "success");
    } catch (e: any) {
      showToast("Extract failed: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function generateMindmap() {
    const topic = selected || customTopic.trim();
    if (!topic) return;
    setStep(3);
    setLoading(true);
    setMermaidSvg("");
    try {
      const res = await fetch(`${API}/mindmap/topic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      if (!data.mermaid) throw new Error("No mindmap returned from server");
      setMermaidCode(data.mermaid);
    } catch (e: any) {
      showToast("Mindmap failed: " + e.message, "error");
      setMermaidSvg(`<p style="color:#ef4444">Error: ${e.message}</p>`);
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStep(1);
    setFile(null);
    setKeywords([]);
    setSelected("");
    setCustomTopic("");
    setMermaidCode("");
    setMermaidSvg("");
  }

  function downloadSVG() {
    if (!mermaidSvg) return;
    const blob = new Blob([mermaidSvg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mindmap-${selected || customTopic || "output"}.svg`;
    a.click();
  }

  const activeTopic = selected || customTopic.trim();

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 48px', background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#4F46E5', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate("/")}>
          ⬡ Cortex MindMap
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ background: 'none', border: '1px solid #e2e8f0', padding: '8px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px 120px" }}>

        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: 60 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e0e7ff', color: '#4338ca', padding: '6px 16px', borderRadius: '100px', fontWeight: 700, fontSize: '0.8rem', marginBottom: 20 }}>
            <Sparkles size={14} /> AI Visualization
          </motion.div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)", fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>
            Turn concepts into<br />
            <span style={{ color: "#4f46e5" }}>Visual Knowledge.</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.1rem", fontFamily: 'Lora', maxWidth: 500, margin: '0 auto' }}>
            Our AI analyzes your documents and builds interactive branching maps to help you master structure.
          </p>
        </header>

        <StepTracker step={step} />

        {/* ── STEP 1: Upload ── */}
        {step === 1 && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <UploadCloud size={20} color="#4f46e5" />
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Step 01 — Upload Document</span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleFileDrop}
              style={{
                border: `2px dashed ${dragging ? "#4f46e5" : file ? "#4f46e5" : "#e2e8f0"}`,
                borderRadius: 20,
                padding: "48px 24px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                background: dragging ? "#f5f3ff" : "#fafafa",
                position: "relative",
              }}
            >
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInput}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
              />
              <div style={{
                width: 64, height: 64, background: '#fff', borderRadius: '16px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.05)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
              }}>
                <UploadCloud size={32} color={file ? "#4f46e5" : "#cbd5e1"} />
              </div>
              {file ? (
                <>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#1e293b" }}>{file.name}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>{formatBytes(file.size)}</div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#1e293b' }}>Drop your file here</div>
                  <div style={{ fontSize: 14, color: "#94a3b8" }}>PDF, DOCX, or TXT (Max 10MB)</div>
                </>
              )}
            </div>

            <div style={{ marginTop: 32 }}>
              <button
                onClick={extractKeywords}
                disabled={!file || loading}
                style={{
                  width: '100%',
                  padding: "16px 28px",
                  borderRadius: 14,
                  border: "none",
                  background: file && !loading ? "#4f46e5" : "#f1f5f9",
                  color: file && !loading ? "#ffffff" : "#94a3b8",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: file && !loading ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: file && !loading ? '0 10px 20px rgba(79, 70, 229, 0.2)' : 'none'
                }}
              >
                {loading ? "Processing Document…" : <>Next: Extract Topics <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} /></>}
              </button>
            </div>
          </Card>
        )}

        {/* ── STEP 2: Keywords ── */}
        {step === 2 && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Search size={20} color="#4f46e5" />
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Step 02 — Choose a Topic</span>
            </div>

            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
              AI has identified these key concepts. Select one to map it out, or enter your own:
            </p>

            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10, marginBottom: 32 }}>
              {keywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => { setSelected(kw); setCustomTopic(""); }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "12px",
                    border: `2px solid ${selected === kw ? "#4f46e5" : "#f1f5f9"}`,
                    background: selected === kw ? "#eef2ff" : "#fff",
                    color: selected === kw ? "#4f46e5" : "#64748b",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {kw}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', marginBottom: 32 }}>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => { setCustomTopic(e.target.value); setSelected(""); }}
                placeholder="Or type a custom topic to map..."
                style={{
                  width: '100%',
                  background: "#fff",
                  border: "2px solid #f1f5f9",
                  borderRadius: 14,
                  padding: "14px 18px",
                  fontSize: 15,
                  color: "#1e293b",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                onBlur={(e) => (e.target.style.borderColor = "#f1f5f9")}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={generateMindmap}
                disabled={!activeTopic || loading}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: 14,
                  border: "none",
                  background: activeTopic && !loading ? "#4f46e5" : "#f1f5f9",
                  color: activeTopic && !loading ? "#ffffff" : "#94a3b8",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: activeTopic && !loading ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Generating Map…" : "Generate MindMap"}
              </button>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "16px 24px",
                  borderRadius: 14,
                  border: "2px solid #f1f5f9",
                  background: "#fff",
                  color: "#64748b",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
            </div>
          </Card>
        )}

        {/* ── STEP 3: Mindmap ── */}
        {step === 3 && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Workflow size={20} color="#4f46e5" />
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>Step 03 — Visualization</span>
              </div>
              <div style={{
                background: "#eef2ff", padding: "6px 14px", borderRadius: "100px",
                fontSize: 12, color: "#4f46e5", fontWeight: 700
              }}>
                Topic: {selected || customTopic}
              </div>
            </div>

            {loading && <Spinner />}

            {mermaidSvg && (
              <div
                ref={mermaidRef}
                style={{
                  background: "#fff",
                  border: '1px solid #f1f5f9',
                  borderRadius: 20,
                  padding: 32,
                  overflow: "auto",
                  minHeight: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "fadeUp 0.6s ease forwards",
                  boxShadow: 'inset 0 0 40px rgba(0,0,0,0.01)'
                }}
                dangerouslySetInnerHTML={{ __html: mermaidSvg }}
              />
            )}

            <div style={{ display: "flex", flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
              <button
                onClick={restart}
                style={{
                  flex: 1, padding: "14px", borderRadius: 12,
                  border: "2px solid #f1f5f9", background: "#fff",
                  color: "#64748b", fontWeight: 600, cursor: "pointer",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <RotateCcw size={18} /> New Session
              </button>
              {mermaidSvg && (
                <button
                  onClick={downloadSVG}
                  style={{
                    flex: 1, padding: "14px", borderRadius: 12,
                    border: "none", background: "#4f46e5",
                    color: "#fff", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: 'center', gap: 8
                  }}
                >
                  <Download size={18} /> Download SVG
                </button>
              )}
            </div>
          </Card>
        )}

      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, right: 32,
          background: "#fff",
          border: `1px solid ${toast.type === "error" ? "#ef4444" : "#4f46e5"}`,
          color: toast.type === "error" ? "#ef4444" : "#4f46e5",
          borderRadius: 16, padding: "16px 24px",
          fontWeight: 600, fontSize: 14,
          animation: "toastIn 0.3s ease",
          zIndex: 999, maxWidth: 350,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          {toast.type === "success" ? <CheckCircle2 size={20} /> : <Workflow size={20} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}