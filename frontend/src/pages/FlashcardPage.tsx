import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  UploadCloud, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "http://127.0.0.1:8000/api";

type Flashcard = {
  question: string;
  answer: string;
};

export default function FlashcardGenerator() {
  const navigate = useNavigate();
  const [file, setFileState] = useState<File | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File | null | undefined) => {
    if (!f) return;
    if (!f.name.match(/\.(pdf|txt|docx)$/i)) {
      setError("Only PDF, DOCX, and TXT are supported.");
      return;
    }
    setError("");
    setFileState(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const generate = async () => {
    if (!file) return;
    setStep(2);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/flashcards/generate`, { method: "POST", body: form });
      if (!res.ok) {
        const txt = await res.text();
        try { throw new Error(JSON.parse(txt).detail || `Server error ${res.status}`); }
        catch { throw new Error(txt || `Server error ${res.status}`); }
      }
      const data = await res.json();
      const cards: Flashcard[] = data.flashcards || [];
      if (!cards.length) throw new Error("No flashcards returned.");
      setFlashcards(cards);
      setCurrent(0);
      setFlipped(false);
      setStep(3);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
      setStep(1);
    }
  };

  const go = (dir: 1 | -1) => {
    setFlipped(false);
    setTimeout(() => setCurrent((c) => (c + dir + flashcards.length) % flashcards.length), 100);
  };

  const reset = () => { setFileState(null); setStep(1); setFlashcards([]); setError(""); };

  return (
    <div style={{ 
      background: '#f0f4ff', 
      minHeight: '100vh', 
      fontFamily: "'Inter', sans-serif", 
      color: '#1e293b',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Mesh Gradient & Blobs */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div animate={{ x: [0, 100, 0], y: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity }} style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <motion.div animate={{ x: [0, -80, 0], y: [0, 100, 0] }} transition={{ duration: 18, repeat: Infinity }} style={{ position: 'absolute', top: '20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <motion.div animate={{ x: [0, 40, 0], y: [0, -60, 0] }} transition={{ duration: 20, repeat: Infinity }} style={{ position: 'absolute', bottom: '-10%', left: '20%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .glass-card {
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
          <div style={{ background: '#4F46E5', color: '#fff', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={18} /></div>
          Cortex Flash
        </div>
        <button 
          onClick={() => navigate("/dashboard")}
          style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(99,102,241,0.2)', padding: '10px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#4338ca', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeft size={16} /> Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px 120px", position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: 60 }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', color: '#4338ca', padding: '8px 20px', borderRadius: '100px', fontWeight: 700, fontSize: '0.85rem', marginBottom: 24, border: '1px solid rgba(99,102,241,0.2)' }}>
            <Sparkles size={16} /> Spaced Repetition AI
          </motion.div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 800, color: "#0f172a", marginBottom: 20, letterSpacing: '-0.02em' }}>
            Learn Faster with <br />
            <span style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Creative AI Cards.</span>
          </h1>
          <p style={{ color: "#475569", fontSize: "1.2rem", fontFamily: 'Lora', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Upload your lecture notes or documents, and our AI will craft intelligent active-recall cards.
          </p>
        </header>

        {/* ── STEP 1: Upload ── */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass-card" style={{ borderRadius: 32, padding: 48 }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragOver ? "#4f46e5" : "#cbd5e1"}`,
                  borderRadius: 24, padding: "60px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.3s",
                  background: dragOver ? "rgba(99, 102, 241, 0.05)" : "rgba(255, 255, 255, 0.4)", position: "relative"
                }}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input id="file-input" type="file" accept=".pdf,.docx,.txt" onChange={(e) => handleFile(e.target.files?.[0])} style={{ display: 'none' }} />
                <div style={{ width: 80, height: 80, background: '#fff', borderRadius: '24px', boxShadow: '0 15px 30px rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <UploadCloud size={36} color={file ? "#4f46e5" : "#94a3b8"} />
                </div>
                {file ? (
                  <>
                    <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>{file.name}</div>
                    <div style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>{(file.size / 1024).toFixed(1)} KB — Ready to Process</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8, color: '#0f172a' }}>Drop your study material here</div>
                    <div style={{ fontSize: 15, color: "#64748b" }}>Support for PDF, DOCX, and TXT files.</div>
                  </>
                )}
              </div>

              {error && (
                <div style={{ marginTop: 24, padding: '16px', background: '#fef2f2', color: '#ef4444', borderRadius: '16px', fontSize: '15px', fontWeight: 700, border: '1px solid #fee2e2' }}>
                  {error}
                </div>
              )}

              <button
                onClick={generate}
                disabled={!file}
                style={{
                  width: '100%', marginTop: 32, padding: "18px", borderRadius: 16, border: "none",
                  background: file ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : "#e2e8f0", 
                  color: file ? "#ffffff" : "#94a3b8",
                  fontWeight: 800, fontSize: 17, cursor: file ? "pointer" : "not-allowed",
                  transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: 'center', gap: 12,
                  boxShadow: file ? '0 15px 30px rgba(79, 70, 229, 0.3)' : 'none'
                }}
              >
                Generate Creative Flashcards <Sparkles size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Loading ── */}
        {step === 2 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '80px', borderRadius: 32 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", border: "5px solid #e2e8f0", borderTopColor: "#4f46e5", animation: "spin 0.8s linear infinite", margin: '0 auto 32px' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Analyzing Content...</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Our AI is reading your document to extract the most important cards.</p>
          </div>
        )}

        {/* ── STEP 3: Flashcards ── */}
        {step === 3 && flashcards.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 32 }}>
            
            {/* Progress Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: '#4f46e5', color: '#fff', padding: '8px 18px', borderRadius: '14px', fontWeight: 800, fontSize: '14px', boxShadow: '0 8px 20px rgba(79, 70, 229, 0.2)' }}>
                  Card {current + 1} of {flashcards.length}
                </div>
                <div style={{ fontSize: '14px', color: '#475569', fontWeight: 700 }}>
                  {Math.round(((current + 1) / flashcards.length) * 100)}% Mastered
                </div>
              </div>
              <button onClick={reset} style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid #e2e8f0', color: '#64748b', padding: '8px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <RotateCcw size={16} /> New Session
              </button>
            </div>

            {/* Flashcard container */}
            <div 
              onClick={() => setFlipped(!flipped)}
              style={{ perspective: "1500px", cursor: "pointer", height: '420px' }}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{
                  position: "relative", width: "100%", height: "100%",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Front Side */}
                <div style={{
                  position: "absolute", inset: 0, backfaceVisibility: "hidden",
                  background: "#fff", border: "1px solid #e2e8f0", borderRadius: "40px",
                  padding: "60px", display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", textAlign: "center", boxShadow: '0 30px 60px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ position: 'absolute', top: 40, background: '#f1f5f9', padding: '8px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: 800, color: '#475569', letterSpacing: '2px' }}>QUESTION</div>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35, fontFamily: 'Lora' }}>{flashcards[current]?.question}</h3>
                  <div style={{ position: 'absolute', bottom: 40, display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px', color: '#94a3b8', fontWeight: 700 }}>
                    <Sparkles size={16} /> Click to reveal answer
                  </div>
                </div>

                {/* Back Side */}
                <div style={{
                  position: "absolute", inset: 0, backfaceVisibility: "hidden",
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: "40px",
                  padding: "60px", display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", textAlign: "center", color: '#fff', transform: "rotateY(180deg)", boxShadow: '0 30px 60px rgba(79, 70, 229, 0.3)'
                }}>
                  <div style={{ position: 'absolute', top: 40, background: 'rgba(255,255,255,0.25)', padding: '8px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: 800, color: '#fff', letterSpacing: '2px' }}>ANSWER</div>
                  <p style={{ fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.5, fontFamily: 'Lora' }}>{flashcards[current]?.answer}</p>
                  <div style={{ position: 'absolute', bottom: 40, fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Click to flip back</div>
                </div>
              </motion.div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 20 }}>
              <button 
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '20px', fontWeight: 800, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: '0.2s', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <ChevronLeft size={24} /> Previous
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); go(1); }}
                style={{ flex: 1, background: '#0f172a', color: '#fff', border: 'none', padding: '20px', borderRadius: '20px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: '0.3s', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Next Challenge <ChevronRight size={24} />
              </button>
            </div>

            {/* Dot Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {flashcards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); setFlipped(false); }}
                  style={{
                    width: 44, height: 44, borderRadius: '14px', fontSize: '14px', fontWeight: 800,
                    cursor: 'pointer', border: '1px solid #e2e8f0',
                    background: i === current ? '#4f46e5' : '#fff',
                    color: i === current ? '#fff' : '#64748b',
                    transition: 'all 0.2s',
                    boxShadow: i === current ? '0 5px 15px rgba(79, 70, 229, 0.3)' : 'none'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}