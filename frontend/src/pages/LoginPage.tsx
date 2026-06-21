import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  BrainCircuit, 
  Zap, 
  CheckCircle2,
  Lock,
  Globe,
  Stars,
  User
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const emailTrim = email.trim();
    const nameTrim = name.trim();

    if (!emailTrim || !password) {
      setError("Email and Password are required.");
      setLoading(false);
      return;
    }

    if (isSignUp) {
      if (!nameTrim) {
        setError("Please enter your name.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setLoading(false);
        return;
      }

      // Register API Call
      try {
        const res = await fetch("http://localhost:8000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: nameTrim, email: emailTrim, password }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.detail || "Registration failed.");
        }
        
        setSuccess("Registration successful! You can now log in.");
        setIsSignUp(false); // Switch to login mode
        setPassword("");
        setConfirmPassword("");
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    } else {
      // Login API Call
      try {
        const res = await fetch("http://localhost:8000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailTrim, password }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.detail || "Invalid email or password.");
        }
        
        // Save user token and profile info
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect to homepage
        window.location.href = '/home';
      } catch (err: any) {
        setError(err.message || "Invalid credentials. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#020617', 
      display: 'flex', 
      fontFamily: "'Inter', sans-serif",
      color: '#fff',
      overflow: 'hidden'
    }}>
      
      {/* Left Side: Visual Experience */}
      <div style={{ 
        flex: 1.2, 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '60px',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 20% 30%, rgba(79, 70, 229, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '600px' }}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)', padding: '8px 16px', borderRadius: '100px', marginBottom: '24px', color: '#818cf8', fontWeight: 600, fontSize: '0.85rem' }}>
              <Stars size={16} /> Elite Learning Ecosystem
            </div>
            <h1 style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '24px' }}>
              Master any subject with <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CortexCraft.</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '48px', maxWidth: '500px' }}>
              Step into the future of education. Your personal AI-powered notebook that thinks, plans, and guides you to mastery.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { icon: <BrainCircuit size={20} />, title: "Socratic Guidance", color: "#6366f1" },
              { icon: <Zap size={20} />, title: "Instant Mastery", color: "#f59e0b" },
              { icon: <Globe size={20} />, title: "Global Network", color: "#10b981" },
              { icon: <CheckCircle2 size={20} />, title: "Verified Logic", color: "#ec4899" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', backdropFilter: 'blur(10px)' }}
              >
                <div style={{ color: item.color }}>{item.icon}</div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.title}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Decorative Floating Card */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [2, -2, 2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '15%', right: '5%', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', width: '220px' }}
        >
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }}></div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }}></div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 8 }}>AI Strategy Active...</div>
          <div style={{ height: 4, background: '#334155', borderRadius: 2, marginBottom: 8 }}>
            <motion.div animate={{ width: ['0%', '70%', '40%', '90%'] }} transition={{ duration: 4, repeat: Infinity }} style={{ height: '100%', background: '#6366f1', borderRadius: 2 }}></motion.div>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Optimizing roadmap...</div>
        </motion.div>
      </div>

      {/* Right Side: Authentication Form */}
      <div style={{ 
        flex: 0.8, 
        background: '#0a0f1e', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        position: 'relative'
      }}>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', background: '#4F46E5', color: '#fff', width: 56, height: 56, borderRadius: '16px', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)' }}>
              <GraduationCap size={28} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={{ color: '#64748b' }}>
              {isSignUp ? 'Register to start your personalized roadmap.' : 'Enter your credentials to access your workspace.'}
            </p>
          </div>

          <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '20px' }}>
            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}
            
            {success && (
              <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
                ✓ {success}
              </div>
            )}

            {isSignUp && (
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', marginLeft: '4px' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} size={18} />
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 14px 14px 48px', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: '0.3s' }}
                  />
                </div>
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', marginLeft: '4px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} size={18} />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 14px 14px 48px', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: '0.3s' }}
                />
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', marginLeft: '4px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 14px 14px 48px', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: '0.3s' }}
                />
              </div>
            </div>

            {isSignUp && (
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', marginLeft: '4px' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 14px 14px 48px', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: '0.3s' }}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              style={{ 
                background: '#fff', 
                color: '#020617', 
                border: 'none', 
                padding: '16px', 
                borderRadius: '12px', 
                fontSize: '1rem', 
                fontWeight: 700, 
                cursor: loading ? 'not-allowed' : 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 12,
                marginTop: '12px',
                transition: '0.3s'
              }}
              onMouseOver={e => !loading && (e.currentTarget.style.background = '#e2e8f0')}
              onMouseOut={e => !loading && (e.currentTarget.style.background = '#fff')}
            >
              {loading ? (
                <div style={{ width: 20, height: 20, border: '3px solid #020617', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>{isSignUp ? 'Sign up for Free' : 'Sign in to Account'} <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '0.9rem', color: '#64748b' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "} 
            <span 
              onClick={toggleMode}
              style={{ color: '#818cf8', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isSignUp ? 'Sign in' : 'Sign up for free'}
            </span>
          </p>
        </motion.div>

        {/* Bottom Badge */}
        <div style={{ position: 'absolute', bottom: '30px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155', fontSize: '0.75rem', fontWeight: 600 }}>
            <ShieldCheck size={14} /> AES-256 Encryption
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155', fontSize: '0.75rem', fontWeight: 600 }}>
            <Sparkles size={14} /> AI Trust Verified
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #4f46e5 !important; background: rgba(255,255,255,0.05) !important; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
      `}</style>
    </div>
  );
}
