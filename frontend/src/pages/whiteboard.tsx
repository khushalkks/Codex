import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import {
  ArrowLeft, Users, Pencil, Eraser, Square, Circle, Minus, Type,
  Trash2, Download, Share2, Undo2, Redo2, MousePointer, Copy, Check,
  Plus, LogIn, Sparkles
} from "lucide-react";
import { API_BASE_URL } from "../config";

// ─── Types ──────────────────────────────────────────────────────────
interface Point { x: number; y: number }
interface DrawElement {
  id: string;
  tool: string;
  points: Point[];
  color: string;
  width: number;
  text?: string;
}

const COLORS = ["#ffffff","#4f46e5","#ef4444","#22c55e","#f59e0b","#ec4899","#06b6d4","#8b5cf6","#f97316","#64748b"];
const WIDTHS = [2, 4, 6, 10];

// ─── Generate Room ID ───────────────────────────────────────────────
const genRoomId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 8; i++) { if (i === 4) id += "-"; id += chars[Math.floor(Math.random() * chars.length)]; }
  return id;
};

// ─── Styles ────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  :root {
    --bg-deep: #020617;
    --accent: #6366f1;
    --accent-glow: rgba(99, 102, 241, 0.5);
    --glass: rgba(15, 23, 42, 0.6);
    --glass-border: rgba(255, 255, 255, 0.08);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg-deep); color: #f8fafc; overflow: hidden; }

  .wb-lobby-root {
    height: 100vh; width: 100%;
    background: radial-gradient(circle at 0% 0%, #1e1b4b 0%, transparent 40%),
                radial-gradient(circle at 100% 100%, #312e81 0%, transparent 40%),
                #020617;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }

  .wb-lobby-root::before {
    content: ''; position: absolute; width: 200%; height: 200%;
    background: url('https://grainy-gradients.vercel.app/noise.svg');
    opacity: 0.05; pointer-events: none; animation: noise 8s steps(10) infinite;
  }

  @keyframes noise { 0%, 100% { transform:translate(0,0) } 10% { transform:translate(-5%,-5%) } 20% { transform:translate(-10%,5%) } }

  .wb-lobby-card {
    width: 440px; background: var(--glass); backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border); border-radius: 32px;
    padding: 48px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);
    z-index: 10; position: relative;
  }

  .wb-lobby-header { text-align: center; margin-bottom: 40px; }
  .wb-lobby-icon-wrap {
    width: 72px; height: 72px; background: linear-gradient(135deg, #6366f1, #a855f7);
    border-radius: 20px; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px; box-shadow: 0 10px 30px var(--accent-glow);
    color: white; transform: rotate(-5deg);
  }

  .wb-lobby-header h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; background: linear-gradient(to bottom, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .wb-lobby-header p { color: #94a3b8; font-size: 0.95rem; font-weight: 500; }

  .wb-lobby-tabs {
    display: flex; background: rgba(0,0,0,0.3); padding: 5px;
    border-radius: 16px; margin-bottom: 32px; border: 1px solid var(--glass-border);
  }

  .wb-lobby-tabs button {
    flex: 1; padding: 10px; border: none; border-radius: 12px;
    background: transparent; color: #64748b; font-size: 0.9rem;
    font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }

  .wb-lobby-tabs button.active { background: #6366f1; color: #fff; box-shadow: 0 4px 15px rgba(99,102,241,0.4); }

  .wb-form-group { margin-bottom: 24px; }
  .wb-form-group label { display: block; font-size: 0.75rem; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  
  .wb-form-input {
    width: 100%; background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border);
    border-radius: 14px; padding: 14px 18px; color: #fff; outline: none;
    font-size: 1rem; transition: all 0.2s; font-family: inherit;
  }

  .wb-form-input:focus { border-color: #6366f1; background: rgba(0,0,0,0.6); box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }

  .wb-id-box {
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border);
    border-radius: 14px; padding: 14px 18px;
  }

  .wb-id-box code { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #6366f1; font-size: 1.1rem; letter-spacing: 0.05em; }
  .wb-id-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 6px; border-radius: 8px; transition: all 0.2s; }
  .wb-id-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }

  .wb-lobby-submit {
    width: 100%; background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white; border: none; border-radius: 16px; padding: 16px;
    font-weight: 700; font-size: 1.1rem; cursor: pointer;
    transition: all 0.3s; margin-top: 8px;
    box-shadow: 0 10px 25px -5px rgba(99,102,241,0.5);
  }

  .wb-lobby-submit:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(99,102,241,0.6); filter: brightness(1.1); }
  .wb-lobby-submit:active { transform: translateY(0); }

  /* Board UI Styles */
  .wb-root { background: #0f172a; height: 100vh; width: 100%; display: flex; flex-direction: column; overflow: hidden; }
  .wb-nav { height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; background: rgba(15,23,42,0.8); border-bottom: 1px solid var(--glass-border); backdrop-filter: blur(12px); z-index: 100; }
  .wb-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.1rem; color: #fff; cursor: pointer; }
  .wb-logo-icon { width: 32px; height: 32px; background: #6366f1; border-radius: 8px; display: flex; align-items: center; justify-content: center; }

  .wb-toolbar {
    position: absolute; left: 20px; top: 50%; transform: translateY(-50%);
    background: rgba(15, 23, 42, 0.9); border: 1px solid var(--glass-border);
    border-radius: 20px; padding: 12px; display: flex; flex-direction: column;
    gap: 8px; backdrop-filter: blur(16px); z-index: 50;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }

  .wb-tool-btn {
    width: 44px; height: 44px; border: none; border-radius: 12px;
    background: transparent; color: #94a3b8; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s ease; position: relative;
  }

  .wb-tool-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
  .wb-tool-btn.active { background: #6366f1; color: white; box-shadow: 0 8px 20px var(--accent-glow); }

  .wb-tooltip {
    position: absolute; left: 60px; background: #1e293b; color: #fff;
    padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 600;
    white-space: nowrap; opacity: 0; pointer-events: none; transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5); border: 1px solid var(--glass-border);
  }
  .wb-tool-btn:hover .wb-tooltip { opacity: 1; left: 56px; }

  .wb-bottom-bar {
    position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.9); border: 1px solid var(--glass-border);
    border-radius: 20px; padding: 10px 20px; display: flex; align-items: center;
    gap: 16px; backdrop-filter: blur(16px); z-index: 50;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }

  .wb-color-dot { width: 20px; height: 20px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: 0.2s; }
  .wb-color-dot.active { border-color: #fff; transform: scale(1.2); box-shadow: 0 0 10px rgba(255,255,255,0.3); }

  .wb-status-badge {
    padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 700;
    display: flex; align-items: center; gap: 6px; text-transform: uppercase;
  }
  .wb-status-connected { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
  .wb-status-connecting { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
  .wb-status-disconnected { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
`;

// ─── Lobby Component ───────────────────────────────────────────────
function WhiteboardLobby({ initialRoom, onJoin }: { initialRoom?: string; onJoin: (room: string, name: string) => void }) {
  const [tab, setTab] = useState<'create' | 'join'>(initialRoom ? 'join' : 'create');
  const [generatedRoom] = useState(genRoomId);
  const [joinInput, setJoinInput] = useState(initialRoom || '');
  const [nameInput, setNameInput] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').name || ''; } catch { return ''; }
  });
  const [copied, setCopied] = useState(false);
  const [savedBoards, setSavedBoards] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/whiteboard/list`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSavedBoards(data);
        }
      })
      .catch(err => console.error("Error loading boards:", err));
  }, []);

  const handleGo = () => {
    const roomToUse = tab === 'create' ? generatedRoom : joinInput.trim().toUpperCase();
    if (!roomToUse || !nameInput.trim()) return;
    onJoin(roomToUse, nameInput.trim());
  };

  const copyId = () => {
    navigator.clipboard.writeText(generatedRoom);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="wb-lobby-root">
      <style>{GLOBAL_STYLES}</style>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="wb-lobby-card"
        style={{ width: '460px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="wb-lobby-header">
          <div className="wb-lobby-icon-wrap">
            <Pencil size={32} />
          </div>
          <h1>Cortex Canvas</h1>
          <p>The ultimate collaborative whiteboard</p>
        </div>

        <div className="wb-lobby-tabs">
          <button className={tab === 'create' ? 'active' : ''} onClick={() => setTab('create')}>
            <Plus size={18} /> Create New
          </button>
          <button className={tab === 'join' ? 'active' : ''} onClick={() => setTab('join')}>
            <LogIn size={18} /> Join Existing
          </button>
        </div>

        <div className="wb-lobby-form">
          <div className="wb-form-group">
            <label>Display Name</label>
            <input 
              className="wb-form-input"
              placeholder="How should we call you?" 
              value={nameInput} 
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGo()}
              autoFocus
            />
          </div>

          {tab === 'create' ? (
            <div className="wb-form-group">
              <label>Unique Room ID</label>
              <div className="wb-id-box">
                <code>{generatedRoom}</code>
                <button className="wb-id-btn" onClick={copyId}>
                  {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="wb-form-group">
              <label>Room ID</label>
              <input 
                className="wb-form-input"
                placeholder="Paste Room ID here..." 
                value={joinInput} 
                onChange={e => setJoinInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGo()}
              />
            </div>
          )}

          <button className="wb-lobby-submit" onClick={handleGo}>
            {tab === 'create' ? 'Create & Launch' : 'Enter Whiteboard'}
          </button>

          {/* List of Saved Canvas Boards */}
          {savedBoards.length > 0 && (
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
                Saved Canvas Boards
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
                {savedBoards.map((b: any) => (
                  <div 
                    key={b.roomId} 
                    onClick={() => {
                      setTab('join');
                      setJoinInput(b.roomId);
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(0,0,0,0.2)',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      transition: '0.2s',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                      e.currentTarget.style.background = 'rgba(99,102,241,0.05)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Room: {b.roomId}</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>By: {b.lastSavedBy || 'User'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function WhiteboardPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Session State
  const [hasJoined, setHasJoined] = useState(false);
  const [activeRoom, setActiveRoom] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Board State
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [undoStack, setUndoStack] = useState<DrawElement[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawElement[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState<Point | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const activeRoomRef = useRef("");
  const currentUserRef = useRef<any>(null);

  // ─── Socket.IO Setup ──────────────────────────────────────────────
  useEffect(() => {
    const socket = io(API_BASE_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setWsStatus('connected');
      if (activeRoomRef.current && currentUserRef.current) {
        socket.emit("wb_join", {
          roomId: activeRoomRef.current,
          userId: currentUserRef.current.id,
          userName: currentUserRef.current.name,
        });
      }
    });

    socket.on("disconnect", () => setWsStatus('disconnected'));
    socket.on("connect_error", () => setWsStatus('disconnected'));

    socket.on("wb_init", (data: { elements: DrawElement[] }) => {
      setElements(data.elements);
    });

    socket.on("wb_update", (data: { element: DrawElement }) => {
      setElements((prev) => [...prev, data.element]);
    });

    socket.on("wb_clear_all", () => {
      setElements([]);
    });

    socket.on("wb_presence", (data: { users: any[] }) => {
      setConnectedUsers(data.users.length);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync refs
  useEffect(() => { activeRoomRef.current = activeRoom; }, [activeRoom]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  // Join logic
  useEffect(() => {
    if (!hasJoined || !activeRoom || !currentUser) return;
    const socket = socketRef.current;
    if (!socket) return;

    if (socket.connected) {
      socket.emit("wb_join", {
        roomId: activeRoom,
        userId: currentUser.id,
        userName: currentUser.name,
      });
    } else {
      setWsStatus('connecting');
    }
  }, [hasJoined, activeRoom, currentUser]);

  // ─── Canvas logic ────────────────────────────────────────────────
  useEffect(() => {
    if (!hasJoined) return;
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [elements, hasJoined]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    const allElements = currentElement ? [...elements, currentElement] : elements;
    allElements.forEach(el => drawElement(ctx, el));
  }, [elements, currentElement]);

  useEffect(() => { redrawCanvas(); }, [redrawCanvas]);

  const drawElement = (ctx: CanvasRenderingContext2D, el: DrawElement) => {
    ctx.strokeStyle = el.color; ctx.fillStyle = el.color; ctx.lineWidth = el.width; ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (el.tool === "pencil" || el.tool === "eraser") {
      if (el.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = el.tool === "eraser" ? "#0f172a" : el.color;
      ctx.lineWidth = el.tool === "eraser" ? el.width * 5 : el.width;
      ctx.moveTo(el.points[0].x, el.points[0].y);
      for (let i = 1; i < el.points.length; i++) {
        const mid = { x: (el.points[i - 1].x + el.points[i].x) / 2, y: (el.points[i - 1].y + el.points[i].y) / 2 };
        ctx.quadraticCurveTo(el.points[i - 1].x, el.points[i - 1].y, mid.x, mid.y);
      }
      ctx.stroke();
    } else if (el.tool === "line" && el.points.length === 2) {
      ctx.beginPath(); ctx.moveTo(el.points[0].x, el.points[0].y); ctx.lineTo(el.points[1].x, el.points[1].y); ctx.stroke();
    } else if (el.tool === "rect" && el.points.length === 2) {
      const [p1, p2] = el.points; ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    } else if (el.tool === "circle" && el.points.length === 2) {
      const [p1, p2] = el.points; const rx = Math.abs(p2.x - p1.x) / 2; const ry = Math.abs(p2.y - p1.y) / 2; const cx = (p1.x + p2.x) / 2; const cy = (p1.y + p2.y) / 2;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (el.tool === "text" && el.text) {
      ctx.font = `600 ${el.width * 4 + 14}px 'Plus Jakarta Sans', sans-serif`; ctx.fillText(el.text, el.points[0].x, el.points[0].y);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (tool === "text") { setTextPos(pos); setTextInput(""); return; }
    if (tool === "select") return;
    setIsDrawing(true);
    setCurrentElement({ id: Date.now().toString(), tool, points: [pos], color, width: strokeWidth });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentElement) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (currentElement.tool === "pencil" || currentElement.tool === "eraser") {
      setCurrentElement(prev => prev ? { ...prev, points: [...prev.points, pos] } : null);
    } else {
      setCurrentElement(prev => prev ? { ...prev, points: [prev.points[0], pos] } : null);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentElement) return;
    setIsDrawing(false); setUndoStack(prev => [...prev, elements]); setRedoStack([]); setElements(prev => [...prev, currentElement]);
    socketRef.current?.emit("wb_draw", { roomId: activeRoom, element: currentElement });
    setCurrentElement(null);
  };

  const handleTextSubmit = () => {
    if (!textPos || !textInput.trim()) { setTextPos(null); return; }
    const el: DrawElement = { id: Date.now().toString(), tool: "text", points: [textPos], color, width: strokeWidth, text: textInput };
    setUndoStack(prev => [...prev, elements]); setRedoStack([]); setElements(prev => [...prev, el]);
    socketRef.current?.emit("wb_draw", { roomId: activeRoom, element: el });
    setTextPos(null); setTextInput("");
  };

  const handleJoin = (room: string, name: string) => {
    const user = { id: 'wb_' + Math.random().toString(36).slice(2, 9), name };
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user); setActiveRoom(room); setHasJoined(true);
    window.history.replaceState({}, '', `/whiteboard?room=${room}`);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, elements]); setElements(prev); setUndoStack(u => u.slice(0, -1));
    socketRef.current?.emit("wb_undo", { roomId: activeRoom });
  };

  const clearCanvas = () => {
    setUndoStack(prev => [...prev, elements]); setRedoStack([]); setElements([]);
    socketRef.current?.emit("wb_clear", { roomId: activeRoom });
  };

  const download = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const link = document.createElement("a"); link.download = `whiteboard-${activeRoom}.png`; link.href = canvas.toDataURL("image/png"); link.click();
  };

  const urlRoom = new URLSearchParams(window.location.search).get('room') || undefined;

  if (!hasJoined) return <WhiteboardLobby initialRoom={urlRoom} onJoin={handleJoin} />;

  return (
    <div className="wb-root">
      <style>{GLOBAL_STYLES}</style>
      <nav className="wb-nav">
        <div className="wb-logo" onClick={() => navigate("/")}>
          <div className="wb-logo-icon"><Sparkles size={18} color="white" /></div>
          Cortex Canvas
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className={`wb-status-badge wb-status-${wsStatus}`}>
            <div className="wb-online-dot" style={{ width: 6, height: 6, background: wsStatus === 'connected' ? '#10b981' : wsStatus === 'connecting' ? '#f59e0b' : '#ef4444', borderRadius: '50%' }} /> {wsStatus}
          </div>
          {activeRoom && (
            <div className="wb-status-badge" style={{ color: '#818cf8', borderColor: 'rgba(129,140,248,0.2)', background: 'rgba(129,140,248,0.1)' }}>
               Room: {activeRoom}
            </div>
          )}
          <div className="wb-status-badge wb-status-connected" style={{ color: '#10b981' }}>
            <Users size={14} /> {connectedUsers} Artists
          </div>
          <button className="wb-tool-btn" style={{ height: 36, padding: '0 12px', width: 'auto', gap: 6, fontSize: '0.8rem', fontWeight: 700 }} onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={14} /> Dashboard
          </button>
        </div>
      </nav>

      <div className="wb-body" style={{ flex: 1, position: 'relative' }} ref={containerRef}>
        <div className="wb-toolbar">
          {[
            { id: "pencil", icon: <Pencil size={20} />, label: "Pencil" },
            { id: "eraser", icon: <Eraser size={20} />, label: "Eraser" },
            { id: "line", icon: <Minus size={20} />, label: "Line" },
            { id: "rect", icon: <Square size={20} />, label: "Rectangle" },
            { id: "circle", icon: <Circle size={20} />, label: "Circle" },
            { id: "text", icon: <Type size={20} />, label: "Text" },
          ].map(t => (
            <button key={t.id} className={`wb-tool-btn ${tool === t.id ? "active" : ""}`} onClick={() => setTool(t.id)}>
              {t.icon}
              <div className="wb-tooltip">{t.label}</div>
            </button>
          ))}
          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
          <button className="wb-tool-btn" onClick={undo} disabled={undoStack.length === 0}><Undo2 size={20} /><div className="wb-tooltip">Undo</div></button>
          <button className="wb-tool-btn danger" onClick={clearCanvas}><Trash2 size={20} /><div className="wb-tooltip">Clear All</div></button>
          <button className="wb-tool-btn" onClick={download}><Download size={20} /><div className="wb-tooltip">Download</div></button>
        </div>

        <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ display: 'block', cursor: tool === "text" ? "text" : "crosshair" }} />

        {textPos && (
          <div style={{ position: 'absolute', left: textPos.x, top: textPos.y, zIndex: 200 }}>
            <input className="wb-form-input" style={{ width: 250, border: '2px solid #6366f1' }} autoFocus placeholder="Type and press Enter..." value={textInput} onChange={e => setTextInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleTextSubmit(); if (e.key === "Escape") setTextPos(null); }} />
          </div>
        )}

        <div className="wb-bottom-bar">
          <div style={{ display: 'flex', gap: 10 }}>
            {COLORS.map(c => (
              <div key={c} className={`wb-color-dot ${color === c ? "active" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {WIDTHS.map(w => (
              <button key={w} onClick={() => setStrokeWidth(w)} style={{ background: strokeWidth === w ? '#6366f1' : 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>{w}px</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}