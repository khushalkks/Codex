import React, { useState, useEffect, useRef } from 'react';
import { Editor, useMonaco } from '@monaco-editor/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import {
  Hash, Code, Users, Sparkles, X, Bot, Play, Terminal,
  ChevronRight, Wifi, WifiOff, Loader2, CheckCircle2, AlertCircle,
  Copy, Check, Link, PlusCircle, LogIn, ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

/* ─── Types ──────────────────────────────────────── */
interface OnlineUser   { id: string; name: string }
interface RemoteCursor { userId: string; userName: string; color: string; line: number; column: number }

/* ─── Constants ──────────────────────────────────── */
const LANGUAGES = [
  { id: 'python',     name: 'Python',     ext: '.py'   },
  { id: 'javascript', name: 'JavaScript', ext: '.js'   },
  { id: 'typescript', name: 'TypeScript', ext: '.ts'   },
  { id: 'html',       name: 'HTML',       ext: '.html' },
  { id: 'css',        name: 'CSS',        ext: '.css'  },
  { id: 'cpp',        name: 'C++',        ext: '.cpp'  },
  { id: 'java',       name: 'Java',       ext: '.java' },
  { id: 'rust',       name: 'Rust',       ext: '.rs'   },
  { id: 'go',         name: 'Go',         ext: '.go'   },
];

const LANG_COLORS: Record<string, string> = {
  python:'#3572A5', javascript:'#f1e05a', typescript:'#2b7489',
  html:'#e34c26',   css:'#563d7c',        cpp:'#f34b7d',
  java:'#b07219',   rust:'#dea584',       go:'#00ADD8',
};

const CURSOR_PALETTE = [
  '#58a6ff','#3fb950','#f78166','#d2a8ff',
  '#ffa657','#79c0ff','#56d364','#ff7b72',
];

/* ─── Helpers ─────────────────────────────────────── */
const generateRoomId = () =>
  Math.random().toString(36).slice(2, 6).toUpperCase() + '-' +
  Math.random().toString(36).slice(2, 6).toUpperCase();

