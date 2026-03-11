import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const features = [
  {
    id: "summary",
    route: "/summary",
    num: "01",
    title: "Smart Summary",
    tagline: "Distill any document into crisp, structured text",
    desc: "AI reads your full document and produces a concise, structured summary — key points, themes, and takeaways in seconds.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h6M9 8h6M9 16h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>
      </svg>
    ),
    color: "#7c3aed",
    glow: "rgba(124,58,237,0.35)",
    badge: "Text",
  },
  {
    id: "mindmap",
    route: "/mindmap",
    num: "02",
    title: "Mind Map",
    tagline: "Visualise knowledge as an interactive graph",
    desc: "Transforms document concepts into a branching mind map — understand structure, connections, and hierarchy at a glance.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <circle cx="4" cy="6" r="2"/><line x1="6" y1="7" x2="10" y2="11"/>
        <circle cx="20" cy="6" r="2"/><line x1="18" y1="7" x2="14" y2="11"/>
        <circle cx="4" cy="18" r="2"/><line x1="6" y1="17" x2="10" y2="13"/>
        <circle cx="20" cy="18" r="2"/><line x1="18" y1="17" x2="14" y2="13"/>
        <circle cx="12" cy="3" r="2"/><line x1="12" y1="5" x2="12" y2="9"/>
      </svg>
    ),
    color: "#a855f7",
    glow: "rgba(168,85,247,0.35)",
    badge: "Visual",
  },
  {
    id: "flashcard",
    route: "/flashcards",
    num: "03",
    title: "Flash Cards",
    tagline: "Learn faster with AI-generated study cards",
    desc: "Auto-generates question/answer flashcards from your content. Flip, review, and retain information in spaced repetition style.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <path d="M2 10h20M8 5v14"/>
      </svg>
    ),
    color: "#c084fc",
    glow: "rgba(192,132,252,0.35)",
    badge: "Study",
  },
  {
    id: "chatbot",
    route: "/chatbot",
    num: "04",
    title: "AI Chatbot",
    tagline: "Converse with your document's knowledge",
    desc: "Ask anything. The chatbot answers using only your document's content — grounded, cited, and hallucination-free.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        <circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/>
      </svg>
    ),
    color: "#f0abfc",
    glow: "rgba(240,171,252,0.35)",
    badge: "Chat",
  },
  {
    id: "quiz",
    route: "/quiz",
    num: "05",
    title: "Quiz Mode",
    tagline: "Test your understanding with smart quizzes",
    desc: "Generates MCQ and short-answer quizzes from your document. Track your score and identify knowledge gaps instantly.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
    color: "#e879f9",
    glow: "rgba(232,121,249,0.35)",
    badge: "Test",
  },
  {
    id: "interview",
    route: "/interview",
    num: "06",
    title: "Interview Prep",
    tagline: "Ace interviews with topic-specific questions",
    desc: "Extracts likely interview questions from your document. Practice answers and build confidence with AI-curated prep sets.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
    color: "#d8b4fe",
    glow: "rgba(216,180,254,0.35)",
    badge: "Career",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --void: #06030f;
          --deep: #0d0720;
          --ink: #130a2e;
          --mid: #1e0f45;
          --rich: #2d1672;
          --core: #5b21b6;
          --vivid: #7c3aed;
          --bright: #a855f7;
          --glow: #c084fc;
          --pale: #e9d5ff;
          --mist: #f5f3ff;
          --accent: #f0abfc;
        }

        .db-page {
          font-family: 'DM Sans', sans-serif;
          background: var(--void);
          min-height: 100vh;
          color: var(--pale);
          overflow-x: hidden;
          position: relative;
        }

        /* Noise */
        .db-noise {
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0; opacity: 0.4;
        }

        /* Orbs */
        .db-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }
        .db-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(91,33,182,0.18), transparent 70%); top: -150px; left: -150px; animation: orb-drift 16s ease-in-out infinite alternate; }
        .db-orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%); bottom: 0; right: -100px; animation: orb-drift 20s ease-in-out infinite alternate-reverse; }
        @keyframes orb-drift { from { transform: translate(0,0); } to { transform: translate(30px,40px); } }

        /* Nav */
        .db-nav {
          position: sticky; top: 0;
          z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 48px;
          background: rgba(6,3,15,0.8);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(124,58,237,0.12);
        }

        .db-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, var(--glow), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: flex; align-items: center; gap: 10px;
          cursor: pointer;
        }

        .db-logo-dot {
          width: 7px; height: 7px;
          background: var(--vivid);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--vivid);
          -webkit-text-fill-color: initial;
          flex-shrink: 0;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%,100% { transform: scale(1); opacity:1; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }

        .db-nav-right {
          display: flex; align-items: center; gap: 12px;
        }

        .db-nav-pill {
          padding: 6px 14px;
          border: 1px solid rgba(124,58,237,0.25);
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(233,213,255,0.5);
          background: rgba(45,22,114,0.2);
          backdrop-filter: blur(8px);
        }

        .db-nav-back {
          padding: 8px 18px;
          background: transparent;
          border: 1px solid rgba(168,85,247,0.3);
          border-radius: 8px;
          color: var(--pale);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .db-nav-back:hover { background: rgba(45,22,114,0.4); border-color: rgba(168,85,247,0.6); }

        /* Header */
        .db-header {
          position: relative; z-index: 2;
          padding: 60px 48px 40px;
          max-width: 1280px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .db-header.in { opacity: 1; transform: translateY(0); }

        .db-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--vivid);
          margin-bottom: 16px;
        }

        .db-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--mist);
          line-height: 1.05;
          margin-bottom: 12px;
        }

        .db-title span {
          background: linear-gradient(135deg, var(--bright), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .db-subtitle {
          font-size: 1rem;
          color: rgba(233,213,255,0.4);
          font-weight: 300;
          max-width: 480px;
          line-height: 1.65;
        }

        /* Stats bar */
        .db-statsbar {
          position: relative; z-index: 2;
          max-width: 1280px;
          margin: 0 auto 48px;
          padding: 0 48px;
          display: flex; gap: 24px; flex-wrap: wrap;
          opacity: 0; transform: translateY(16px);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s;
        }
        .db-statsbar.in { opacity: 1; transform: translateY(0); }

        .db-stat-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 18px;
          background: rgba(13,7,32,0.7);
          border: 1px solid rgba(91,33,182,0.2);
          border-radius: 100px;
          backdrop-filter: blur(12px);
        }

        .db-stat-chip-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--vivid);
          box-shadow: 0 0 8px var(--vivid);
        }

        .db-stat-chip span:first-of-type {
          font-family: 'Syne', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--pale);
        }

        .db-stat-chip span:last-of-type {
          font-size: 0.75rem;
          color: rgba(233,213,255,0.35);
        }

        /* Grid */
        .db-grid {
          position: relative; z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 48px 80px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 1100px) { .db-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .db-grid { grid-template-columns: 1fr; padding: 0 20px 60px; } .db-header,.db-statsbar { padding: 40px 20px 20px; } .db-nav { padding: 16px 20px; } }

        /* Feature card */
        .feat-card {
          position: relative;
          background: rgba(13,7,32,0.75);
          border: 1px solid rgba(91,33,182,0.18);
          border-radius: 24px;
          padding: 36px 32px 32px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          opacity: 0;
          transform: translateY(30px);
          backdrop-filter: blur(20px);
        }

        .feat-card.in {
          opacity: 1;
          transform: translateY(0);
        }

        .feat-card:hover {
          transform: translateY(-8px) scale(1.01);
          border-color: rgba(168,85,247,0.35);
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
        }

        /* Card glow spot */
        .feat-card-glow {
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.4s;
          pointer-events: none;
        }
        .feat-card:hover .feat-card-glow { opacity: 1; }

        /* Top shimmer line */
        .feat-card::after {
          content: '';
          position: absolute; top: 0; left: 10%; right: 10%;
          height: 1px;
          border-radius: 1px;
          opacity: 0;
          transition: opacity 0.4s;
        }
        .feat-card:hover::after { opacity: 1; }

        /* Background pattern */
        .feat-card-bg {
          position: absolute; inset: 0;
          opacity: 0;
          transition: opacity 0.4s;
          pointer-events: none;
          background-image: radial-gradient(circle at 80% 20%, var(--card-color-faint, rgba(124,58,237,0.06)), transparent 60%);
        }
        .feat-card:hover .feat-card-bg { opacity: 1; }

        /* Card top row */
        .feat-top {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 28px;
        }

        .feat-icon-wrap {
          width: 54px; height: 54px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s;
          position: relative;
          flex-shrink: 0;
        }

        .feat-icon-wrap svg { width: 24px; height: 24px; transition: all 0.3s; }

        .feat-badge {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
          border: 1px solid;
          transition: all 0.3s;
        }

        .feat-num {
          position: absolute; bottom: 28px; right: 28px;
          font-family: 'Syne', sans-serif;
          font-size: 4rem;
          font-weight: 800;
          line-height: 1;
          opacity: 0.07;
          transition: opacity 0.3s;
          pointer-events: none;
          color: white;
        }
        .feat-card:hover .feat-num { opacity: 0.1; }

        .feat-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--mist);
          margin-bottom: 6px;
          transition: color 0.3s;
        }

        .feat-tagline {
          font-size: 0.78rem;
          font-weight: 500;
          margin-bottom: 14px;
          transition: color 0.3s;
        }

        .feat-desc {
          font-size: 0.875rem;
          color: rgba(233,213,255,0.38);
          line-height: 1.65;
          margin-bottom: 32px;
        }

        /* CTA button */
        .feat-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 12px 22px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .feat-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: rgba(255,255,255,0.08);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .feat-btn:hover::before { opacity: 1; }

        .feat-btn svg {
          width: 16px; height: 16px;
          transition: transform 0.25s;
          flex-shrink: 0;
        }
        .feat-btn:hover svg { transform: translateX(4px); }

        /* Divider line between num and content */
        .feat-divider {
          height: 1px;
          margin-bottom: 20px;
          border-radius: 1px;
          transition: opacity 0.3s;
          opacity: 0.15;
        }
        .feat-card:hover .feat-divider { opacity: 0.3; }
      `}</style>

      <div className="db-page">
        <div className="db-noise" />
        <div className="db-orb db-orb-1" />
        <div className="db-orb db-orb-2" />

        {/* Nav */}
        <nav className="db-nav">
          <div className="db-logo" onClick={() => navigate("/")}>
            <div className="db-logo-dot" />
            AI-LLM Notebook
          </div>
          <div className="db-nav-right">
            <div className="db-nav-pill">📄 Notebook Active</div>
            <button className="db-nav-back" onClick={() => navigate("/")}>← Home</button>
          </div>
        </nav>

        {/* Header */}
        <div className={`db-header ${loaded ? "in" : ""}`}>
          <div className="db-eyebrow">✦ your workspace</div>
          <h1 className="db-title">
            Choose your<br />
            <span>AI feature</span>
          </h1>
          <p className="db-subtitle">
            Six intelligent tools built around your document. Pick one to get started — each unlocks a different way to learn.
          </p>
        </div>

        {/* Stats bar */}
        <div className={`db-statsbar ${loaded ? "in" : ""}`}>
          {[
            { val: "6", label: "Features Available" },
            { val: "100%", label: "Document-Grounded" },
            { val: "AI", label: "Powered by LLM" },
          ].map((s, i) => (
            <div className="db-stat-chip" key={i}>
              <div className="db-stat-chip-dot" style={{ background: ["#7c3aed","#a855f7","#c084fc"][i], boxShadow: `0 0 8px ${["#7c3aed","#a855f7","#c084fc"][i]}` }} />
              <span>{s.val}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="db-grid">
          {features.map((f, i) => (
            <div
              key={f.id}
              className={`feat-card ${loaded ? "in" : ""}`}
              style={{
                transitionDelay: loaded ? `${0.15 + i * 0.07}s` : "0s",
              }}
              onMouseEnter={() => setHovered(f.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate(f.route)}
            >
              {/* Glow spot */}
              <div
                className="feat-card-glow"
                style={{ background: `radial-gradient(circle, ${f.glow}, transparent 70%)` }}
              />
              {/* BG tint */}
              <div
                className="feat-card-bg"
                style={{ "--card-color-faint": f.glow.replace("0.35","0.08") }}
              />
              {/* Top shimmer */}
              <style>{`.feat-card:nth-child(${i+1})::after { background: linear-gradient(90deg, transparent, ${f.color}, transparent); }`}</style>

              <div className="feat-top">
                {/* Icon */}
                <div
                  className="feat-icon-wrap"
                  style={{
                    background: hovered === f.id
                      ? `linear-gradient(135deg, ${f.color}, ${f.color}bb)`
                      : `rgba(${hexToRgb(f.color)}, 0.15)`,
                    border: `1px solid ${hovered === f.id ? "transparent" : `${f.color}44`}`,
                    boxShadow: hovered === f.id ? `0 0 24px ${f.glow}` : "none",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24" fill="none" stroke={hovered === f.id ? "white" : f.color}
                    strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                    style={{ width: 22, height: 22 }}
                  >
                    {f.icon.props.children}
                  </svg>
                </div>

                {/* Badge */}
                <span
                  className="feat-badge"
                  style={{
                    color: f.color,
                    borderColor: `${f.color}44`,
                    background: `${f.color}14`,
                  }}
                >
                  {f.badge}
                </span>
              </div>

              {/* Divider */}
              <div className="feat-divider" style={{ background: f.color }} />

              <h3 className="feat-title">{f.title}</h3>
              <p className="feat-tagline" style={{ color: `${f.color}cc` }}>{f.tagline}</p>
              <p className="feat-desc">{f.desc}</p>

              {/* CTA */}
              <button
                className="feat-btn"
                style={{
                  background: hovered === f.id
                    ? `linear-gradient(135deg, ${f.color}, ${f.color}bb)`
                    : `${f.color}1a`,
                  color: hovered === f.id ? "white" : f.color,
                  boxShadow: hovered === f.id ? `0 4px 20px ${f.glow}` : "none",
                }}
                onClick={(e) => { e.stopPropagation(); navigate(f.route); }}
              >
                Open {f.title}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </button>

              {/* Ghost number */}
              <div className="feat-num">{f.num}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Helper to convert hex to rgb string for CSS
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

export default Dashboard;