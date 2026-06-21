import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Send,
  Paperclip,
  ChevronLeft,
  FileText,
  Check,
  MoreVertical,
  User,
  Bot,
  Sparkles,
  LayoutGrid,
  X,
  History,
  Plus,
  BrainCircuit,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CHAT_API = "http://127.0.0.1:8000/api/chat";
const CONTEXT_UPLOAD_API = "http://127.0.0.1:8000/api/chat/context-upload";

const formatTime = (ts: number) =>
  new Date(ts).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" });

const truncate = (s: string, n = 40) => s.length > n ? s.slice(0, n) + "…" : s;

export default function ChatbotPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I'm your AI context assistant. Upload a document or select one from the sidebar, and I'll answer questions specifically based on that content.", ts: Date.now() }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);
  const [activeSourceIds, setActiveSourceIds] = useState(new Set<string>());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(CONTEXT_UPLOAD_API, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const raw = data.summary || data.text || "";
      let title = file.name.replace(/\.[^.]+$/, "");

      const entry = { id: Date.now().toString(), title, fileName: file.name, summary: raw, date: Date.now() };
      setSources(p => [entry, ...p]);
      setActiveSourceIds(p => new Set([...p, entry.id]));
      setMessages(p => [...p, {
        role: "assistant",
        text: `Successfully analyzed "${entry.title}". I'm now grounded in this context!`,
        ts: Date.now()
      }]);
    } catch (err: any) {
      setMessages(p => [...p, { role: "assistant", text: `Upload error: ${err.message}`, ts: Date.now() }]);
    } finally { setUploading(false); }
  };

  const toggleSource = (id: string) => {
    setActiveSourceIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const buildContext = () => {
    const selected = sources.filter(s => activeSourceIds.has(s.id));
    if (!selected.length) return "";
    return selected
      .slice(0, 3)
      .map(s => `=== DOCUMENT CONTENT: ${s.title} ===\n${s.summary}`)
      .join("\n\n");
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setMessages(p => [...p, { role: "user", text, ts: Date.now() }]);
    setInput("");
    setSending(true);
    if (textareaRef.current) textareaRef.current.style.height = "48px";
    try {
      const res = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ message: text, context: buildContext() }),
      });
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      const reply = data.reply || data.answer || data.response || data.text;
      setMessages(p => [...p, { role: "assistant", text: reply, ts: Date.now() }]);
    } catch (err: any) {
      setMessages(p => [...p, {
        role: "assistant",
        text: `Sorry, I encountered an error: ${err.message}. Please check your backend connection.`,
        ts: Date.now()
      }]);
    } finally { setSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "48px";
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px";
  };

  return (
    <div style={{ background: '#80a4ffff', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
                textarea { resize: none; outline: none; transition: border-color 0.2s; }
            `}</style>

      {/* Soothing Background Aesthetics */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {/* Main gradient mesh */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(at 0% 0%, #f0f4ff 0%, transparent 50%), radial-gradient(at 100% 0%, #f5f3ff 0%, transparent 50%), radial-gradient(at 100% 100%, #eff6ff 0%, transparent 50%), radial-gradient(at 0% 100%, #fdf4ff 0%, transparent 50%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(79,70,229,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(79,70,229,0.03) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        <motion.div animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', width: 700, height: 700, background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)', filter: 'blur(100px)', top: '-15%', right: '-5%', borderRadius: '50%' }} />
        <motion.div animate={{ x: [0, -50, 0], y: [0, -60, 0], scale: [1, 1.2, 1] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', width: 600, height: 600, background: 'radial-gradient(circle, rgba(168,85,247,0.07), transparent 70%)', filter: 'blur(100px)', bottom: '5%', left: '-10%', borderRadius: '50%' }} />
        <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 10, repeat: Infinity }} style={{ position: 'absolute', width: 400, height: 400, background: 'radial-gradient(circle, rgba(56,189,248,0.06), transparent 70%)', filter: 'blur(80px)', top: '30%', left: '30%', borderRadius: '50%' }} />
      </div>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', background: 'rgba(255,255,255,0.7)',
        borderBottom: '1px solid #E5E7EB', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 100
      }}>
        <div onClick={() => navigate("/dashboard")} style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4F46E5', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 8, height: 8, background: '#4F46E5', borderRadius: '50%', boxShadow: '0 0 12px #4F46E5' }} />
          CortexCraft
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#EEF2FF', padding: '6px 16px', borderRadius: 100, border: '1px solid #C7D2FE' }}>
          <MessageSquare size={16} color="#4F46E5" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4F46E5', letterSpacing: '0.02em' }}>BRAIN CHAT</span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 100, color: '#4B5563', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}
          onMouseOver={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.color = '#4F46E5'; }}
          onMouseOut={e => { e.currentTarget.style.background = '#FFF'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#4B5563'; }}
        >
          <ChevronLeft size={18} /> Exit
        </button>
      </nav>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 10 }}>

        {/* Sidebar */}
        <aside style={{ width: 320, background: 'rgba(255,255,255,0.4)', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          <div style={{ padding: '24px' }}>
            <button
              onClick={() => document.getElementById('chat-upload')?.click()}
              disabled={uploading}
              style={{
                width: '100%', padding: '12px', background: '#4F46E5', color: '#FFF',
                border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                cursor: 'pointer', boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)', transition: '0.3s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {uploading ? (
                <div style={{ width: 18, height: 18, border: '2px solid #FFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              ) : (
                <Plus size={18} />
              )}
              New Source
            </button>
            <input id="chat-upload" type="file" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          </div>

          <div style={{ padding: '0 24px 12px', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={14} /> CONTEXT SOURCES
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 24px' }}>
            <AnimatePresence>
              {sources.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 16 }}>📁</div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>No documents uploaded yet.</p>
                </div>
              ) : (
                sources.map((src, i) => (
                  <motion.div
                    key={src.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => toggleSource(src.id)}
                    style={{
                      padding: '16px', borderRadius: 16, cursor: 'pointer',
                      background: activeSourceIds.has(src.id) ? '#FFF' : 'transparent',
                      border: '1px solid',
                      borderColor: activeSourceIds.has(src.id) ? '#4F46E580' : 'transparent',
                      boxShadow: activeSourceIds.has(src.id) ? '0 10px 20px rgba(0,0,0,0.04)' : 'none',
                      transition: '0.2s', marginBottom: 8, position: 'relative'
                    }}
                    onMouseOver={e => !activeSourceIds.has(src.id) && (e.currentTarget.style.background = '#F1F5F9')}
                    onMouseOut={e => !activeSourceIds.has(src.id) && (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: activeSourceIds.has(src.id) ? '#EEF2FF' : '#F8FAFC', color: activeSourceIds.has(src.id) ? '#4F46E5' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={16} />
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{src.title}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500 }}>{src.fileName.split('.').pop()?.toUpperCase()}</div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #E2E8F0', background: activeSourceIds.has(src.id) ? '#10B981' : 'transparent', borderColor: activeSourceIds.has(src.id) ? '#10B981' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {activeSourceIds.has(src.id) && <Check size={12} color="white" />}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {activeSourceIds.size > 0 && (
            <div style={{ margin: '16px 24px 24px', padding: '16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 16, display: 'flex', gap: 10 }}>
              <BrainCircuit size={16} color="#15803d" style={{ marginTop: 2 }} />
              <p style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600, lineHeight: 1.5 }}>
                Grounded in <b>{activeSourceIds.size}</b> source{activeSourceIds.size > 1 ? 's' : ''}. Responses are now hyper-accurate.
              </p>
            </div>
          )}

        </aside>

        {/* Chat Main Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    gap: 16,
                    marginBottom: 32,
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 14,
                    background: msg.role === 'user' ? '#4F46E5' : '#FFF',
                    border: msg.role === 'user' ? 'none' : '1px solid #E5E7EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: msg.role === 'user' ? '0 8px 16px rgba(79, 70, 229, 0.2)' : '0 4px 10px rgba(0,0,0,0.03)',
                    flexShrink: 0
                  }}>
                    {msg.role === 'user' ? <User size={20} color="white" /> : <Bot size={20} color="#4F46E5" />}
                  </div>
                  <div style={{ maxWidth: '75%' }}>
                    <div style={{
                      padding: '16px 20px',
                      borderRadius: 20,
                      background: msg.role === 'user' ? '#FFF' : '#FFF',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                      borderBottomRightRadius: msg.role === 'user' ? 4 : 20,
                      borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 20,
                    }}>
                      <p style={{
                        fontSize: '0.95rem', color: '#334155', lineHeight: 1.7, margin: 0,
                        fontWeight: msg.role === 'user' ? 600 : 500
                      }}>
                        {msg.text}
                      </p>
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', marginTop: 8, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                      {formatTime(msg.ts)}
                    </div>
                  </div>
                </motion.div>
              ))}

              {sending && (
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 14, background: '#FFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={20} color="#4F46E5" />
                  </div>
                  <div style={{ padding: '16px 24px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '4px 20px 20px 20px', display: 'flex', gap: 6 }}>
                    {[0, 1, 2].map(d => (
                      <motion.div key={d} animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.2 }} style={{ width: 6, height: 6, background: '#4F46E5', borderRadius: '50%' }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Entry Bar */}
          <div style={{ padding: '24px 60px 40px', background: 'transparent' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>

              {activeSourceIds.size > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
                  {sources.filter(s => activeSourceIds.has(s.id)).map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '4px 12px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700, color: '#4F46E5', whiteSpace: 'nowrap' }}>
                      <Sparkles size={12} /> {truncate(s.title, 20)}
                      <X size={14} style={{ cursor: 'pointer' }} onClick={() => toggleSource(s.id)} />
                    </div>
                  ))}
                </div>
              )}

              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: 12, background: '#FFF',
                border: '1px solid #E5E7EB', borderRadius: 24, padding: '8px 12px 8px 16px',
                boxShadow: '0 20px 50px -15px rgba(0,0,0,0.08)', transition: '0.3s'
              }}
                id="input-container"
                onFocus={() => document.getElementById('input-container')!.style.borderColor = '#4F46E5'}
                onBlur={() => document.getElementById('input-container')!.style.borderColor = '#E5E7EB'}
              >
                <button
                  onClick={() => document.getElementById('chat-upload')?.click()}
                  style={{ width: 40, height: 40, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E5E7EB', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 2 }}
                >
                  <Paperclip size={20} />
                </button>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={activeSourceIds.size > 0 ? "Ask about your documents..." : "Type a message..."}
                  style={{
                    flex: 1, padding: '12px 0', background: 'transparent', border: 'none',
                    fontSize: '1rem', fontWeight: 500, color: '#1E293B', height: '48px'
                  }}
                />

                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  style={{
                    width: 48, height: 48, borderRadius: 18, background: input.trim() ? '#4F46E5' : '#F1F5F9',
                    color: '#FFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: input.trim() ? 'pointer' : 'default', transition: '0.2s', marginBottom: 2
                  }}
                >
                  <Send size={20} color={input.trim() ? 'white' : '#94A3B8'} />
                </button>
              </div>
              <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                {activeSourceIds.size === 0 ? "General Model · No context selected" : `Context Active (${activeSourceIds.size} source${activeSourceIds.size > 1 ? 's' : ''})`}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}