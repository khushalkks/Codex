import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  RotateCcw,
  FileText,
  Zap,
  Trophy
} from "lucide-react";
import { motion } from "framer-motion";

type Difficulty = "easy" | "medium" | "hard";
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

export default function QuizPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [summary, setSummary] = useState("");
  const [questions, setQuestions] = useState<
    Array<{
      id: number;
      question: string;
      options: string[];
      answer: number;
      explanation: string;
    }>
  >([]);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [, setError] = useState<string>("");

  const showToast = (msg: string, type: ToastType = "info") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

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

  async function generateQuiz() {
    if (!file) return;
    setError("");
    setLoading(true);
    setSummary("");
    setQuestions([]);
    setSelected({});
    setStep(2);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("difficulty", difficulty);

      const res = await fetch(`${API}/quiz/generate`, { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      if (!data?.questions?.length) throw new Error("No MCQs returned from server.");

      setSummary(data.summary || "");
      setQuestions(data.questions);
      setStep(3);
      showToast(`${data.questions.length} MCQs generated!`, "success");
    } catch (e: any) {
      setError(e?.message || "Quiz generate nahi ho paya.");
      showToast("Quiz generate failed: " + (e?.message || ""), "error");
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStep(1);
    setFile(null);
    setDragging(false);
    setDifficulty("easy");
    setLoading(false);
    setSummary("");
    setQuestions([]);
    setSelected({});
    setError("");
  }

  function submitQuiz() {
    if (!questions.length) return;
    if (!questions.every((q) => typeof selected[q.id] === "number")) {
      showToast("Pehle saare questions ka answer select karein.", "info");
      return;
    }

    const total = questions.length;
    let correct = 0;
    for (const q of questions) {
      if (selected[q.id] === q.answer) correct += 1;
    }

    navigate("/quiz/result", {
      state: {
        score: correct,
        total,
        difficulty,
        summary,
        questions,
        selected,
      },
    });
  }

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1e293b', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Dynamic Background Blobs */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div animate={{ x: [0, 80, 0], y: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity }} style={{ position: 'absolute', top: '-10%', left: '10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <motion.div animate={{ x: [0, -60, 0], y: [0, 80, 0] }} transition={{ duration: 18, repeat: Infinity }} style={{ position: 'absolute', top: '30%', right: '-5%', width: '55vw', height: '55vw', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .glass-box {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Nav */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '20px 48px', background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#4F46E5', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate("/")}>
          <div style={{ background: '#4F46E5', color: '#fff', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={18} /></div>
          Cortex Quiz
        </div>
        <button 
          onClick={() => navigate("/dashboard")}
          style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(99,102,241,0.2)', padding: '10px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#4338ca', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeft size={16} /> Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "80px 24px 120px", position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: 60 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', color: '#4338ca', padding: '8px 20px', borderRadius: '100px', fontWeight: 700, fontSize: '0.85rem', marginBottom: 24, border: '1px solid rgba(99,102,241,0.2)' }}>
            <Trophy size={16} /> Knowledge Assessment
          </motion.div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 800, color: "#0f172a", marginBottom: 20, letterSpacing: '-0.02em' }}>
            Transform files into <br />
            <span style={{ background: 'linear-gradient(90deg, #4f46e5, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Creative AI Quizzes.</span>
          </h1>
          <p style={{ color: "#475569", fontSize: "1.2rem", fontFamily: 'Lora', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Master your materials with custom AI-generated MCQs designed for deep learning.
          </p>
        </header>

        {/* ── STEP 1: Upload ── */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-box" style={{ borderRadius: 32, padding: 48 }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
                style={{
                  border: `2px dashed ${dragging ? "#4f46e5" : "#cbd5e1"}`,
                  borderRadius: 24, padding: "60px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.3s",
                  background: dragging ? "rgba(99, 102, 241, 0.05)" : "rgba(255, 255, 255, 0.4)", position: "relative"
                }}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input id="file-input" type="file" accept=".pdf,.docx,.txt" onChange={handleFileInput} style={{ display: 'none' }} />
                <div style={{ width: 80, height: 80, background: '#fff', borderRadius: '24px', boxShadow: '0 15px 30px rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <UploadCloud size={36} color={file ? "#4f46e5" : "#94a3b8"} />
                </div>
                {file ? (
                  <>
                    <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>{file.name}</div>
                    <div style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>{formatBytes(file.size)} — Ready</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8, color: '#0f172a' }}>Drop your document here</div>
                    <div style={{ fontSize: 15, color: "#64748b" }}>Support for PDF, DOCX, and TXT files.</div>
                  </>
                )}
              </div>

              <div style={{ marginTop: 32 }}>
                <label style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 14, display: 'block' }}>Choose Difficulty Level</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      style={{
                        flex: 1, padding: "14px", borderRadius: "16px",
                        border: `2px solid ${difficulty === d ? "#4f46e5" : "transparent"}`,
                        background: difficulty === d ? "#eef2ff" : "rgba(255,255,255,0.5)",
                        color: difficulty === d ? "#4f46e5" : "#64748b",
                        fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateQuiz}
                disabled={!file || loading}
                style={{
                  width: '100%', marginTop: 32, padding: "18px", borderRadius: 16, border: "none",
                  background: file && !loading ? 'linear-gradient(135deg, #4f46e5, #0ea5e9)' : "#e2e8f0", 
                  color: file && !loading ? "#ffffff" : "#94a3b8",
                  fontWeight: 800, fontSize: 17, cursor: file && !loading ? "pointer" : "not-allowed",
                  transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: 'center', gap: 12,
                  boxShadow: file && !loading ? '0 15px 30px rgba(79, 70, 229, 0.3)' : 'none'
                }}
              >
                {loading ? "Generating Quiz..." : "Next: Generate MCQs"} <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Loading ── */}
        {step === 2 && (
          <div className="glass-box" style={{ textAlign: 'center', padding: '80px', borderRadius: 32 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", border: "5px solid #e2e8f0", borderTopColor: "#4f46e5", animation: "spin 0.8s linear infinite", margin: '0 auto 32px' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Crafting your Quiz...</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>AI is extracting key concepts and generating challenging questions.</p>
          </div>
        )}

        {/* ── STEP 3: Quiz ── */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            {summary && (
              <div className="glass-box" style={{ borderRadius: 24, padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <FileText size={20} color="#4f46e5" />
                  <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>AI Insight Summary</span>
                </div>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, maxHeight: '150px', overflow: 'auto', paddingRight: '10px' }}>{summary}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {questions.map((q, idx) => {
                const chosen = selected[q.id];
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    whileInView={{ opacity: 1, x: 0 }} 
                    viewport={{ once: true }}
                    key={q.id} 
                    style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 32, padding: 40, boxShadow: '0 15px 40px rgba(0,0,0,0.03)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: '#4f46e5', letterSpacing: '2px', background: '#eef2ff', padding: '6px 16px', borderRadius: '100px' }}>QUESTION {idx + 1}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>Difficulty: {difficulty}</div>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 28, lineHeight: 1.4, fontFamily: 'Lora' }}>{q.question}</h3>
                    
                    <div style={{ display: 'grid', gap: 12 }}>
                      {q.options.map((opt, i) => {
                        const isChosen = chosen === i;
                        return (
                          <button
                            key={i}
                            onClick={() => setSelected((p) => ({ ...p, [q.id]: i }))}
                            style={{
                              textAlign: 'left', padding: '20px 24px', borderRadius: '20px',
                              border: `2px solid ${isChosen ? "#4f46e5" : "#f1f5f9"}`,
                              background: isChosen ? "#f5f3ff" : "#fff",
                              color: isChosen ? "#4f46e5" : "#1e293b",
                              fontSize: '16px', fontWeight: isChosen ? 800 : 500,
                              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 16
                            }}
                          >
                            <div style={{ 
                              width: 32, height: 32, borderRadius: '10px', 
                              background: isChosen ? '#4f46e5' : '#f1f5f9', 
                              color: isChosen ? '#fff' : '#64748b',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 900, fontSize: '13px'
                            }}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
              <button onClick={restart} style={{ padding: '20px 32px', borderRadius: '20px', border: '2px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                <RotateCcw size={20} /> Restart
              </button>
              <button 
                onClick={submitQuiz}
                style={{ flex: 1, padding: '20px 32px', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)', color: '#fff', fontWeight: 900, fontSize: '17px', cursor: 'pointer', boxShadow: '0 15px 40px rgba(79, 70, 229, 0.3)' }}
              >
                Submit Assessment
              </button>
            </div>
          </motion.div>
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
          fontWeight: 800, fontSize: 14,
          animation: "toastIn 0.3s ease",
          zIndex: 999, maxWidth: 350,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          {toast.type === "success" ? <CheckCircle2 size={22} /> : <Sparkles size={22} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
