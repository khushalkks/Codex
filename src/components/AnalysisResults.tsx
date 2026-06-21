import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  FileText,
  Lightbulb,
  Award,
  BookOpen,
  RefreshCw 
} from 'lucide-react';

interface AnalysisResultsProps {
  data?: any;
  results?: any;
  onReset?: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data, results, onReset }) => {
  const analysis = data || results;

  if (!analysis) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '24px',
        padding: '32px',
        textAlign: 'center',
        marginTop: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: '#64748b' }}>
          <AlertCircle size={48} color="#ef4444" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>No analysis results available yet.</h3>
          <p style={{ fontSize: '0.95rem' }}>Please upload a resume first to generate results.</p>
          {onReset && (
            <button 
              onClick={onReset}
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
              }}
            >
              <RefreshCw size={16} /> Go Back to Upload
            </button>
          )}
        </div>
      </div>
    );
  }

  const score = analysis.score || 0;
  const fileName = analysis.fileName || 'document.pdf';
  const strengths = analysis.strengths || [];
  const weaknesses = analysis.weaknesses || [];
  const suggestions = analysis.suggestions || [];
  const matchedSkills = analysis.matched_skills || [];
  const missingSkills = analysis.missing_skills || [];

  // Determine score color
  const getScoreColor = (val: number) => {
    if (val >= 80) return '#10b981'; // Green
    if (val >= 60) return '#f59e0b'; // Yellow/Orange
    return '#ef4444'; // Red
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
      
      {/* Overview Card */}
      <div className="glass-box" style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>ATS Analysis Summary</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>File: <strong style={{ color: '#475569' }}>{fileName}</strong></p>
          </div>
        </div>

        {/* Score Ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* SVG Progress Circle */}
            <svg style={{ transform: 'rotate(-90deg)', width: '90px', height: '90px' }}>
              <circle cx="45" cy="45" r="38" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
              <circle 
                cx="45" 
                cy="45" 
                r="38" 
                stroke={getScoreColor(score)} 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - score / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span>{score}</span>
              <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '-2px' }}>Score</span>
            </div>
          </div>
          
          <div>
            <div style={{ 
              background: score >= 80 ? 'rgba(16, 185, 129, 0.1)' : score >= 60 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              color: getScoreColor(score),
              padding: '6px 16px',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'inline-block',
              marginBottom: '4px'
            }}>
              {score >= 80 ? 'Good Fit' : score >= 60 ? 'Needs Improvement' : 'Critical Gaps'}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Optimized against ATS filters.</p>
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Strengths Card */}
        <div className="glass-box" style={{
          background: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <CheckCircle2 color="#10b981" size={22} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Key Strengths</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {strengths.map((str: string, index: number) => (
              <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#475569', lineHeight: '1.5' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '-2px' }}>✓</span>
                <span>{str}</span>
              </li>
            ))}
            {strengths.length === 0 && (
              <li style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>No strengths highlighted.</li>
            )}
          </ul>
        </div>

        {/* Weaknesses Card */}
        <div className="glass-box" style={{
          background: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <AlertTriangle color="#f59e0b" size={22} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Areas of Concern</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {weaknesses.map((weak: string, index: number) => (
              <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#475569', lineHeight: '1.5' }}>
                <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '-2px' }}>⚠</span>
                <span>{weak}</span>
              </li>
            ))}
            {weaknesses.length === 0 && (
              <li style={{ color: '#10b981', fontStyle: 'italic', fontSize: '0.9rem' }}>No significant weaknesses found!</li>
            )}
          </ul>
        </div>

      </div>

      {/* Skills Analysis */}
      <div className="glass-box" style={{
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <Award color="#4f46e5" size={22} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Skills Matcher</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Matched Skills */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Matched Hard Skills ({matchedSkills.length})
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {matchedSkills.map((skill: string, index: number) => (
                <span key={index} style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#065f46',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}>
                  {skill}
                </span>
              ))}
              {matchedSkills.length === 0 && (
                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>No skills recognized.</span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Recommended/Missing Skills ({missingSkills.length})
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {missingSkills.map((skill: string, index: number) => (
                <span key={index} style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  color: '#991b1b',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}>
                  + {skill}
                </span>
              ))}
              {missingSkills.length === 0 && (
                <span style={{ color: '#10b981', fontStyle: 'italic', fontSize: '0.85rem' }}>All standard role-based skills found!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Suggestions */}
      <div className="glass-box" style={{
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <Lightbulb color="#0ea5e9" size={22} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Actionable Suggestions</h3>
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {suggestions.map((sug: string, index: number) => (
            <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.92rem', color: '#475569', lineHeight: '1.6' }}>
              <div style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', minWidth: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                {index + 1}
              </div>
              <span style={{ marginTop: '2px' }}>{sug}</span>
            </li>
          ))}
          {suggestions.length === 0 && (
            <li style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>No suggestions generated.</li>
          )}
        </ul>
      </div>

      {/* Reset button at bottom */}
      {onReset && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
          <button 
            onClick={onReset}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              color: '#4f46e5',
              padding: '14px 28px',
              borderRadius: '16px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#4f46e5';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.color = '#4f46e5';
            }}
          >
            <RefreshCw size={18} /> Analyze Another Resume
          </button>
        </div>
      )}

    </div>
  );
};
