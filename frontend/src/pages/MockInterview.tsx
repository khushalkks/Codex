import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInterview } from "../hooks/useInterview";
import ChatMessage from "../components/chat/ChatMessage";
import TypingIndicator from "../components/chat/TypingIndicator";
import ChatInput from "../components/chat/ChatInput";
import { 
  ArrowLeft, 
  Mic, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2,
  Play,
  Zap,
  Star,
  BrainCircuit,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ProgressBar({ count }: { count: number }) {
  const progress = Math.min((count / 5) * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", letterSpacing: '0.05em' }}>PHASE {count}/5</div>
      <div style={{ width: 120, height: 6, background: "rgba(99, 102, 241, 0.1)", borderRadius: 10, overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          style={{ height: "100%", borderRadius: 10, background: "linear-gradient(90deg, #4f46e5, #818cf8)", boxShadow: '0 0 10px rgba(79, 70, 229, 0.4)' }} 
        />
      </div>
    </div>
  );
}

export default function MockInterview() {
  const navigate = useNavigate();
  const { messages, state, startInterview, sendMessage, reset } = useInterview();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, state.isLoading]);

  return (
    <div style={{ background: '#f8faff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1e293b', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background Aurora */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div animate={{ x: [0, 100, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity }} style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <motion.div animate={{ x: [0, -80, 0], y: [0, 100, 0] }} transition={{ duration: 18, repeat: Infinity }} style={{ position: 'absolute', top: '20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 20px 50px rgba(0,0,0,0.03);
        }
        .chat-container::-webkit-scrollbar { width: 6px; }
        .chat-container::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      {/* Navigation */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '16px 40px', background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#4F46E5', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate("/")}>
          <div style={{ background: '#4F46E5', color: '#fff', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mic size={18} /></div>
          MockPrep AI
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {state.isStarted && <ProgressBar count={state.questionCount} />}
          <button 
            onClick={() => navigate("/dashboard")}
            style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '8px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: '0.2s' }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#4F46E5'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 100px', position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
        
        {!state.isStarted ? (
          /* Welcome Screen */
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ borderRadius: 40, padding: 60, textAlign: 'center', maxWidth: 640 }}>
              <div style={{ width: 80, height: 80, background: '#fff', borderRadius: '24px', boxShadow: '0 15px 30px rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                <BrainCircuit size={36} color="#4f46e5" />
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EEF2FF', color: '#4338ca', padding: '8px 20px', borderRadius: '100px', fontWeight: 700, fontSize: '0.85rem', marginBottom: 24 }}>
                <Sparkles size={16} /> Expert Feedback System
              </motion.div>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3rem)", fontWeight: 800, color: "#0f172a", marginBottom: 20, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Master your <br />
                <span style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dream Interview.</span>
              </h1>
              <p style={{ color: "#64748b", fontSize: "1.15rem", fontFamily: 'Lora', maxWidth: 480, margin: '0 auto 48px', lineHeight: 1.6 }}>
                Our AI simulates a real interview environment, asking tailored questions and providing actionable feedback to polish your skills.
              </p>
              
              <button 
                onClick={startInterview}
                style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '18px 48px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, margin: '0 auto', boxShadow: '0 15px 35px rgba(79, 70, 229, 0.25)', transition: '0.3s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Start Session <Play size={20} fill="currentColor" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Interview Chat Interface */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
             
             <div className="chat-container" style={{ flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 32 }}>
                {messages.map((msg, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      gap: 16, 
                      maxWidth: '85%',
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    <div style={{ 
                      width: 40, height: 40, borderRadius: 12, 
                      background: msg.role === 'user' ? '#4f46e5' : '#fff', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flexShrink: 0,
                      border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0'
                    }}>
                      {msg.role === 'user' ? <Star size={20} color="#fff" /> : <Mic size={20} color="#4f46e5" />}
                    </div>
                    <div style={{ 
                      padding: '16px 24px', 
                      borderRadius: 20, 
                      background: msg.role === 'user' ? '#4f46e5' : '#fff',
                      color: msg.role === 'user' ? '#fff' : '#1e293b',
                      fontSize: '1rem',
                      lineHeight: 1.6,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                      border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                      borderTopRightRadius: msg.role === 'user' ? 4 : 20,
                      borderTopLeftRadius: msg.role === 'assistant' ? 4 : 20,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                
                {state.isLoading && (
                  <div style={{ alignSelf: 'flex-start', padding: '12px 24px', background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', display: 'flex', gap: 6 }}>
                     {[0, 1, 2].map(i => (
                       <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} style={{ width: 6, height: 6, background: '#4f46e5', borderRadius: '50%' }} />
                     ))}
                  </div>
                )}
                
                <div ref={bottomRef} />
             </div>

             {state.isFinished && (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 24, padding: '32px', textAlign: 'center', marginBottom: 24 }}>
                  <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#166534', marginBottom: 8 }}>Interview Completed!</h3>
                  <p style={{ color: '#15803d', marginBottom: 24 }}>Great job! Review your feedback above to improve further.</p>
                  <button onClick={reset} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}>
                    <RotateCcw size={18} /> New Interview
                  </button>
               </motion.div>
             )}

             {!state.isFinished && (
               <div style={{ position: 'sticky', bottom: 0, background: 'rgba(248, 250, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '24px 0' }}>
                  <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <ChatInput 
                      onSend={sendMessage} 
                      disabled={state.isLoading} 
                      placeholder="Type your answer or ask for a hint..." 
                    />
                    <div style={{ textAlign: 'center', marginTop: 12, fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                      Powered by Llama-3.3-70B · Pro Mentor Mode Active
                    </div>
                  </div>
               </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
}