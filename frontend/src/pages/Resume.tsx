import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadArea } from '../components/UploadArea';
import { AnalysisResults } from '../components/AnalysisResults';
import { 
  Sparkles, 
  FileText, 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle2,
  Zap,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import type { AnalysisData } from '../types/resume.types';

export default function Resume() {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (file: File) => {
    setAnalyzing(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:8000/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Analysis failed on the server');
      }

      const backendData = await res.json();
      
      const resultData: AnalysisData = {
        score: backendData.score,
        strengths: backendData.strengths || [],
        weaknesses: backendData.weaknesses || [],
        suggestions: backendData.suggestions || [],
        matched_skills: backendData.matched_skills || [],
        missing_skills: backendData.missing_skills || [],
        fileName: file.name,
      };
      
      setAnalysisResult(resultData);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'An error occurred during analysis');
      } else {
        setError('An error occurred during analysis');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1e293b', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background Blobs */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div animate={{ x: [0, 80, 0], y: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity }} style={{ position: 'absolute', top: '-10%', left: '10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <motion.div animate={{ x: [0, -60, 0], y: [0, 80, 0] }} transition={{ duration: 18, repeat: Infinity }} style={{ position: 'absolute', top: '30%', right: '-5%', width: '55vw', height: '55vw', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .glass-box {
          background: rgba(255, 255, 255, 0.65);
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
          <div style={{ background: '#4F46E5', color: '#fff', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={18} /></div>
          Cortex Resume
        </div>
        <button 
          onClick={() => navigate("/dashboard")}
          style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(99,102,241,0.2)', padding: '10px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#4338ca', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeft size={16} /> Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px 120px", position: 'relative', zIndex: 1 }}>

        {!analyzing && !analysisResult && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <header style={{ textAlign: "center", marginBottom: 60 }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', color: '#4338ca', padding: '8px 20px', borderRadius: '100px', fontWeight: 700, fontSize: '0.85rem', marginBottom: 24, border: '1px solid rgba(99,102,241,0.2)' }}>
                <Target size={16} /> ATS Optimization AI
              </motion.div>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 800, color: "#0f172a", marginBottom: 20, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Unlock your <br />
                <span style={{ background: 'linear-gradient(90deg, #4f46e5, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Career Potential.</span>
              </h1>
              <p style={{ color: "#475569", fontSize: "1.2rem", fontFamily: 'Lora', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
                Upload your resume for a comprehensive AI analysis. Identify gaps, highlight strengths, and beat the ATS.
              </p>
            </header>

            <div className="glass-box" style={{ borderRadius: 32, padding: 48, textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: 24, padding: 8, border: '1px solid rgba(255,255,255,0.5)' }}>
                <UploadArea onUpload={handleFileUpload} />
              </div>
              
              {error && (
                <div style={{ marginTop: 24, padding: '16px', background: '#fef2f2', color: '#ef4444', borderRadius: '16px', fontSize: '15px', fontWeight: 700, border: '1px solid #fee2e2' }}>
                  ⚠️ {error}. Please ensure the backend is running!
                </div>
              )}
            </div>
          </motion.div>
        )}

        {analyzing && (
          <div className="glass-box" style={{ textAlign: 'center', padding: '80px', borderRadius: 32 }}>
            <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 32px' }}>
               <div style={{ width: '100%', height: '100%', borderRadius: "50%", border: "6px solid #f1f5f9", borderTopColor: "#4f46e5", animation: "spin 1s linear infinite" }} />
               <FileText size={40} color="#4f46e5" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Analyzing Resume...</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: 32 }}>Extracting skills and comparing against industry standards.</p>
            
            <div style={{ width: '100%', maxWidth: 400, height: 8, background: '#e2e8f0', borderRadius: 10, margin: '0 auto', overflow: 'hidden' }}>
               <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 10 }} style={{ height: '100%', background: 'linear-gradient(90deg, #4f46e5, #0ea5e9)', borderRadius: 10 }} />
            </div>
          </div>
        )}

        {analysisResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
            <AnalysisResults data={analysisResult} onReset={handleReset} />
            <div ref={bottomRef} />
          </motion.div>
        )}

      </div>
    </div>
  );
}