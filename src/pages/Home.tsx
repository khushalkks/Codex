import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Users,
  BrainCircuit,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Layout,
  Zap,
  Code,
  Search,
  User,
  ArrowUpRight,
  LogOut,
  Shield,
  Star,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleGetStarted = () => {
    if (user) navigate("/dashboard");
    else navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  return (
    <div className="page" style={{
      background: '#020617',
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      color: '#f8fafc',
      minHeight: '100vh',
      overflowX: 'hidden',
      position: 'relative'
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        /* Grid background overlay */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(99, 102, 241, 0.07) 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.8;
          pointer-events: none;
          z-index: 1;
        }

        .nav { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          padding: 20px 48px; 
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px); 
          -webkit-backdrop-filter: blur(20px);
          position: sticky; 
          top: 0; 
          z-index: 100;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .logo-text {
          font-weight: 800;
          font-size: 1.35rem;
          background: linear-gradient(135deg, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }
        
        .btn-primary { 
          background: linear-gradient(135deg, #6366f1, #4f46e5); 
          color: #fff; 
          border: none; 
          padding: 14px 28px; 
          border-radius: 14px; 
          font-size: 0.95rem; 
          font-weight: 700; 
          cursor: pointer; 
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
          display: flex; 
          align-items: center; 
          gap: 10px;
        }
        .btn-primary:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 12px 30px rgba(99, 102, 241, 0.5); 
          filter: brightness(1.1);
        }

        .glass-card {
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          border-radius: 28px;
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 25px 60px rgba(99, 102, 241, 0.08);
        }

        .floating-bubble {
          background: rgba(15, 23, 42, 0.7); 
          padding: 14px 22px; 
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06); 
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          color: #f8fafc; 
          font-size: 0.95rem; 
          font-weight: 600;
          display: flex; 
          align-items: center; 
          gap: 12px; 
          position: absolute;
          z-index: 5;
          backdrop-filter: blur(10px);
        }

        .hero-title {
          font-size: clamp(2.8rem, 6.5vw, 4.8rem); 
          font-weight: 800; 
          line-height: 1.1;
          letter-spacing: -0.04em; 
          color: #fff; 
          margin-bottom: 24px;
        }

        .roadmap-img {
          width: 100%; 
          height: 360px; 
          border-radius: 24px; 
          object-fit: cover;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5); 
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.5s ease;
        }
        .roadmap-img-container:hover .roadmap-img {
          transform: scale(1.02);
        }

        /* custom scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }

        @media (max-width: 1100px) {
          .hero-bubbles { display: none !important; }
        }
      `}</style>

      {/* Grid background overlay */}
      <div className="grid-overlay" />

      {/* Glowing Mesh Blobs */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <motion.div animate={{ x: [0, 80, 0], y: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 60%)', filter: 'blur(100px)' }} />
        <motion.div animate={{ x: [0, -60, 0], y: [0, 80, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '25%', right: '-10%', width: '55vw', height: '55vw', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 60%)', filter: 'blur(120px)' }} />
        <motion.div animate={{ x: [0, 40, 0], y: [0, -60, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: '10%', left: '20%', width: '45vw', height: '45vw', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, transparent 60%)', filter: 'blur(100px)' }} />
      </div>

      {/* Navigation */}
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate("/home")}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(99,102,241,0.3)' }}>
            <GraduationCap size={20} />
          </div>
          <span className="logo-text">CortexCraft</span>
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'} onClick={() => navigate("/community")}>Community</button>

          <AnimatePresence mode="wait">
            {user ? (
              <motion.div
                key="user-pill"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', padding: '6px 6px 6px 16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>{user?.name?.split(' ')[0] || 'User'}</div>
                <img src={user.avatar} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', color: '#64748b', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s' }}
                  onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                >
                  <LogOut size={16} />
                </button>
              </motion.div>
            ) : (
              <button
                key="login-btn"
                className="btn-primary"
                onClick={() => navigate("/login")}
              >
                Join Now <ArrowRight size={18} />
              </button>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '120px 24px 180px', textAlign: 'center', zIndex: 10 }}>
        <div className="hero-bubbles" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <motion.div animate={{ y: [0, -15, 0], rotate: [-2, 0, -2] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="floating-bubble" style={{ top: '15%', left: '8%' }}>
            Explain Neural Networks. <BrainCircuit size={18} color="#6366f1" />
          </motion.div>

          <motion.div animate={{ y: [0, 15, 0], rotate: [2, 4, 2] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="floating-bubble" style={{ bottom: '15%', left: '12%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', boxShadow: '0 20px 40px rgba(99,102,241,0.3)' }}>
            Think step-by-step. <Zap size={18} />
          </motion.div>

          <motion.div animate={{ y: [0, -15, 0], rotate: [4, 6, 4] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }} className="floating-bubble" style={{ top: '20%', right: '8%' }}>
            TypeScript vs JavaScript? <Code size={18} color="#0891b2" />
          </motion.div>

          <motion.div animate={{ y: [0, 15, 0], rotate: [-4, -2, -4] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }} className="floating-bubble" style={{ bottom: '20%', right: '12%' }}>
            Socratic Logic. <CheckCircle2 size={18} color="#10b981" />
          </motion.div>
        </div>

        <div style={{ maxWidth: 950, margin: '0 auto', position: 'relative' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              background: 'rgba(99, 102, 241, 0.1)', 
              color: '#818cf8', 
              padding: '8px 24px', 
              borderRadius: '100px', 
              fontWeight: 800, 
              fontSize: '0.85rem', 
              marginBottom: 32, 
              border: '1px solid rgba(99, 102, 241, 0.2)', 
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.15)' 
            }}
          >
            <Sparkles size={16} /> Elite AI-Powered Notebook
          </motion.div>
          
          <h1 className="hero-title">
            Stop pulling your hair out.<br />
            Your <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>'Aha!' moment</span> is one tap away.
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: 56, maxWidth: 640, margin: '0 auto 56px', lineHeight: 1.6 }}>
            CortexCraft reads your documents, generates conceptual maps, reviews your code, and schedules study plans. AI learning tailored to your mind.
          </p>

          <motion.div
            whileHover={{ scale: 1.01, borderColor: 'rgba(99, 102, 241, 0.4)' }}
            style={{ 
              background: 'rgba(15, 23, 42, 0.65)', 
              border: '2px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: '100px', 
              padding: '10px 10px 10px 32px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 16, 
              maxWidth: 680, 
              margin: '0 auto', 
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)', 
              backdropFilter: 'blur(20px)',
              transition: 'all 0.3s ease' 
            }}
          >
            <div style={{ fontSize: '1.1rem', color: '#475569', flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Search size={18} />
              <span>What do you want to learn today?</span>
            </div>
            <button className="btn-primary" onClick={handleGetStarted}>
              Start Free Session <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Timeline Section */}
      <section style={{ padding: '140px 24px', background: '#090d1f', position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.04) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.8, pointerEvents: 'none' }}></div>
        
        <div style={{ textAlign: 'center', marginBottom: 120, position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: 20, letterSpacing: '-0.02em' }}>The Learning Path.</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: 600, margin: '0 auto', lineHeight: '1.6' }}>
            A structured path designed to ensure maximum knowledge retention.
          </p>
        </div>

        <div style={{ maxWidth: 1050, margin: '0 auto', position: 'relative' }}>
          {/* Timeline Center Line */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, borderLeft: '2px dashed rgba(99, 102, 241, 0.15)', transform: 'translateX(-50%)', zIndex: 0 }}></div>

          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }} 
            transition={{ duration: 0.8 }} 
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', marginBottom: '160px', position: 'relative', zIndex: 5 }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: 64, height: 64, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, marginLeft: 'auto', color: '#818cf8', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.15)' }}>
                <BrainCircuit size={32} />
              </div>
              <h3 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: 20, color: '#fff' }}>Personal AI Mentor</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '1.1rem' }}>
                Stop getting stuck. Our Socratic AI guides you through complex problems by asking the right questions, helping you build genuine, deep expertise.
              </p>
            </div>
            
            <div className="roadmap-img-container" style={{ position: 'relative', cursor: 'pointer' }}>
              <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200" alt="Mentor" className="roadmap-img" />
              <div style={{ position: 'absolute', top: '50%', left: -46, width: 14, height: 14, borderRadius: '50%', background: '#6366f1', border: '3px solid #090d1f', boxShadow: '0 0 0 6px rgba(99, 102, 241, 0.2)' }} />
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }} 
            transition={{ duration: 0.8 }} 
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', marginBottom: '160px', position: 'relative', zIndex: 5 }}
          >
            <div className="roadmap-img-container" style={{ position: 'relative', cursor: 'pointer' }}>
              <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200" alt="Syllabus" className="roadmap-img" />
              <div style={{ position: 'absolute', top: '50%', right: -46, width: 14, height: 14, borderRadius: '50%', background: '#a855f7', border: '3px solid #090d1f', boxShadow: '0 0 0 6px rgba(168, 85, 247, 0.2)' }} />
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', width: 64, height: 64, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, color: '#c084fc', boxShadow: '0 10px 20px rgba(168, 85, 247, 0.15)' }}>
                <BookOpen size={32} />
              </div>
              <h3 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: 20, color: '#fff' }}>Structured Roadmap</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '1.1rem' }}>
                Never lose your way. We organize your learning into a clear path of chapters, quizzes, and notes, optimized for your personal pace.
              </p>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }} 
            transition={{ duration: 0.8 }} 
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', position: 'relative', zIndex: 5 }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: 64, height: 64, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, marginLeft: 'auto', color: '#34d399', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.15)' }}>
                <Users size={32} />
              </div>
              <h3 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: 20, color: '#fff' }}>Collaborative IDE & Canvas</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '1.1rem' }}>
                Learn together in real-time. Join community channels, code with peers in our live IDE, and sketch/brainstorm on the collaborative whiteboard.
              </p>
            </div>
            
            <div className="roadmap-img-container" style={{ position: 'relative', cursor: 'pointer' }}>
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" alt="Community" className="roadmap-img" />
              <div style={{ position: 'absolute', top: '50%', left: -46, width: 14, height: 14, borderRadius: '50%', background: '#10b981', border: '3px solid #090d1f', boxShadow: '0 0 0 6px rgba(16, 185, 129, 0.2)' }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges section */}
      <section style={{ padding: '80px 24px', background: '#020617', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>
            <Shield size={20} color="#6366f1" />
            <span>Secure Encryption Guard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>
            <Star size={20} color="#f59e0b" />
            <span>Top Rated AI Tools</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>
            <Activity size={20} color="#10b981" />
            <span>99.9% Uptime SLA</span>
          </div>
        </div>
      </section>

      {/* COMPACT FOOTER */}
      <footer style={{ background: '#020617', padding: '80px 48px 40px', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.04)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 60 }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={18} />
              </div>
              <span className="logo-text">CortexCraft</span>
            </div>
            <p style={{ maxWidth: 320, lineHeight: 1.6, fontSize: '0.95rem', color: '#94a3b8' }}>
              The future of education is agentic. We provide the tools to master any subject through Socratic AI guidance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 80 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>Product</span>
              <a href="/dashboard" style={{ color: 'inherit', textDecoration: 'none', transition: '0.2s', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>Dashboard</a>
              <a href="/home" style={{ color: 'inherit', textDecoration: 'none', transition: '0.2s', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>Roadmap</a>
              <a href="/whiteboard" style={{ color: 'inherit', textDecoration: 'none', transition: '0.2s', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>Canvas</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>Connect</span>
              <a href="/community" style={{ color: 'inherit', textDecoration: 'none', transition: '0.2s', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>Community</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: '0.2s', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>Support</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: '0.2s', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'inherit'}>Privacy</a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '60px auto 0', padding: '30px 0 0', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'center', fontSize: '13px' }}>
          © 2026 CortexCraft AI. Crafted for the curious mind.
        </div>
      </footer>
    </div>
  );
};

export default Home;