import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // ← Opens the Dashboard with all 6 features
  const handleGetStarted = () => navigate("/dashboard");

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const stats = [
    { value: "24+", label: "Documents Processed", icon: "📄" },
    { value: "156+", label: "Questions Answered", icon: "💬" },
    { value: "42+", label: "Notes Generated", icon: "📝" },
    { value: "8+", label: "Notebooks Created", icon: "📚" },
  ];

  const steps = [
    { num: "01", title: "Upload", desc: "Drop your document — PDF, DOCX, TXT, or image" },
    { num: "02", title: "Process", desc: "AI extracts, indexes, and understands your content" },
    { num: "03", title: "Interact", desc: "Ask anything, get grounded answers instantly" },
    { num: "04", title: "Save", desc: "Build a living notebook that grows with you" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --void:#06030f;--deep:#0d0720;--ink:#130a2e;--mid:#1e0f45;--rich:#2d1672;--core:#5b21b6;--vivid:#7c3aed;--bright:#a855f7;--glow:#c084fc;--pale:#e9d5ff;--mist:#f5f3ff;--accent:#f0abfc; }
        body { background: var(--void); }
        .page { font-family:'DM Sans',sans-serif;background:var(--void);color:var(--pale);min-height:100vh;overflow-x:hidden; }
        .cursor-glow { position:fixed;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%);pointer-events:none;transform:translate(-50%,-50%);z-index:0;transition:left .15s ease,top .15s ease; }
        .noise { position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");pointer-events:none;z-index:1;opacity:0.5; }
        .nav { position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:20px 48px;background:rgba(6,3,15,0.7);backdrop-filter:blur(20px);border-bottom:1px solid rgba(124,58,237,0.15); }
        .nav-logo { font-family:'Syne',sans-serif;font-weight:800;font-size:1.25rem;letter-spacing:-0.02em;background:linear-gradient(135deg,var(--glow),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:flex;align-items:center;gap:10px; }
        .nav-logo-dot { width:8px;height:8px;background:var(--vivid);border-radius:50%;box-shadow:0 0 12px var(--vivid);animation:pulse-dot 2s ease-in-out infinite;-webkit-text-fill-color:initial; }
        @keyframes pulse-dot{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.4);opacity:0.7;}}
        .nav-links { display:flex;gap:32px;list-style:none; }
        .nav-links a { font-size:0.875rem;font-weight:500;color:rgba(233,213,255,0.6);text-decoration:none;letter-spacing:0.02em;transition:color .2s; }
        .nav-links a:hover { color:var(--pale); }
        .nav-cta { padding:10px 22px;background:var(--vivid);color:white;border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:0.875rem;font-weight:500;cursor:pointer;transition:all .2s;box-shadow:0 0 24px rgba(124,58,237,0.4); }
        .nav-cta:hover { background:var(--bright);box-shadow:0 0 36px rgba(168,85,247,0.5);transform:translateY(-1px); }
        .hero { position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:140px 24px 80px;z-index:2; }
        .hero-orbs { position:absolute;inset:0;pointer-events:none;overflow:hidden; }
        .orb { position:absolute;border-radius:50%;filter:blur(80px);animation:drift 12s ease-in-out infinite alternate; }
        .orb-1 { width:500px;height:500px;background:radial-gradient(circle,rgba(91,33,182,0.35),transparent 70%);top:-100px;left:-100px;animation-delay:0s; }
        .orb-2 { width:400px;height:400px;background:radial-gradient(circle,rgba(168,85,247,0.25),transparent 70%);top:20%;right:-80px;animation-delay:-4s; }
        .orb-3 { width:350px;height:350px;background:radial-gradient(circle,rgba(192,132,252,0.2),transparent 70%);bottom:0;left:30%;animation-delay:-8s; }
        @keyframes drift{from{transform:translate(0,0) scale(1);}to{transform:translate(40px,30px) scale(1.1);}}
        .hero-badge { display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border:1px solid rgba(168,85,247,0.3);border-radius:100px;background:rgba(45,22,114,0.4);font-size:0.75rem;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:var(--glow);margin-bottom:32px;backdrop-filter:blur(8px); }
        .hero-badge-dot { width:6px;height:6px;background:var(--accent);border-radius:50%;box-shadow:0 0 8px var(--accent); }
        .hero-title { font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(2.8rem,7vw,5.5rem);line-height:1.0;letter-spacing:-0.04em;margin-bottom:8px; }
        .hero-title-line1 { display:block;color:var(--mist); }
        .hero-title-line2 { display:block;background:linear-gradient(135deg,var(--bright) 0%,var(--accent) 50%,var(--glow) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 40px rgba(168,85,247,0.4)); }
        .hero-sub { font-size:1.15rem;color:rgba(233,213,255,0.55);font-weight:300;max-width:520px;line-height:1.7;margin:24px auto 48px; }
        .hero-actions { display:flex;gap:16px;align-items:center;justify-content:center;flex-wrap:wrap; }
        .btn-primary { position:relative;padding:16px 36px;background:linear-gradient(135deg,var(--vivid),var(--bright));color:white;border:none;border-radius:12px;font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;overflow:hidden;transition:all .3s;box-shadow:0 0 40px rgba(124,58,237,0.5),0 4px 20px rgba(0,0,0,0.4); }
        .btn-primary:hover { transform:translateY(-3px);box-shadow:0 0 60px rgba(168,85,247,0.6),0 8px 30px rgba(0,0,0,0.5); }
        .btn-secondary { padding:16px 36px;background:transparent;color:var(--pale);border:1px solid rgba(168,85,247,0.35);border-radius:12px;font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:500;cursor:pointer;transition:all .3s;backdrop-filter:blur(8px); }
        .btn-secondary:hover { border-color:rgba(168,85,247,0.7);background:rgba(45,22,114,0.3);transform:translateY(-2px); }
        .scroll-hint { position:absolute;bottom:40px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;color:rgba(233,213,255,0.3);font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;animation:bounce 2s ease-in-out infinite; }
        @keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(8px);}}
        .grid-lines { position:absolute;inset:0;background-image:linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;mask-image:radial-gradient(ellipse 80% 60% at 50% 50%,black 40%,transparent 100%); }
        .section { position:relative;z-index:2;max-width:1200px;margin:0 auto;padding:80px 24px; }
        .section-tag { display:inline-block;font-size:0.7rem;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:var(--vivid);margin-bottom:16px; }
        .section-title { font-family:'Syne',sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;letter-spacing:-0.03em;color:var(--mist);margin-bottom:16px; }
        .section-sub { font-size:1rem;color:rgba(233,213,255,0.45);max-width:480px;line-height:1.7; }
        .features-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:56px; }
        @media(max-width:900px){.features-grid{grid-template-columns:1fr;}}
        .feature-card { position:relative;padding:36px 32px;background:rgba(13,7,32,0.8);border:1px solid rgba(91,33,182,0.2);border-radius:20px;overflow:hidden;transition:all .4s;backdrop-filter:blur(20px); }
        .feature-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,58,237,0.08),transparent 60%);opacity:0;transition:opacity .4s;}
        .feature-card::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(168,85,247,0.5),transparent);transform:scaleX(0);transition:transform .4s;}
        .feature-card:hover{border-color:rgba(168,85,247,0.4);transform:translateY(-6px);box-shadow:0 20px 60px rgba(91,33,182,0.25);}
        .feature-card:hover::before{opacity:1;}.feature-card:hover::after{transform:scaleX(1);}
        .card-icon{width:52px;height:52px;background:linear-gradient(135deg,rgba(91,33,182,0.5),rgba(168,85,237,0.2));border:1px solid rgba(168,85,247,0.25);border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:24px;transition:all .3s;}
        .feature-card:hover .card-icon{background:linear-gradient(135deg,var(--vivid),var(--bright));border-color:transparent;box-shadow:0 0 24px rgba(124,58,237,0.5);}
        .card-icon svg{width:24px;height:24px;color:var(--glow);transition:color .3s;}.feature-card:hover .card-icon svg{color:white;}
        .card-num{position:absolute;top:28px;right:28px;font-family:'Syne',sans-serif;font-size:3.5rem;font-weight:800;color:rgba(91,33,182,0.12);line-height:1;transition:color .3s;}
        .feature-card:hover .card-num{color:rgba(168,85,247,0.15);}
        .card-title{font-family:'Syne',sans-serif;font-size:1.15rem;font-weight:700;color:var(--pale);margin-bottom:10px;letter-spacing:-0.01em;}
        .card-desc{font-size:0.9rem;color:rgba(233,213,255,0.45);line-height:1.65;}
        .stats-wrapper{position:relative;z-index:2;margin:0 24px;}
        .stats-inner{max-width:1200px;margin:0 auto;background:linear-gradient(135deg,rgba(45,22,114,0.6) 0%,rgba(19,10,46,0.9) 100%);border:1px solid rgba(124,58,237,0.2);border-radius:28px;padding:64px 48px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px;backdrop-filter:blur(30px);overflow:hidden;position:relative;}
        .stats-inner::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(168,85,247,0.5),rgba(240,171,252,0.3),transparent);}
        @media(max-width:700px){.stats-inner{grid-template-columns:repeat(2,1fr);}}
        .stat-item{text-align:center;padding:16px;}.stat-emoji{font-size:2rem;display:block;margin-bottom:12px;filter:drop-shadow(0 0 8px rgba(168,85,247,0.5));}
        .stat-value{font-family:'Syne',sans-serif;font-size:2.8rem;font-weight:800;letter-spacing:-0.04em;background:linear-gradient(135deg,var(--pale),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;margin-bottom:8px;}
        .stat-label{font-size:0.8rem;font-weight:500;color:rgba(233,213,255,0.4);letter-spacing:0.05em;text-transform:uppercase;}
        .steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:64px;position:relative;}
        .steps-grid::before{content:'';position:absolute;top:28px;left:12.5%;right:12.5%;height:1px;background:linear-gradient(90deg,transparent,rgba(124,58,237,0.4),rgba(168,85,247,0.6),rgba(124,58,237,0.4),transparent);}
        @media(max-width:700px){.steps-grid{grid-template-columns:repeat(2,1fr);}.steps-grid::before{display:none;}}
        .step-item{text-align:center;padding:0 16px;position:relative;}
        .step-circle{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--rich),var(--mid));border:1px solid rgba(168,85,247,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;transition:all .3s;box-shadow:0 0 0 8px rgba(91,33,182,0.08);}
        .step-item:hover .step-circle{background:linear-gradient(135deg,var(--vivid),var(--bright));border-color:transparent;box-shadow:0 0 0 8px rgba(124,58,237,0.12),0 0 32px rgba(124,58,237,0.4);transform:scale(1.1);}
        .step-num{font-family:'Syne',sans-serif;font-size:0.85rem;font-weight:800;color:var(--glow);letter-spacing:0.05em;}
        .step-title{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;color:var(--pale);margin-bottom:8px;}
        .step-desc{font-size:0.83rem;color:rgba(233,213,255,0.4);line-height:1.6;}
        .cta-section{position:relative;z-index:2;padding:80px 24px 120px;text-align:center;}
        .cta-card{max-width:800px;margin:0 auto;padding:80px 48px;background:linear-gradient(135deg,rgba(45,22,114,0.5),rgba(13,7,32,0.8));border:1px solid rgba(124,58,237,0.25);border-radius:32px;position:relative;overflow:hidden;backdrop-filter:blur(30px);}
        .cta-card::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse 60% 50% at 50% 0%,rgba(124,58,237,0.2),transparent 70%);pointer-events:none;}
        .cta-title{font-family:'Syne',sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;letter-spacing:-0.03em;color:var(--mist);margin-bottom:16px;position:relative;}
        .cta-sub{color:rgba(233,213,255,0.45);font-size:1rem;line-height:1.7;max-width:400px;margin:0 auto 40px;position:relative;}
        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(91,33,182,0.2),transparent);max-width:1200px;margin:0 auto;}
        .footer{position:relative;z-index:2;border-top:1px solid rgba(91,33,182,0.15);padding:32px 48px;display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto;}
        .footer-copy{font-size:0.8rem;color:rgba(233,213,255,0.25);}
        .particles{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
        .particle{position:absolute;width:2px;height:2px;background:var(--vivid);border-radius:50%;animation:float-up linear infinite;opacity:0;}
        @keyframes float-up{0%{transform:translateY(100vh) scale(0);opacity:0;}10%{opacity:0.6;}90%{opacity:0.2;}100%{transform:translateY(-20px) scale(1.5);opacity:0;}}
      `}</style>

      <div className="page">
        <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />
        <div className="noise" />
        <div className="particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="particle" style={{ left: `${(i * 8.3) % 100}%`, animationDuration: `${8 + (i * 1.3) % 6}s`, animationDelay: `${(i * 0.7) % 5}s`, background: i % 2 === 0 ? '#7c3aed' : '#c084fc' }} />
          ))}
        </div>

        <nav className="nav">
          <div className="nav-logo"><div className="nav-logo-dot" />InteglienceAI</div>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#stats">Stats</a></li>
          </ul>
          <button className="nav-cta" onClick={handleGetStarted}>Open App →</button>
        </nav>

        <section className="hero" ref={heroRef}>
          <div className="grid-lines" />
          <div className="hero-orbs">
            <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
          </div>
          <div className="hero-badge"><span className="hero-badge-dot" />Powered by advanced LLM reasoning</div>
          <h1 className="hero-title">
            <span className="hero-title-line1">Your documents,</span>
            <span className="hero-title-line2">made intelligent.</span>
          </h1>
          <p className="hero-sub">Upload any document and unlock AI-powered summaries, instant Q&A, and structured notebooks — all from a single interface.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleGetStarted}>Get Started Free</button>
            <button className="btn-secondary">Watch demo ↗</button>
          </div>
          <div className="scroll-hint">
            <span>scroll</span>
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none"><path d="M7 1v18M1 13l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </section>

        <section className="section" id="features">
          <div>
            <span className="section-tag">✦ capabilities</span>
            <h2 className="section-title">Everything you need,<br />nothing you don't.</h2>
            <p className="section-sub">Three core pillars that turn passive documents into active knowledge.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>, num:"01", title:"Upload Documents", desc:"Support for PDF, DOCX, TXT, and images with automatic OCR text extraction." },
              { icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>, num:"02", title:"AI Analysis", desc:"Get intelligent summaries, structured notes, and context-aware answers from your content." },
              { icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>, num:"03", title:"Interactive Chat", desc:"Conversational Q&A grounded entirely in your documents. No hallucinations." },
            ].map((card, i) => (
              <div className="feature-card" key={i}>
                <div className="card-icon">{card.icon}</div>
                <span className="card-num">{card.num}</span>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-desc">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        <section className="section" id="stats" style={{ paddingBottom: 0 }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <span className="section-tag">✦ by the numbers</span>
            <h2 className="section-title">Proven in practice</h2>
          </div>
        </section>

        <div className="stats-wrapper" style={{ paddingBottom:80 }}>
          <div className="stats-inner">
            {stats.map((s, i) => (
              <div className="stat-item" key={i}>
                <span className="stat-emoji">{s.icon}</span>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        <section className="section" id="how">
          <div style={{ textAlign:'center' }}>
            <span className="section-tag">✦ process</span>
            <h2 className="section-title">Simple by design</h2>
            <p className="section-sub" style={{ margin:'0 auto' }}>Four steps. Zero friction. Immediate value.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div className="step-item" key={i}>
                <div className="step-circle"><span className="step-num">{step.num}</span></div>
                <h4 className="step-title">{step.title}</h4>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-card">
            <h2 className="cta-title">Ready to transform<br />your documents?</h2>
            <p className="cta-sub">Start for free. No credit card needed. Your knowledge, unlocked.</p>
            <div className="hero-actions" style={{ position:'relative' }}>
              <button className="btn-primary" onClick={handleGetStarted} style={{ fontSize:'1.05rem', padding:'18px 44px' }}>
                Start Now — It's Free
              </button>
            </div>
          </div>
        </section>

        <div className="divider" />
        <footer style={{ paddingBottom:40 }}>
          <div className="footer">
            <div className="nav-logo" style={{ fontSize:'1rem' }}><div className="nav-logo-dot" />AI-LLM Notebook</div>
            <p className="footer-copy">© 2025 AI-LLM Notebook. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;