const avatarColor = (name: string) => {
  const c = ['#5865F2','#57F287','#FEE75C','#EB459E','#ED4245','#00b4d8','#f77f00'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return c[Math.abs(h) % c.length];
};

const cursorColor = (uid: string) => {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = uid.charCodeAt(i) + ((h << 5) - h);
  return CURSOR_PALETTE[Math.abs(h) % CURSOR_PALETTE.length];
};

/* ═══════════════════════════════════════════════════
   LOBBY
═══════════════════════════════════════════════════ */
function Lobby({ initialRoom, onJoin }: { initialRoom?: string; onJoin: (room: string, name: string) => void }) {
  const [tab, setTab]           = useState<'create'|'join'>(initialRoom ? 'join' : 'create');
  const [generatedRoom]         = useState(generateRoomId);
  const [joinInput, setJoinIn]  = useState(initialRoom || '');
  const [nameInput, setNameIn]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').name || ''; } catch { return ''; }
  });
  const [copied, setCopied]     = useState(false);

  const shareLink = `${window.location.origin}/code?room=${generatedRoom}`;

  // Extract just the room ID even if someone pastes a full URL
  const extractRoom = (raw: string): string => {
    const trimmed = raw.trim();
    try {
      const url = new URL(trimmed);
      return (url.searchParams.get('room') || trimmed).toUpperCase();
    } catch {
      return trimmed.toUpperCase();
    }
  };

  const roomToUse = tab === 'create' ? generatedRoom : extractRoom(joinInput);

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGo = () => {
    if (!roomToUse) return;
    onJoin(roomToUse, nameInput.trim() || 'Anonymous');
  };

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:'#0d1117', fontFamily:"system-ui,sans-serif", overflow:'hidden', position:'relative' }}>
      {/* glow */}
      <div style={{ position:'absolute', top:'15%', left:'25%', width:'50vw', height:'50vw',
        background:'radial-gradient(circle,rgba(88,166,255,0.07) 0%,transparent 70%)', pointerEvents:'none' }}/>

      <div style={{ background:'#161b22', border:'1px solid #21262d', borderRadius:'16px',
        padding:'40px', width:'460px', boxShadow:'0 24px 60px rgba(0,0,0,0.6)', position:'relative', zIndex:1 }}>

        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'14px', background:'rgba(88,166,255,0.15)',
            border:'1px solid rgba(88,166,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 16px' }}>
            <Code size={28} color="#58a6ff"/>
          </div>
          <h1 style={{ margin:0, fontSize:'22px', fontWeight:700, color:'#e6edf3' }}>CortexCraft IDE</h1>
          <p style={{ margin:'6px 0 0', fontSize:'13px', color:'#6e7681' }}>Real-time collaborative workspace</p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', background:'#0d1117', borderRadius:'8px', padding:'3px',
          marginBottom:'24px', border:'1px solid #21262d' }}>
          {(['create','join'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:'8px', border:'none', borderRadius:'6px', cursor:'pointer',
              background: tab===t ? '#21262d' : 'transparent',
              color: tab===t ? '#e6edf3' : '#6e7681',
              fontSize:'13px', fontWeight: tab===t ? 700 : 400, fontFamily:'inherit',
              transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'
            }}>
              {t==='create' ? <PlusCircle size={14}/> : <LogIn size={14}/>}
              {t==='create' ? 'New Room' : 'Join Room'}
            </button>
          ))}
        </div>

        {tab === 'create' ? (
          <div style={{ marginBottom:'20px' }}>
            <label style={{ fontSize:'11px', color:'#6e7681', letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Your Room ID
            </label>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'6px',
              background:'#0d1117', border:'1px solid #21262d', borderRadius:'8px', padding:'10px 14px' }}>
              <span style={{ flex:1, fontSize:'20px', fontWeight:700, color:'#58a6ff', letterSpacing:'3px',
                fontFamily:"'JetBrains Mono',monospace" }}>
                {generatedRoom}
              </span>
              <button onClick={copyLink} style={{ background:'none', border:'none', cursor:'pointer',
                color: copied ? '#3fb950':'#6e7681', display:'flex', alignItems:'center', gap:'4px',
                fontSize:'11px', fontFamily:'inherit', transition:'color 0.2s' }}>
                {copied ? <><Check size={13}/> Copied!</> : <><Copy size={13}/> Copy</>}
              </button>
            </div>
            <p style={{ fontSize:'11px', color:'#484f58', margin:'6px 0 0' }}>
              Share this ID with friends to code together.
            </p>
          </div>
        ) : (
          <div style={{ marginBottom:'20px' }}>
            <label style={{ fontSize:'11px', color:'#6e7681', letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Room ID
            </label>
            <input value={joinInput} onChange={e => setJoinIn(e.target.value)}
              placeholder="XXXX-XXXX" onKeyDown={e => e.key==='Enter' && handleGo()}
              style={{ width:'100%', marginTop:'6px', background:'#0d1117', border:'1px solid #21262d',
                borderRadius:'8px', padding:'10px 14px', color:'#e6edf3', fontSize:'18px', fontWeight:700,
                letterSpacing:'3px', outline:'none', fontFamily:"'JetBrains Mono',monospace",
                boxSizing:'border-box', transition:'border-color 0.15s' }}
              onFocus={e=>e.target.style.borderColor='#58a6ff'}
              onBlur={e=>e.target.style.borderColor='#21262d'}
              autoFocus
            />
          </div>
        )}

        <div style={{ marginBottom:'24px' }}>
          <label style={{ fontSize:'11px', color:'#6e7681', letterSpacing:'0.06em', textTransform:'uppercase' }}>
            Display Name
          </label>
          <input value={nameInput} onChange={e => setNameIn(e.target.value)}
            placeholder="e.g. Keshav" onKeyDown={e => e.key==='Enter' && handleGo()}
            style={{ width:'100%', marginTop:'6px', background:'#0d1117', border:'1px solid #21262d',
              borderRadius:'8px', padding:'10px 14px', color:'#e6edf3', fontSize:'14px',
              outline:'none', fontFamily:'inherit', boxSizing:'border-box', transition:'border-color 0.15s' }}
            onFocus={e=>e.target.style.borderColor='#58a6ff'}
            onBlur={e=>e.target.style.borderColor='#21262d'}
          />
        </div>

        <button onClick={handleGo}
          disabled={tab==='join' && !joinInput.trim()}
          style={{ width:'100%', padding:'12px', borderRadius:'8px', background:'#1f6feb',
            border:'1px solid rgba(88,166,255,0.4)', color:'white', fontSize:'14px', fontWeight:700,
            cursor: tab==='join' && !joinInput.trim() ? 'not-allowed':'pointer',
            fontFamily:'inherit', transition:'all 0.2s', display:'flex', alignItems:'center',
            justifyContent:'center', gap:'8px',
            opacity: tab==='join' && !joinInput.trim() ? 0.5 : 1 }}
          onMouseEnter={e=>{if(!(tab==='join'&&!joinInput.trim())) e.currentTarget.style.background='#388bfd'}}
          onMouseLeave={e=>e.currentTarget.style.background='#1f6feb'}>
          {tab==='create' ? 'Create & Enter Room' : 'Join Room'}
          <ArrowRight size={16}/>
        </button>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   IDE
═══════════════════════════════════════════════════ */
export default function CodeCollab() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const monaco          = useMonaco();

  // Session
  const [hasJoined, setHasJoined]     = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeRoom, setActiveRoom]   = useState('');

  // Editor
  const [code, setCode]               = useState('');
  const [language, setLanguage]       = useState('python');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [wsStatus, setWsStatus]       = useState<'connecting'|'connected'|'disconnected'>('disconnected');
  const [remoteCursors, setRemoteCursors] = useState<Map<string, RemoteCursor>>(new Map());

  // UI
  const [copied, setCopied]           = useState(false);
  const [showReview, setShowReview]   = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState('');
  const [output, setOutput]           = useState<{text:string;type:'info'|'success'|'error'|'system'}[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [termH, setTermH]             = useState(220);
  const [isDragging, setIsDragging]   = useState(false);

  // Refs
  const socketRef      = useRef<Socket | null>(null);
  const editorRef      = useRef<any>(null);
  const monacoRef      = useRef<any>(null);
  const decorationsRef = useRef<any>(null);
  const terminalRef    = useRef<HTMLDivElement>(null);
  const dragStartY     = useRef(0);
  const dragStartH     = useRef(0);
  // Live refs to track current session (available in socket callbacks)
  const roomRef        = useRef<string>('');
  const userRef        = useRef<any>(null);

  // ─── Create socket ONCE on mount ──────────────────
  useEffect(() => {
    const socket = io('http://127.0.0.1:8000', {
      transports: ['websocket'],  // skip polling → instant connect
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 500,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[SOCKET] connected id=', socket.id);
      setWsStatus('connected');
      // Re-join if we already have a session (e.g. auto-reconnect after network drop)
      if (roomRef.current && userRef.current) {
        socket.emit('join_room', {
          roomId:   roomRef.current,
          userId:   userRef.current.id,
          userName: userRef.current.name,
        });
      }
    });
    socket.on('disconnect', () => { setWsStatus('disconnected'); setRemoteCursors(new Map()); });
    socket.on('connect_error', () => setWsStatus('disconnected'));

    socket.on('init_state', (data: any) => {
      setCode(data.code);
      setLanguage(data.language || 'python');
      if (data.cursors?.length) {
        setRemoteCursors(prev => {
          const m = new Map(prev);
          data.cursors.forEach((c: any) => m.set(c.userId, c));
          return m;
        });
      }
    });

    socket.on('presence', (data: { users: OnlineUser[] }) => {
      console.log('[SOCKET] presence:', data.users?.map(u => u.name));
      setOnlineUsers(data.users || []);
    });

    socket.on('code_update', (data: { code: string }) => { setCode(data.code); });
    socket.on('language_update', (data: { language: string }) => { setLanguage(data.language); });
    socket.on('cursor_update', (data: RemoteCursor) => {
      setRemoteCursors(prev => {
        const m = new Map(prev);
        m.set(data.userId, { ...data, color: data.color || cursorColor(data.userId) });
        return m;
      });
    });

    return () => { socket.disconnect(); };
  }, []);

  // ─── Keep refs in sync with state ─────────────────
  useEffect(() => { roomRef.current = activeRoom; }, [activeRoom]);
  useEffect(() => { userRef.current = currentUser; }, [currentUser]);

  // ─── Join room when session becomes ready ──────────
  useEffect(() => {
    if (!hasJoined || !currentUser || !activeRoom) return;
    const socket = socketRef.current;
    if (!socket) return;

    setWsStatus('connecting');
    const doJoin = () => {
      socket.emit('join_room', {
        roomId:   activeRoom,
        userId:   currentUser.id,
        userName: currentUser.name,
      });
      console.log('[SOCKET] join_room emitted, room=', activeRoom, 'user=', currentUser.name);
    };

    if (socket.connected) {
      doJoin();
    } else {
      // Wait for connection then join
      socket.once('connect', doJoin);
    }
  }, [hasJoined, activeRoom, currentUser]);

  // ─── Monaco cursor decorations ────────────────────
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const mn     = monacoRef.current;

    const decos: any[] = [];
    remoteCursors.forEach(c => {
      const color = c.color || cursorColor(c.userId);
      const styleId = `crs-${c.userId}`;
      if (!document.getElementById(styleId)) {
        const s = document.createElement('style');
        s.id = styleId;
        s.textContent = `
          .crs-label-${c.userId} {
            background: ${color}; color: #fff; font-size: 10px; padding: 1px 5px;
            border-radius: 3px 3px 3px 0; font-family:system-ui; pointer-events:none;
            margin-left: 2px; white-space: nowrap;
          }
          .crs-line-${c.userId} { background: ${color}18; }
        `;
        document.head.appendChild(s);
      }
      decos.push({
        range: new mn.Range(c.line, 1, c.line, 1),
        options: {
          isWholeLine: true,
          className: `crs-line-${c.userId}`,
          overviewRuler: { color, position: mn.editor.OverviewRulerLane.Right },
          before: {
            content: `\u200b`,
            inlineClassName: `crs-label-${c.userId}`,
            inlineClassNameAffectsLetterSpacing: false,
            attachedData: { label: c.userName },
          },
          after: {
            content: ` ${c.userName}`,
            inlineClassName: `crs-label-${c.userId}`,
          },
        },
      });
    });

    if (!decorationsRef.current) {
      decorationsRef.current = editor.createDecorationsCollection([]);
    }
    decorationsRef.current.set(decos);
  }, [remoteCursors]);

  // ─── Resize terminal ──────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setTermH(Math.min(500, Math.max(100, dragStartH.current + (dragStartY.current - e.clientY))));
    };
    const onUp = () => setIsDragging(false);
    if (isDragging) { window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); }
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDragging]);

  // ─── Handlers ─────────────────────────────────────
  const handleLobbyJoin = (room: string, name: string) => {
    let user = { id: 'dev_' + Math.random().toString(36).slice(2, 9), name };
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      if (stored.name === name) user = stored;
    } catch { /**/ }
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    setActiveRoom(room);
    setHasJoined(true);
    window.history.replaceState({}, '', `/code?room=${room}`);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setCode(value);
    socketRef.current?.emit('code_change', { roomId: activeRoom, code: value });
  };

  const handleEditorMount = (editor: any, mn: any) => {
    editorRef.current = editor;
    monacoRef.current = mn;
    editor.onDidChangeCursorPosition((e: any) => {
      if (!currentUser || !socketRef.current?.connected) return;
      socketRef.current.emit('cursor_move', {
        roomId:   activeRoom,
        userId:   currentUser.id,
        userName: currentUser.name,
        color:    cursorColor(currentUser.id),
        line:     e.position.lineNumber,
        column:   e.position.column,
      });
    });
  };

  const handleLangChange = (lang: string) => {
    setLanguage(lang);
    socketRef.current?.emit('language_change', { roomId: activeRoom, language: lang });
  };

  const addLine = (text: string, type: 'info'|'success'|'error'|'system' = 'info') =>
    setOutput(prev => [...prev, { text, type }]);

  const runCode = async () => {
    setShowTerminal(true); setOutput([]); setIsExecuting(true);
    addLine(`❯ Running ${LANGUAGES.find(l => l.id===language)?.name ?? language}...`, 'system');
    try {
      const res  = await fetch('http://127.0.0.1:8000/api/code/execute', {
        method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (data.timed_out) { addLine('❌ Timed out.', 'error'); return; }
      if (data.stdout?.trim()) data.stdout.split('\n').forEach((l: string) => l && addLine(l, 'info'));
      if (data.stderr?.trim()) data.stderr.split('\n').forEach((l: string) => l && addLine(l, 'error'));
      if (!data.stdout?.trim() && !data.stderr?.trim()) addLine('(no output)', 'system');
      addLine(data.exit_code===0 ? '✓ Exited 0' : `✗ Exit ${data.exit_code}`, data.exit_code===0?'success':'error');
    } catch { addLine('❌ Cannot reach server.', 'error'); }
    finally   { setIsExecuting(false); }
  };

  const triggerReview = async () => {
    setShowReview(true); setIsReviewing(true); setReviewResult('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/code/review', {
        method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ code, language }),
      });
      setReviewResult(res.ok ? (await res.json()).review : '**Error from AI Reviewer.**');
    } catch { setReviewResult('**Failed to reach server.**'); }
    finally   { setIsReviewing(false); }
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/code?room=${activeRoom}`);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const leaveRoom = () => {
    socketRef.current?.disconnect();
    socketRef.current?.connect();   // reconnect for future rooms
    setHasJoined(false); setOnlineUsers([]); setRemoteCursors(new Map());
    window.history.replaceState({}, '', '/code');
  };

  const currentLangInfo = LANGUAGES.find(l => l.id===language);
  const urlRoom = searchParams.get('room') ?? undefined;

  // ─── Lobby ────────────────────────────────────────
  if (!hasJoined) return <Lobby initialRoom={urlRoom} onJoin={handleLobbyJoin}/>;

  /* ─── IDE ─────────────────────────────────────────── */
  return (
    <div style={{ display:'flex', height:'100vh', background:'#0d1117',
      fontFamily:"'JetBrains Mono','Fira Code',monospace", color:'#c9d1d9', overflow:'hidden' }}>

      {/* Activity bar */}
      <div style={{ width:'48px', background:'#161b22', display:'flex', flexDirection:'column',
        alignItems:'center', padding:'8px 0', gap:'4px', borderRight:'1px solid #21262d', flexShrink:0 }}>
        <div onClick={()=>navigate('/dashboard')} title="Dashboard" style={{
          width:'36px',height:'36px',borderRadius:'8px',display:'flex',alignItems:'center',
          justifyContent:'center',cursor:'pointer',color:'#8b949e',transition:'all 0.15s'}}
          onMouseEnter={e=>(e.currentTarget.style.background='#21262d')}
          onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
          <Code size={18}/>
        </div>
        <div style={{width:'28px',height:'1px',background:'#21262d',margin:'4px 0'}}/>
        <div style={{width:'36px',height:'36px',borderRadius:'8px',display:'flex',alignItems:'center',
          justifyContent:'center',background:'rgba(88,166,255,0.15)',color:'#58a6ff',
          fontSize:'10px',fontWeight:700,border:'1px solid rgba(88,166,255,0.3)'}}>
          IDE
        </div>
      </div>

      {/* Sidebar */}
      <div style={{width:'220px',background:'#161b22',borderRight:'1px solid #21262d',
        display:'flex',flexDirection:'column',flexShrink:0,overflow:'hidden'}}>

        <div style={{padding:'12px 16px',borderBottom:'1px solid #21262d',
          display:'flex',alignItems:'center',gap:'8px'}}>
          <ChevronRight size={12} color="#58a6ff"/>
          <span style={{fontSize:'11px',fontWeight:700,letterSpacing:'0.08em',color:'#8b949e',textTransform:'uppercase'}}>
            Explorer
          </span>
        </div>

        <div style={{flex:1,overflow:'auto',padding:'12px 0'}}>
          {/* Room chip */}
          <div style={{padding:'4px 16px 12px'}}>
            <div style={{fontSize:'10px',color:'#6e7681',letterSpacing:'0.06em',marginBottom:'6px',textTransform:'uppercase'}}>
              Active Workspace
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'6px 8px',
              background:'rgba(88,166,255,0.1)',borderRadius:'6px',border:'1px solid rgba(88,166,255,0.2)'}}>
              <Hash size={12} color="#58a6ff"/>
              <span style={{flex:1,fontSize:'13px',color:'#58a6ff',fontWeight:700,letterSpacing:'1px',
                fontFamily:"'JetBrains Mono',monospace"}}>
                {activeRoom}
              </span>
              <button onClick={copyRoomLink} title="Copy invite link" style={{
                background:'none',border:'none',cursor:'pointer',
                color:copied?'#3fb950':'#6e7681',display:'flex',alignItems:'center',transition:'color 0.2s',padding:0}}>
                {copied ? <Check size={13}/> : <Link size={13}/>}
              </button>
            </div>
          </div>

          {/* File */}
          <div style={{padding:'0 16px 12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'6px 8px',
              borderRadius:'6px',background:'#0d1117',border:'1px solid #21262d'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',
                background:LANG_COLORS[language]||'#8b949e',flexShrink:0}}/>
              <span style={{fontSize:'12px',color:'#c9d1d9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                main{currentLangInfo?.ext||''}
              </span>
            </div>
          </div>

          {/* Collaborators */}
          <div style={{padding:'0 16px'}}>
            <div style={{fontSize:'10px',color:'#6e7681',letterSpacing:'0.06em',marginBottom:'8px',textTransform:'uppercase'}}>
              Online ({onlineUsers.length})
            </div>
            {onlineUsers.length === 0 && (
              <div style={{fontSize:'11px',color:'#484f58',fontStyle:'italic',paddingBottom:'8px'}}>
                Waiting for members...
              </div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
              {onlineUsers.map(u => {
                const isSelf = u.id === currentUser?.id;
                const color  = isSelf ? avatarColor(u.name) : cursorColor(u.id);
                const cur    = remoteCursors.get(u.id);
                return (
                  <div key={u.id} style={{display:'flex',alignItems:'center',gap:'8px',
                    padding:'5px 6px',borderRadius:'6px',transition:'background 0.15s'}}
                    onMouseEnter={e=>(e.currentTarget.style.background='#21262d')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <div style={{width:'26px',height:'26px',borderRadius:'50%',background:color,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:'11px',fontWeight:700,color:'#fff',flexShrink:0,position:'relative'}}>
                      {u.name.charAt(0).toUpperCase()}
                      <div style={{position:'absolute',bottom:-1,right:-1,width:'8px',height:'8px',
                        borderRadius:'50%',background:'#3fb950',border:'1.5px solid #161b22'}}/>
                    </div>
                    <div style={{overflow:'hidden',flex:1}}>
                      <div style={{fontSize:'11px',color:isSelf?'#58a6ff':'#c9d1d9',
                        whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontWeight:isSelf?600:400}}>
                        {u.name}{isSelf?' (you)':''}
                      </div>
                      {cur && !isSelf && (
                        <div style={{fontSize:'9px',color:'#484f58'}}>L{cur.line} C{cur.column}</div>
                      )}
                    </div>
                    {!isSelf && <div style={{width:'6px',height:'6px',borderRadius:'2px',background:color,flexShrink:0}}/>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:'10px 12px',borderTop:'1px solid #21262d',
          display:'flex',alignItems:'center',gap:'8px',background:'#0d1117'}}>
          <div style={{width:'28px',height:'28px',borderRadius:'50%',
            background:avatarColor(currentUser.name),display:'flex',alignItems:'center',
            justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#fff',flexShrink:0}}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div style={{overflow:'hidden',flex:1}}>
            <div style={{fontSize:'11px',fontWeight:600,color:'#e6edf3',
              overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {currentUser.name}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'4px',marginTop:'1px'}}>
              {wsStatus==='connected'
                ? <><Wifi size={9} color="#3fb950"/><span style={{fontSize:'9px',color:'#3fb950'}}>live</span></>
                : wsStatus==='connecting'
                  ? <><Loader2 size={9} color="#f0883e" style={{animation:'spin 1s linear infinite'}}/><span style={{fontSize:'9px',color:'#f0883e'}}>connecting</span></>
                  : <><WifiOff size={9} color="#f85149"/><span style={{fontSize:'9px',color:'#f85149'}}>offline</span></>}
            </div>
          </div>
          <button onClick={leaveRoom} title="Leave room" style={{
            background:'none',border:'none',cursor:'pointer',color:'#6e7681',
            fontSize:'10px',fontFamily:'inherit',padding:'3px 6px',borderRadius:'4px',
            fontWeight:600,transition:'all 0.15s'}}
            onMouseEnter={e=>{e.currentTarget.style.color='#f85149';e.currentTarget.style.background='rgba(248,81,73,0.1)'}}
            onMouseLeave={e=>{e.currentTarget.style.color='#6e7681';e.currentTarget.style.background='none'}}>
            Leave
          </button>
        </div>
      </div>

      {/* Main editor area */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>

        {/* Tab bar */}
        <div style={{height:'38px',background:'#161b22',borderBottom:'1px solid #21262d',
          display:'flex',alignItems:'stretch',flexShrink:0,overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'0 14px',
            borderRight:'1px solid #21262d',background:'#0d1117',borderBottom:'2px solid #58a6ff',
            color:'#c9d1d9',fontSize:'12px',whiteSpace:'nowrap'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:LANG_COLORS[language]||'#8b949e'}}/>
            main{currentLangInfo?.ext||''}
          </div>
          <div style={{flex:1}}/>
          <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'0 10px'}}>
            <div style={{display:'flex',gap:'3px'}}>
              {LANGUAGES.map(lang => (
                <button key={lang.id} onClick={()=>handleLangChange(lang.id)} style={{
                  padding:'3px 7px',borderRadius:'4px',fontFamily:'inherit',cursor:'pointer',
                  border: language===lang.id ? `1px solid ${LANG_COLORS[lang.id]}` : '1px solid transparent',
                  background: language===lang.id ? `${LANG_COLORS[lang.id]}22` : 'transparent',
                  color: language===lang.id ? LANG_COLORS[lang.id]||'#c9d1d9' : '#6e7681',
                  fontSize:'10px',transition:'all 0.15s',whiteSpace:'nowrap'}}>
                  {lang.name}
                </button>
              ))}
            </div>
            <div style={{width:'1px',height:'20px',background:'#21262d'}}/>
            <button onClick={runCode} disabled={isExecuting} style={{
              display:'flex',alignItems:'center',gap:'5px',padding:'4px 12px',borderRadius:'6px',
              border:'1px solid #2ea043',background:isExecuting?'rgba(46,160,67,0.1)':'rgba(46,160,67,0.15)',
              color:'#3fb950',fontSize:'11px',fontWeight:700,cursor:isExecuting?'not-allowed':'pointer',
              fontFamily:'inherit',transition:'all 0.15s',opacity:isExecuting?0.7:1}}
              onMouseEnter={e=>!isExecuting&&(e.currentTarget.style.background='rgba(46,160,67,0.25)')}
              onMouseLeave={e=>!isExecuting&&(e.currentTarget.style.background='rgba(46,160,67,0.15)')}>
              {isExecuting ? <><Loader2 size={11} style={{animation:'spin 1s linear infinite'}}/> Running</> : <><Play size={11} fill="#3fb950"/> Run</>}
            </button>
            <button onClick={triggerReview} style={{
              display:'flex',alignItems:'center',gap:'5px',padding:'4px 12px',borderRadius:'6px',
              border:'1px solid rgba(88,166,255,0.4)',background:'rgba(88,166,255,0.1)',
              color:'#58a6ff',fontSize:'11px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s'}}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(88,166,255,0.2)')}
              onMouseLeave={e=>(e.currentTarget.style.background='rgba(88,166,255,0.1)')}>
              <Sparkles size={11}/> AI Review
            </button>
          </div>
        </div>

        {/* Editor + Review */}
        <div style={{flex:1,display:'flex',overflow:'hidden',minHeight:0}}>
          <div style={{flex:1,position:'relative',display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{flex:1,overflow:'hidden'}}>
              <Editor
                height="100%" theme="vs-dark" language={language}
                value={code} onChange={handleEditorChange} onMount={handleEditorMount}
                options={{
                  minimap:{enabled:true}, fontSize:14, padding:{top:16},
                  scrollBeyondLastLine:false, smoothScrolling:true,
                  fontFamily:"'JetBrains Mono','Fira Code',monospace",
                  fontLigatures:true, wordWrap:'on', lineHeight:1.6,
                  renderLineHighlight:'all', cursorBlinking:'smooth',
                  cursorSmoothCaretAnimation:'on', overviewRulerBorder:false,
                  bracketPairColorization:{enabled:true},
                }}
              />
            </div>

            {showTerminal && (
              <div onMouseDown={e=>{setIsDragging(true);dragStartY.current=e.clientY;dragStartH.current=termH}}
                style={{height:'4px',background:isDragging?'#58a6ff':'transparent',
                  borderTop:'1px solid #21262d',cursor:'ns-resize',flexShrink:0,transition:'background 0.15s'}}
                onMouseEnter={e=>(e.currentTarget.style.background='rgba(88,166,255,0.4)')}
                onMouseLeave={e=>!isDragging&&(e.currentTarget.style.background='transparent')}/>
            )}

            {showTerminal && (
              <div style={{height:`${termH}px`,background:'#0d1117',borderTop:'1px solid #21262d',
                display:'flex',flexDirection:'column',flexShrink:0,overflow:'hidden'}}>
                <div style={{height:'34px',background:'#161b22',borderBottom:'1px solid #21262d',
                  display:'flex',alignItems:'center',flexShrink:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'0 14px',height:'100%',
                    borderRight:'1px solid #21262d',color:'#c9d1d9',fontSize:'11px',fontWeight:600,
                    borderBottom:'2px solid #58a6ff'}}>
                    <Terminal size={11} color="#58a6ff"/> TERMINAL
                  </div>
                  <div style={{flex:1}}/>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'0 12px'}}>
                    {isExecuting && <span style={{fontSize:'10px',color:'#f0883e',display:'flex',alignItems:'center',gap:'4px'}}>
                      <Loader2 size={10} style={{animation:'spin 1s linear infinite'}}/> executing...
                    </span>}
                    <button onClick={()=>setOutput([])} style={{background:'none',border:'none',cursor:'pointer',
                      color:'#6e7681',fontSize:'10px',fontFamily:'inherit',padding:'2px 6px',borderRadius:'4px',transition:'all 0.15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.color='#c9d1d9';e.currentTarget.style.background='#21262d'}}
                      onMouseLeave={e=>{e.currentTarget.style.color='#6e7681';e.currentTarget.style.background='none'}}>
                      clear
                    </button>
                    <button onClick={()=>setShowTerminal(false)} style={{background:'none',border:'none',cursor:'pointer',
                      color:'#6e7681',display:'flex',alignItems:'center',padding:'2px',borderRadius:'4px',transition:'color 0.15s'}}
                      onMouseEnter={e=>(e.currentTarget.style.color='#c9d1d9')}
                      onMouseLeave={e=>(e.currentTarget.style.color='#6e7681')}>
                      <X size={13}/>
                    </button>
                  </div>
                </div>
                <div ref={terminalRef} style={{flex:1,padding:'12px 16px',overflowY:'auto',
                  fontFamily:"'JetBrains Mono','Courier New',monospace",fontSize:'12.5px',lineHeight:1.7,
                  background:'#0d1117',userSelect:'text'}}>
                  {output.length===0
                    ? <span style={{color:'#484f58',fontStyle:'italic'}}>Press "Run" to execute your code.</span>
                    : output.map((ln,i)=>(
                        <div key={i} style={{
                          color:ln.type==='error'?'#f85149':ln.type==='success'?'#3fb950':ln.type==='system'?'#58a6ff':'#c9d1d9',
                          whiteSpace:'pre-wrap',wordBreak:'break-all'}}>
                          {ln.type==='system'&&<span style={{color:'#484f58'}}>❯ </span>}
                          {ln.text}
                        </div>
                      ))}
                </div>
              </div>
            )}

            {!showTerminal && (
              <div onClick={()=>setShowTerminal(true)} style={{height:'28px',background:'#161b22',
                borderTop:'1px solid #21262d',display:'flex',alignItems:'center',padding:'0 12px',
                gap:'8px',flexShrink:0,cursor:'pointer'}}>
                <Terminal size={11} color="#58a6ff"/>
                <span style={{fontSize:'10px',color:'#58a6ff',fontWeight:600}}>TERMINAL</span>
                <span style={{fontSize:'10px',color:'#484f58'}}>click to open</span>
              </div>
            )}
          </div>

          {/* AI Review pane */}
          {showReview && (
            <div style={{width:'380px',background:'#161b22',borderLeft:'1px solid #21262d',
              display:'flex',flexDirection:'column',flexShrink:0,animation:'slideIn 0.2s ease-out'}}>
              <div style={{height:'38px',borderBottom:'1px solid #21262d',display:'flex',alignItems:'center',
                padding:'0 14px',gap:'8px',background:'#0d1117',flexShrink:0}}>
                <Bot size={13} color="#58a6ff"/>
                <span style={{fontSize:'11px',fontWeight:700,color:'#58a6ff',letterSpacing:'0.06em',flex:1}}>
                  AI CODE REVIEW
                </span>
                <button onClick={()=>setShowReview(false)} style={{background:'none',border:'none',cursor:'pointer',
                  color:'#6e7681',display:'flex',alignItems:'center',padding:'2px',borderRadius:'4px',transition:'color 0.15s'}}
                  onMouseEnter={e=>(e.currentTarget.style.color='#f85149')}
                  onMouseLeave={e=>(e.currentTarget.style.color='#6e7681')}>
                  <X size={14}/>
                </button>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'16px',fontSize:'12.5px',lineHeight:1.7,color:'#c9d1d9'}}>
                {isReviewing ? (
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:'12px'}}>
                    <div style={{width:'32px',height:'32px',border:'2px solid #21262d',borderTopColor:'#58a6ff',
                      borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
                    <span style={{color:'#58a6ff',fontSize:'11px'}}>Analyzing code...</span>
                  </div>
                ) : (
                  <div style={{fontFamily:'system-ui,sans-serif',fontSize:'13px',lineHeight:1.7}}>
                    <ReactMarkdown components={{
                      h1:({children})=><h1 style={{color:'#e6edf3',fontSize:'16px',fontWeight:600,margin:'16px 0 8px'}}>{children}</h1>,
                      h2:({children})=><h2 style={{color:'#e6edf3',fontSize:'14px',fontWeight:600,margin:'14px 0 6px'}}>{children}</h2>,
                      h3:({children})=><h3 style={{color:'#8b949e',fontSize:'13px',fontWeight:600,margin:'12px 0 4px'}}>{children}</h3>,
                      p:({children})=><p style={{margin:'0 0 10px'}}>{children}</p>,
                      code:({children,className})=>{
                        const block=className?.startsWith('language-');
                        return block
                          ? <code style={{display:'block',background:'#0d1117',padding:'10px 14px',borderRadius:'6px',
                              fontSize:'12px',color:'#a5d6ff',border:'1px solid #21262d',whiteSpace:'pre-wrap',
                              fontFamily:"'JetBrains Mono',monospace",margin:'4px 0 10px'}}>{children}</code>
                          : <code style={{background:'#21262d',padding:'1px 5px',borderRadius:'4px',fontSize:'11px',
                              color:'#a5d6ff',fontFamily:"'JetBrains Mono',monospace"}}>{children}</code>;},
                      pre:({children})=><pre style={{background:'#0d1117',borderRadius:'6px',margin:'8px 0',border:'1px solid #21262d',overflow:'auto'}}>{children}</pre>,
                      ul:({children})=><ul style={{paddingLeft:'20px',margin:'4px 0 10px'}}>{children}</ul>,
                      li:({children})=><li style={{marginBottom:'4px'}}>{children}</li>,
                      strong:({children})=><strong style={{color:'#e6edf3',fontWeight:600}}>{children}</strong>,
                    }}>{reviewResult}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,height:'22px',background:'#1f6feb',
        display:'flex',alignItems:'center',padding:'0 12px',gap:'12px',zIndex:100}}>
        <span style={{fontSize:'11px',color:'rgba(255,255,255,0.9)',display:'flex',alignItems:'center',gap:'4px'}}>
          {wsStatus==='connected'
            ? <><CheckCircle2 size={10}/> {activeRoom}</>
            : wsStatus==='connecting'
              ? <><Loader2 size={10} style={{animation:'spin 1s linear infinite'}}/> Connecting...</>
              : <><AlertCircle size={10}/> Offline</>}
        </span>
        <div style={{flex:1}}/>
        {remoteCursors.size>0 && (
          <span style={{fontSize:'11px',color:'rgba(255,255,255,0.8)',display:'flex',alignItems:'center',gap:'8px'}}>
            {Array.from(remoteCursors.values()).map(c=>(
              <span key={c.userId} style={{display:'flex',alignItems:'center',gap:'3px'}}>
                <div style={{width:'6px',height:'6px',borderRadius:'50%',background:c.color||cursorColor(c.userId)}}/>
                {c.userName} L{c.line}
              </span>
            ))}
          </span>
        )}
        <span style={{fontSize:'11px',color:'rgba(255,255,255,0.7)',display:'flex',alignItems:'center',gap:'4px'}}>
          <Users size={10}/> {onlineUsers.length} online
        </span>
        <span style={{fontSize:'11px',color:'rgba(255,255,255,0.7)',display:'flex',alignItems:'center',gap:'4px'}}>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',background:LANG_COLORS[language]||'#fff'}}/>
          {currentLangInfo?.name}
        </span>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform:translateX(100%);opacity:0 } to { transform:translateX(0);opacity:1 } }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:6px;height:6px; }
        ::-webkit-scrollbar-track  { background:#0d1117; }
        ::-webkit-scrollbar-thumb  { background:#21262d;border-radius:3px; }
        ::-webkit-scrollbar-thumb:hover { background:#30363d; }
      `}</style>
    </div>
  );
}