import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  FileText,
  Share2,
  CreditCard,
  MessageSquare,
  Zap,
  UserCheck,
  Search,
  Users,
  Code,
  Calendar,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Layout,
  Star,
  LogOut,
  PenTool
} from "lucide-react";
import { useRef } from "react";

const features = [
  { id: "summary", route: "/summary", title: "Smart Summary", tagline: "Distill documents into crisp text", desc: "AI reads your full document and produces a concise summary in seconds.", icon: <FileText size={28} />, color: "#4f46e5" },
  { id: "mindmap", route: "/mindmap", title: "Mind Map", tagline: "Visualise knowledge as a graph", desc: "Transforms concepts into a branching mind map for visual clarity.", icon: <Share2 size={28} />, color: "#0891b2" },
  { id: "flashcard", route: "/flashcards", title: "Flash Cards", tagline: "Learn faster with study cards", desc: "Auto-generates Q&A flashcards for effective spaced repetition.", icon: <CreditCard size={28} />, color: "#059669" },
  { id: "chatbot", route: "/chatbot", title: "AI Chatbot", tagline: "Converse with your knowledge", desc: "Ask anything and get grounded answers cited from your files.", icon: <MessageSquare size={28} />, color: "#7c3aed" },
  { id: "quiz", route: "/quiz", title: "Quiz Mode", tagline: "Test your understanding", desc: "Generates MCQ quizzes to track your score and find gaps.", icon: <Zap size={28} />, color: "#ea580c" },
  { id: "interview", route: "/interview", title: "Interview Prep", tagline: "Ace interviews with topics", desc: "Extracts likely interview questions to build your confidence.", icon: <UserCheck size={28} />, color: "#dc2626" },
  { id: "resume", route: "/resume", title: "Resume Analyzer", tagline: "Grade & optimize your resume", desc: "Detect missing skills and get AI feedback to improve ATS score.", icon: <Search size={28} />, color: "#2563eb" },
  { id: "community", route: "/community", title: "Real-Time Community", tagline: "Live developer discussions", desc: "Join real-time channels and collaborate with other users live.", icon: <Users size={28} />, color: "#4f46e5" },
  { id: "codecollab", route: "/code", title: "Collaborative IDE", tagline: "Code synchronously with peers", desc: "Monaco Editor environment for real-time collaborative coding.", icon: <Code size={28} />, color: "#1e293b" },
  { id: "study-planner", route: "/study-plan", title: "AI Study Planner", tagline: "Personalized study schedules", desc: "Generate adaptive study schedules optimized for your goals.", icon: <Calendar size={28} />, color: "#6366f1" },
  { id: "whiteboard", route: "/whiteboard", title: "Collaborative Whiteboard", tagline: "Draw & brainstorm together", desc: "Real-time collaborative whiteboard for visual brainstorming with your team.", icon: <PenTool size={28} />, color: "#f43f5e" }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        .roadmap-container { position: relative; max-width: 1000px; margin: 0 auto; padding: 60px 20px 200px; }
        .feature-row { display: grid; grid-template-columns: 1fr 1fr; gap: 120px; align-items: center; margin-bottom: 180px; position: relative; z-index: 10; }
        .icon-container {
          background: #4f46e5;
          color: #fff;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 28px;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .icon-container:hover { transform: scale(1.1) rotate(5deg); }
        
        @media (max-width: 900px) {
          .feature-row { grid-template-columns: 1fr; gap: 40px; }
          .side-info { text-align: left !important; }
          .svg-path-desktop { display: none; }
          .icon-container { margin-left: 0 !important; margin-right: auto !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 48px',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#4F46E5', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate("/home")}>
          <div style={{ background: '#4F46E5', color: '#fff', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layout size={18} /></div>
          Cortex Roadmap
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '6px 6px 6px 16px', borderRadius: '100px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{user?.name || 'User'}</div>
              <img src={user.avatar} style={{ width: 28, height: 28, borderRadius: '50%' }} />
              <button
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: '#94a3b8', padding: '6px', cursor: 'pointer', transition: '0.2s' }}
                onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
          <button
            onClick={() => navigate("/home")}
            style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '8px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <ArrowLeft size={16} /> Home
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px' }}>
        <header style={{ textAlign: 'center', marginBottom: '120px' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e0e7ff', color: '#4338ca', padding: '6px 16px', borderRadius: '100px', fontWeight: 700, fontSize: '0.85rem', marginBottom: 24 }}>
            <Sparkles size={16} /> Welcome back, {user?.name?.split(' ')[0] || 'Scholar'}
          </motion.div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: '#0f172a', marginBottom: 20, letterSpacing: '-0.02em' }}>Your Learning Journey.</h1>
          <p style={{ fontSize: '1.2rem', color: '#64748b', fontFamily: 'Lora', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>Continue your path toward mastery using our elite AI-driven tools.</p>
        </header>

        <div className="roadmap-container" ref={containerRef}>
          {/* Curved SVG Path for Desktop */}
          <svg className="svg-path-desktop" width="100%" height="100%" viewBox="0 0 1000 2200" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} preserveAspectRatio="none">
            <path d="M500,0 C500,100 800,200 800,400 C800,600 200,800 200,1000 C200,1200 800,1400 800,1600 C800,1800 500,1900 500,2100" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeDasharray="10 10" />
            <motion.path
              d="M500,0 C500,100 800,200 800,400 C800,600 200,800 200,1000 C200,1200 800,1400 800,1600 C800,1800 500,1900 500,2100"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              style={{ pathLength }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="25%" stopColor="#0891b2" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="75%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>

          {features.map((f, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={f.id}
                className="feature-row"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                {/* Side 1: Info (L) or Action (R) */}
                <div style={{ textAlign: isLeft ? 'right' : 'left' }} className="side-info">
                  {isLeft ? (
                    <>
                      <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{f.title}</h3>
                      <p style={{ color: f.color, fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>{f.tagline}</p>
                      <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '400px', marginLeft: 'auto' }}>{f.desc}</p>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
                      <div className="icon-container" style={{ background: f.color, boxShadow: `0 15px 30px ${f.color}44` }}>
                        {f.icon}
                      </div>
                      <button
                        onClick={() => navigate(f.route)}
                        style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.3s' }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        Launch {f.title} <ArrowRight size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Side 2: Action (L) or Info (R) */}
                <div style={{ textAlign: isLeft ? 'left' : 'right' }} className="side-info">
                  {!isLeft ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{f.title}</h3>
                      <p style={{ color: f.color, fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>{f.tagline}</p>
                      <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '400px' }}>{f.desc}</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-end' }}>
                      <div className="icon-container" style={{ background: f.color, boxShadow: `0 15px 30px ${f.color}44` }}>
                        {f.icon}
                      </div>
                      <button
                        onClick={() => navigate(f.route)}
                        style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.3s' }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        Launch {f.title} <ArrowRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;