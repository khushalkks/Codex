import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Sparkles, 
  Clock, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  RotateCcw,
  Zap,
  Layout,
  Star,
  BrainCircuit,
  Lightbulb,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PlanResponse = {
  days_left: number;
  daily_plan: Record<string, number>;
  weekly_schedule: any[];
  ai_advice: string;
};

export default function StudyPlan() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState("");
  const [hours, setHours] = useState(4);
  const [examDate, setExamDate] = useState("");
  const [difficulty, setDifficulty] = useState<any>({});
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubjects = (value: string) => {
    setSubjects(value);
    const subjectList = value.split(",").map((s) => s.trim()).filter(s => s !== "");
    const diffObj: any = {};
    subjectList.forEach((sub) => {
      diffObj[sub] = difficulty[sub] || "medium";
    });
    setDifficulty(diffObj);
  };

  const updateDifficulty = (subject: string, value: string) => {
    setDifficulty({ ...difficulty, [subject]: value });
  };

  const generatePlan = async () => {
    if (!subjects || !examDate) return;
    setLoading(true);
    const subjectList = subjects.split(",").map((s) => s.trim()).filter(s => s !== "");

    try {
      const res = await fetch("http://localhost:8000/api/generate-study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjects: subjectList,
          hours_per_day: hours,
          exam_date: examDate,
          difficulty: difficulty
        })
      });

      if (!res.ok) throw new Error("Failed to generate plan");
      const data = await res.json();
      setPlan(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setPlan(null);
    setSubjects("");
    setExamDate("");
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 50%, #f5f7ff 100%)', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1e293b', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background Aurora */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div animate={{ x: [0, 80, 0], y: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity }} style={{ position: 'absolute', top: '-10%', left: '10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <motion.div animate={{ x: [0, -60, 0], y: [0, 80, 0] }} transition={{ duration: 18, repeat: Infinity }} style={{ position: 'absolute', top: '30%', right: '-5%', width: '55vw', height: '55vw', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .glass-box {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 30px 60px -12px rgba(79, 70, 229, 0.08);
        }
        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 20px;
          color: #94a3b8;
          pointer-events: none;
        }
        .input-tint {
          background: rgba(248, 250, 252, 0.8) !important;
          border: 1px solid rgba(203, 213, 225, 0.6) !important;
          padding-left: 54px !important;
        }
        .input-tint:focus {
          background: #fff !important;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        /* Custom Date Picker UI */
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
        .advice-card {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: #fff;
          border-radius: 28px;
          padding: 32px;
          box-shadow: 0 25px 50px -10px rgba(79, 70, 229, 0.3);
          position: relative;
          overflow: hidden;
        }
        .advice-card::after {
          content: '';
          position: absolute;
          top: -20%;
          right: -10%;
          width: 200px;
          height: 200px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          filter: blur(40px);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Nav */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '16px 48px', background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#4F46E5', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate("/")}>
            <div style={{ background: '#4F46E5', color: '#fff', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={18} /></div>
            Cortex Planner
          </div>
        </div>
        <button 
          onClick={() => navigate("/dashboard")}
          style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeft size={16} /> Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px 120px", position: 'relative', zIndex: 1 }}>

        {!plan ? (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <header style={{ textAlign: "center", marginBottom: 60 }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EEF2FF', color: '#4338ca', padding: '8px 20px', borderRadius: '100px', fontWeight: 700, fontSize: '0.85rem', marginBottom: 24, border: '1px solid #C7D2FE' }}>
                <BrainCircuit size={16} /> Agentic ML Scheduling
              </motion.div>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 800, color: "#0f172a", marginBottom: 20, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Craft your <br />
                <span style={{ background: 'linear-gradient(90deg, #4f46e5, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Master Schedule.</span>
              </h1>
              <p style={{ color: "#64748b", fontSize: "1.15rem", fontFamily: 'Lora', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
                Our ML engine simulates your study load to create a high-retention roadmap for your exams.
              </p>
            </header>

            <div className="glass-box" style={{ borderRadius: 32, padding: 48 }}>
              <div style={{ display: 'grid', gap: 32 }}>
                
                <div>
                  <label style={{ fontSize: 13, fontWeight: 800, color: '#64748b', marginBottom: 12, display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Target Subjects (Comma Separated)</label>
                  <div className="input-group">
                    <BookOpen className="input-icon" size={20} />
                    <input
                      type="text"
                      className="input-tint"
                      placeholder="e.g. Organic Chemistry, Calculus, World History"
                      value={subjects}
                      onChange={(e) => handleSubjects(e.target.value)}
                      style={{ width: '100%', padding: '18px 24px', borderRadius: '18px', color: '#1e293b', fontSize: '16px', outline: 'none', transition: 'all 0.3s' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#64748b', marginBottom: 12, display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Hours Budget</label>
                    <div className="input-group">
                      <Clock className="input-icon" size={20} />
                      <input
                        type="number"
                        className="input-tint"
                        min="1" max="16"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        style={{ width: '100%', padding: '18px 24px', borderRadius: '18px', color: '#1e293b', fontSize: '16px', outline: 'none', transition: 'all 0.3s' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#64748b', marginBottom: 12, display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Deadline / Exam Date</label>
                    <div className="input-group">
                      <Calendar className="input-icon" size={20} />
                      <input
                        type="date"
                        className="input-tint"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        style={{ width: '100%', padding: '18px 24px', borderRadius: '18px', color: '#1e293b', fontSize: '16px', outline: 'none', transition: 'all 0.3s' }}
                      />
                    </div>
                  </div>
                </div>

                {Object.keys(difficulty).length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', marginBottom: 16, display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Subject Confidence Levels</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                      {Object.keys(difficulty).map((sub) => (
                        <div key={sub} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px', background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                           <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</span>
                           <select 
                             value={difficulty[sub]} 
                             onChange={(e) => updateDifficulty(sub, e.target.value)}
                             style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#4f46e5', outline: 'none', cursor: 'pointer' }}
                           >
                              <option value="easy">Easy (Revision)</option>
                              <option value="medium">Medium (Moderate)</option>
                              <option value="hard">Hard (Priority)</option>
                           </select>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <button 
                  onClick={generatePlan}
                  disabled={loading || !subjects || !examDate}
                  style={{ 
                    width: '100%', padding: '20px', borderRadius: '20px', border: 'none',
                    background: subjects && examDate && !loading ? 'linear-gradient(135deg, #4f46e5, #0ea5e9)' : '#e2e8f0',
                    color: '#fff',
                    fontWeight: 800, fontSize: '1rem', cursor: (subjects && examDate && !loading) ? 'pointer' : 'not-allowed',
                    transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    boxShadow: subjects && examDate && !loading ? '0 15px 35px rgba(79, 70, 229, 0.25)' : 'none'
                  }}
                  onMouseOver={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseOut={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? (
                    <><div style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Calculating Optimal Load...</>
                  ) : <>Generate AI Roadmap <Zap size={18} /></>}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Results View */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
               {/* AI Advice Card */}
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="advice-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 }}><Lightbulb size={24} /></div>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>AI Strategy Summary</span>
                  </div>
                  <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.95)', fontFamily: 'Lora', whiteSpace: 'pre-wrap' }}>
                    {plan.ai_advice}
                  </p>
                  <div style={{ position: 'absolute', bottom: 20, right: 24, opacity: 0.4 }}>
                    <BrainCircuit size={48} />
                  </div>
               </motion.div>

               {/* Stat Box */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="glass-box" style={{ padding: 24, borderRadius: 24, flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#4f46e5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>Time Left</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>{plan.days_left} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>Days</span></div>
                  </div>
                  <div className="glass-box" style={{ padding: 24, borderRadius: 24, flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#4f46e5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>Load Factor</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>{Object.keys(plan.daily_plan).length} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>Topics</span></div>
                  </div>
               </div>
            </div>

            <div>
               <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Layout size={20} color="#4f46e5" /> Optimized Daily Allocation
               </h3>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                  {Object.entries(plan.daily_plan).map(([sub, hrs]) => (
                    <motion.div key={sub} whileHover={{ y: -5 }} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                       <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: '#4f46e5' }} />
                       <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>{sub}</div>
                       <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4f46e5' }}>{hrs} <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 700 }}>hrs/day</span></div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, color: '#10b981', fontSize: '12px', fontWeight: 700 }}>
                         <ShieldCheck size={14} /> ML Balanced
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            <div>
               <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Sparkles size={20} color="#4f46e5" /> Personalized 7-Day Sprint
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {plan.weekly_schedule.map((day, idx) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                       <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Calendar size={16} /> {day.day}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Focus Phase</span>
                       </div>
                       <div style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                          {Object.entries(day).filter(([k]) => k !== "day").map(([sub, hrs]) => (
                             <div key={sub} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>{sub}</span>
                                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{hrs} hours</span>
                             </div>
                          ))}
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
               <button 
                onClick={restart}
                style={{ padding: '14px 40px', borderRadius: '14px', border: '2px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, transition: '0.2s' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#4F46E5'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
               >
                 <RotateCcw size={18} /> Reset All Parameters
               </button>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
