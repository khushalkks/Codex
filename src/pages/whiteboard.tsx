import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Users, Pencil, Eraser, Square, Circle, Minus, Type,
  Trash2, Download, Share2, Undo2, Redo2, MousePointer, Copy, Check
} from "lucide-react";

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

export default function WhiteboardPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [undoStack, setUndoStack] = useState<DrawElement[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawElement[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);
  const [roomId, setRoomId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("room") || genRoomId();
  });
  const [copied, setCopied] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState<Point | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ─── Canvas resize ────────────────────────────────────────────────
  useEffect(() => {
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
  }, [elements]);

  // ─── Redraw ───────────────────────────────────────────────────────
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw all elements
    const allElements = currentElement ? [...elements, currentElement] : elements;
    allElements.forEach(el => drawElement(ctx, el));
  }, [elements, currentElement]);

  useEffect(() => { redrawCanvas(); }, [redrawCanvas]);

  // ─── Draw single element ──────────────────────────────────────────
  const drawElement = (ctx: CanvasRenderingContext2D, el: DrawElement) => {
    ctx.strokeStyle = el.color;
    ctx.fillStyle = el.color;
    ctx.lineWidth = el.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (el.tool === "pencil" || el.tool === "eraser") {
      if (el.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = el.tool === "eraser" ? "#0f172a" : el.color;
      ctx.lineWidth = el.tool === "eraser" ? el.width * 4 : el.width;
      ctx.moveTo(el.points[0].x, el.points[0].y);
      for (let i = 1; i < el.points.length; i++) {
        const mid = { x: (el.points[i - 1].x + el.points[i].x) / 2, y: (el.points[i - 1].y + el.points[i].y) / 2 };
        ctx.quadraticCurveTo(el.points[i - 1].x, el.points[i - 1].y, mid.x, mid.y);
      }
      ctx.stroke();
    } else if (el.tool === "line" && el.points.length === 2) {
      ctx.beginPath();
      ctx.moveTo(el.points[0].x, el.points[0].y);
      ctx.lineTo(el.points[1].x, el.points[1].y);
      ctx.stroke();
    } else if (el.tool === "rect" && el.points.length === 2) {
      const [p1, p2] = el.points;
      ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    } else if (el.tool === "circle" && el.points.length === 2) {
      const [p1, p2] = el.points;
      const rx = Math.abs(p2.x - p1.x) / 2;
      const ry = Math.abs(p2.y - p1.y) / 2;
      const cx = (p1.x + p2.x) / 2;
      const cy = (p1.y + p2.y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (el.tool === "text" && el.text) {
      ctx.font = `${el.width * 4 + 12}px Inter, sans-serif`;
      ctx.fillText(el.text, el.points[0].x, el.points[0].y);
    }
  };

  // ─── Mouse handlers ───────────────────────────────────────────────
  const getPos = (e: React.MouseEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e);

    if (tool === "text") {
      setTextPos(pos);
      setTextInput("");
      return;
    }
    if (tool === "select") return;

    setIsDrawing(true);
    const newEl: DrawElement = {
      id: Date.now().toString(),
      tool: tool,
      points: [pos],
      color: color,
      width: strokeWidth,
    };
    setCurrentElement(newEl);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentElement) return;
    const pos = getPos(e);

    if (currentElement.tool === "pencil" || currentElement.tool === "eraser") {
      setCurrentElement(prev => prev ? { ...prev, points: [...prev.points, pos] } : null);
    } else {
      setCurrentElement(prev => prev ? { ...prev, points: [prev.points[0], pos] } : null);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentElement) return;
    setIsDrawing(false);
    setUndoStack(prev => [...prev, elements]);
    setRedoStack([]);
    setElements(prev => [...prev, currentElement]);
    setCurrentElement(null);
  };

  const handleTextSubmit = () => {
    if (!textPos || !textInput.trim()) { setTextPos(null); return; }
    const el: DrawElement = {
      id: Date.now().toString(),
      tool: "text",
      points: [textPos],
      color: color,
      width: strokeWidth,
      text: textInput,
    };
    setUndoStack(prev => [...prev, elements]);
    setRedoStack([]);
    setElements(prev => [...prev, el]);
    setTextPos(null);
    setTextInput("");
  };

  // ─── Actions ──────────────────────────────────────────────────────
  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, elements]);
    setElements(prev);
    setUndoStack(u => u.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, elements]);
    setElements(next);
    setRedoStack(r => r.slice(0, -1));
  };

  const clearCanvas = () => {
    setUndoStack(prev => [...prev, elements]);
    setRedoStack([]);
    setElements([]);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `whiteboard-${roomId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyRoomLink = () => {
    const url = `${window.location.origin}/whiteboard?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tools = [
    { id: "select", icon: <MousePointer size={18} />, label: "Select" },
    { id: "pencil", icon: <Pencil size={18} />, label: "Draw" },
    { id: "eraser", icon: <Eraser size={18} />, label: "Eraser" },
    { id: "line", icon: <Minus size={18} />, label: "Line" },
    { id: "rect", icon: <Square size={18} />, label: "Rectangle" },
    { id: "circle", icon: <Circle size={18} />, label: "Circle" },
    { id: "text", icon: <Type size={18} />, label: "Text" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; overflow: hidden; }

        .wb-root { font-family: 'Inter', sans-serif; background: #0f172a; height: 100vh; width: 100%; display: flex; flex-direction: column; overflow: hidden; }

        .wb-nav { display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; background: rgba(15,23,42,0.95); border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; backdrop-filter: blur(20px); z-index: 50; }
        .wb-logo { font-weight: 800; font-size: 1rem; color: #818cf8; display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .wb-logo-dot { width: 7px; height: 7px; background: #818cf8; border-radius: 50%; box-shadow: 0 0 10px #818cf8; animation: wbPulse 2s ease-in-out infinite; }
        @keyframes wbPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.5); opacity: 0.6; } }

        .wb-back { padding: 6px 16px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #94a3b8; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 6px; }
        .wb-back:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }

        .wb-body { display: flex; flex: 1; overflow: hidden; position: relative; }

        /* Left Toolbar */
        .wb-toolbar { width: 56px; flex-shrink: 0; background: rgba(15,23,42,0.98); border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; align-items: center; padding: 12px 0; gap: 4px; z-index: 30; }
        .wb-tool-btn { width: 40px; height: 40px; border: none; border-radius: 10px; background: transparent; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; position: relative; }
        .wb-tool-btn:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
        .wb-tool-btn.active { background: #4f46e5; color: #fff; box-shadow: 0 4px 12px rgba(79,70,229,0.4); }
        .wb-tool-btn .wb-tooltip { position: absolute; left: 52px; background: #1e293b; color: #e2e8f0; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 600; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .15s; border: 1px solid rgba(255,255,255,0.08); }
        .wb-tool-btn:hover .wb-tooltip { opacity: 1; }

        .wb-divider { width: 28px; height: 1px; background: rgba(255,255,255,0.08); margin: 6px 0; }

        /* Bottom bar */
        .wb-bottom { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 12px; background: rgba(15,23,42,0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 8px 16px; backdrop-filter: blur(20px); z-index: 40; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }

        .wb-color-btn { width: 22px; height: 22px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: all .15s; }
        .wb-color-btn:hover { transform: scale(1.2); }
        .wb-color-btn.active { border-color: #fff; box-shadow: 0 0 8px rgba(255,255,255,0.3); transform: scale(1.15); }

        .wb-width-btn { border: none; border-radius: 6px; background: rgba(255,255,255,0.06); color: #94a3b8; cursor: pointer; padding: 4px 8px; font-size: 0.7rem; font-weight: 700; transition: all .15s; }
        .wb-width-btn:hover { background: rgba(255,255,255,0.1); }
        .wb-width-btn.active { background: #4f46e5; color: #fff; }

        .wb-sep { width: 1px; height: 24px; background: rgba(255,255,255,0.08); }

        .wb-action-btn { width: 34px; height: 34px; border: none; border-radius: 8px; background: rgba(255,255,255,0.06); color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
        .wb-action-btn:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
        .wb-action-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .wb-action-btn.danger:hover { background: rgba(239,68,68,0.15); color: #ef4444; }

        /* Room bar */
        .wb-room-bar { display: flex; align-items: center; gap: 12px; }
        .wb-room-id { font-size: 0.75rem; font-weight: 700; color: #818cf8; background: rgba(79,70,229,0.15); padding: 4px 12px; border-radius: 6px; letter-spacing: 0.08em; font-family: monospace; }
        .wb-share-btn { padding: 6px 14px; background: rgba(79,70,229,0.15); border: 1px solid rgba(79,70,229,0.3); border-radius: 8px; color: #818cf8; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 6px; }
        .wb-share-btn:hover { background: rgba(79,70,229,0.25); }
        .wb-users-badge { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #22c55e; font-weight: 600; }
        .wb-users-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; animation: wbPulse 2s ease-in-out infinite; }

        /* Canvas area */
        .wb-canvas-wrap { flex: 1; position: relative; overflow: hidden; }
        .wb-canvas-wrap canvas { display: block; cursor: crosshair; }

        /* Text input overlay */
        .wb-text-overlay { position: absolute; z-index: 35; }
        .wb-text-input { background: rgba(15,23,42,0.9); border: 2px solid #4f46e5; border-radius: 8px; color: #e2e8f0; padding: 8px 12px; font-family: Inter, sans-serif; font-size: 1rem; outline: none; min-width: 200px; backdrop-filter: blur(10px); }
      `}</style>

      <div className="wb-root">
        {/* Nav */}
        <nav className="wb-nav">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="wb-logo" onClick={() => navigate("/")}>
              <div className="wb-logo-dot" /> CortexCraft
            </div>
            <span style={{ color: "#334155", fontSize: "1.2rem", fontWeight: 300 }}>|</span>
            <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "0.9rem" }}>Whiteboard</span>
          </div>

          <div className="wb-room-bar">
            <div className="wb-users-badge"><div className="wb-users-dot" /> {connectedUsers} online</div>
            <span className="wb-room-id">{roomId}</span>
            <button className="wb-share-btn" onClick={copyRoomLink}>
              {copied ? <><Check size={14} /> Copied!</> : <><Share2 size={14} /> Share</>}
            </button>
            <button className="wb-back" onClick={() => navigate("/dashboard")}><ArrowLeft size={14} /> Dashboard</button>
          </div>
        </nav>

        <div className="wb-body">
          {/* Left toolbar */}
          <div className="wb-toolbar">
            {tools.map(t => (
              <button key={t.id} className={`wb-tool-btn ${tool === t.id ? "active" : ""}`} onClick={() => setTool(t.id)}>
                {t.icon}
                <span className="wb-tooltip">{t.label}</span>
              </button>
            ))}
            <div className="wb-divider" />
            <button className="wb-tool-btn" onClick={undo} disabled={undoStack.length === 0}>
              <Undo2 size={18} />
              <span className="wb-tooltip">Undo</span>
            </button>
            <button className="wb-tool-btn" onClick={redo} disabled={redoStack.length === 0}>
              <Redo2 size={18} />
              <span className="wb-tooltip">Redo</span>
            </button>
            <div className="wb-divider" />
            <button className="wb-tool-btn danger" onClick={clearCanvas}>
              <Trash2 size={18} />
              <span className="wb-tooltip">Clear All</span>
            </button>
            <button className="wb-tool-btn" onClick={downloadCanvas}>
              <Download size={18} />
              <span className="wb-tooltip">Download</span>
            </button>
          </div>

          {/* Canvas */}
          <div className="wb-canvas-wrap" ref={containerRef}>
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: tool === "select" ? "default" : tool === "text" ? "text" : "crosshair" }}
            />

            {/* Text input overlay */}
            {textPos && (
              <div className="wb-text-overlay" style={{ left: textPos.x + 56, top: textPos.y }}>
                <input
                  className="wb-text-input"
                  autoFocus
                  placeholder="Type here..."
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleTextSubmit(); if (e.key === "Escape") setTextPos(null); }}
                  onBlur={handleTextSubmit}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom palette bar */}
        <div className="wb-bottom">
          {COLORS.map(c => (
            <div
              key={c}
              className={`wb-color-btn ${color === c ? "active" : ""}`}
              style={{ background: c, border: c === "#ffffff" && color !== c ? "2px solid #475569" : undefined }}
              onClick={() => setColor(c)}
            />
          ))}
          <div className="wb-sep" />
          {WIDTHS.map(w => (
            <button key={w} className={`wb-width-btn ${strokeWidth === w ? "active" : ""}`} onClick={() => setStrokeWidth(w)}>
              {w}px
            </button>
          ))}
        </div>
      </div>
    </>
  );
}