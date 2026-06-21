import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Hash, Users, Plus, X,
  Settings, User as UserIcon, Send, Search, Bell, Edit2, Trash2, PlusCircle, Paperclip
} from 'lucide-react';
import '../index.css';
import '../community.css';
import DiscordSettings from '../components/chat/DiscordSettings';

interface Server {
  id: string;
  name: string;
  initials: string;
  isActive?: boolean;
}

interface Channel {
  id: string;
  server_id: string;
  name: string;
  type: string;
}

interface Message {
  _id: string;
  sender_name: string;
  sender_id: string;
  content: string;
  attachment_url?: string;
  timestamp: string;
  is_system?: boolean;
  edited?: boolean;
}

interface OnlineUser {
  id: string;
  name: string;
}

const Community = () => {
    const [servers, setServers] = useState<Server[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [activeServer, setActiveServer] = useState<string>("");
    const [activeChannel, setActiveChannel] = useState<string>("");
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    
    // User Identity Logic
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [nameInput, setNameInput] = useState("");

    // Modals state
    const [showServerModal, setShowServerModal] = useState(false);
    const [newServerName, setNewServerName] = useState("");
    const [showChannelModal, setShowChannelModal] = useState(false);
    const [newChannelName, setNewChannelName] = useState("");
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Edit message state
    const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load initial user
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    const fetchServers = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/community/servers`);
            if (res.ok) {
                const data = await res.json();
                setServers(data);
                if (data.length > 0 && !activeServer) {
                    setActiveServer(data[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch servers", error);
        }
    };

    const fetchChannels = useCallback(async () => {
        if (!activeServer) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/community/channels/${activeServer}`);
            if (res.ok) {
                const data = await res.json();
                setChannels(data);
                if (data.length > 0) {
                    setActiveChannel(data[0].id);
                } else {
                    setActiveChannel("");
                }
            }
        } catch (error) {
            console.error("Failed to fetch channels", error);
        }
    }, [activeServer]);

    const fetchMessages = useCallback(async () => {
        if (!activeChannel) return;
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/community/messages/${activeChannel}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                scrollToBottom();
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    }, [activeChannel]);

    useEffect(() => {
        if (currentUser) fetchServers();
    }, [currentUser]);

    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // WebSocket Connection handling
    useEffect(() => {
        if (!currentUser || !activeChannel) return;

        if (wsRef.current) wsRef.current.close();

        const wsUrl = `ws://127.0.0.1:8000/api/ws/community/${activeChannel}/${currentUser.id}/${encodeURIComponent(currentUser.name)}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (payload.type === 'message') {
                setMessages((prev) => [...prev, payload.data]);
                scrollToBottom();
            } else if (payload.type === 'presence') {
                setOnlineUsers(payload.data.users || []);
            } else if (payload.type === 'message_edit') {
                setMessages((prev) => prev.map(m => m._id === payload.data._id ? { ...m, content: payload.data.content, edited: true } : m));
            } else if (payload.type === 'message_delete') {
                setMessages((prev) => prev.filter(m => m._id !== payload.data._id));
            }
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };
    }, [activeChannel, currentUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (nameInput.trim().length > 2) {
            const newUser = {
                id: "user_" + Math.random().toString(36).substr(2, 9),
                name: nameInput.trim(),
                username: nameInput.trim().toLowerCase().replace(/\s+/g, '_')
            };
            localStorage.setItem("user", JSON.stringify(newUser));
            setCurrentUser(newUser);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        let attachment_url = null;
        if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);
            try {
                const res = await fetch("http://127.0.0.1:8000/api/community/upload", {
                    method: "POST",
                    body: formData
                });
                if (res.ok) {
                    const data = await res.json();
                    attachment_url = data.url;
                }
            } catch (error) {
                console.error("Upload failed", error);
            }
        }

        wsRef.current.send(JSON.stringify({ content: newMessage, attachment_url }));
        setNewMessage("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDeleteMessage = async (msgId: string) => {
        if (!currentUser) return;
        try {
            await fetch(`http://127.0.0.1:8000/api/community/messages/${msgId}?user_id=${currentUser.id}`, { method: 'DELETE' });
        } catch (e) { console.error(e); }
    };

    const handleEditMessageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !editingMsgId || !editContent.trim()) return;
        try {
            await fetch(`http://127.0.0.1:8000/api/community/messages/${editingMsgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent, user_id: currentUser.id })
            });
            setEditingMsgId(null);
            setEditContent("");
        } catch (e) { console.error(e); }
    };

    const handleCreateServer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newServerName.trim()) {
            const initials = newServerName.substring(0, 2).toUpperCase();
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/community/servers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newServerName.trim(), initials })
                });
                if (res.ok) {
                    const serv = await res.json();
                    setServers([...servers, serv]);
                    setActiveServer(serv.id);
                    setShowServerModal(false);
                    setNewServerName("");
                }
            } catch (e) {}
        }
    };

    const handleCreateChannel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newChannelName.trim() && activeServer) {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/community/channels`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newChannelName.trim().replace(/\s+/g, '-').toLowerCase(), server_id: activeServer })
                });
                if (res.ok) {
                    const chan = await res.json();
                    setChannels([...channels, chan]);
                    setActiveChannel(chan.id);
                    setShowChannelModal(false);
                    setNewChannelName("");
                }
            } catch (e) {}
        }
    };

    const handleUpdateProfile = (updatedProps: any) => {
        if (currentUser) {
            const updated = { ...currentUser, ...updatedProps };
            localStorage.setItem("user", JSON.stringify(updated));
            setCurrentUser(updated);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        setCurrentUser(null);
        setShowSettingsModal(false);
    };

    if (!currentUser) {
        return (
            <div className="community-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div className="glass-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', background: '#313338' }}>
                    <h2 style={{ marginBottom: '1rem', color: '#f2f3f5' }}>Welcome back!</h2>
                    <p style={{ color: '#b5bac1', marginBottom: '2rem' }}>We're so excited to see you again!</p>
                    <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                        <label style={{color: '#b5bac1', fontSize: '12px', fontWeight: 'bold'}}>DISPLAY NAME <span style={{color: '#f23f43'}}>*</span></label>
                        <input 
                            type="text" 
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            style={{ 
                                padding: '10px 12px', background: '#1e1f22', border: 'none', 
                                borderRadius: '4px', color: '#dbdee1', fontSize: '1rem', outline: 'none'
                            }}
                            autoFocus
                        />
                        <button type="submit" className="ds-btn-primary" style={{width: '100%'}} disabled={nameInput.trim().length < 3}>
                            Continue
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="community-layout relative">
            {/* Servers Sidebar */}
            <div className="servers-sidebar">
                <div className="server-icon" style={{background: '#5865F2', color: 'white', marginBottom: '8px'}} title="Direct Messages">
                    <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" alt="Discord" style={{width: '28px', filter: 'brightness(0) invert(1)'}} />
                </div>
                <div style={{width: '32px', height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '1px', marginBottom: '8px'}}></div>
                
                {servers.map((server) => (
                    <div 
                        key={server.id} 
                        className={`server-icon ${activeServer === server.id ? 'active' : ''}`}
                        title={server.name}
                        onClick={() => setActiveServer(server.id)}
                    >
                        {activeServer === server.id && <div className="server-pill"></div>}
                        {server.initials}
                    </div>
                ))}
                <div className="server-icon add-server" title="Add Server" onClick={() => setShowServerModal(true)}>
                    <Plus size={24} style={{color: '#23a559'}} />
                </div>
            </div>

            {/* Channels Sidebar */}
            <div className="channels-sidebar">
                <div className="channels-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2>{servers.find(s => s.id === activeServer)?.name || "Community"}</h2>
                </div>
                <div className="channels-list">
                    <div className="channel-category" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '8px'}}>
                        TEXT CHANNELS
                        <Plus size={14} style={{cursor: 'pointer'}} onClick={() => setShowChannelModal(true)} />
                    </div>
                    {channels.map((channel) => (
                        <div 
                            key={channel.id} 
                            className={`channel-item ${activeChannel === channel.id ? 'active' : ''}`}
                            onClick={() => {
                                setMessages([]); 
                                setActiveChannel(channel.id);
                            }}
                        >
                            <Hash size={18} style={{opacity: 0.6}} />
                            {channel.name}
                        </div>
                    ))}
                </div>
                
                {/* User Info Footer */}
                <div className="user-controls">
                    <div className="user-avatar" title="Click to view profile">
                        {currentUser.name.charAt(0).toUpperCase()}
                        <div className="ds-status-dot"></div>
                    </div>
                    <div className="user-info">
                        <p className="user-name">{currentUser.name}</p>
                        <p className="user-status">{currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, '_')}</p>
                    </div>
                    <Settings size={20} className="settings-icon" onClick={() => setShowSettingsModal(true)} />
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-area">
                <div className="chat-header">
                    <div className="header-left">
                        <Hash size={24} className="header-icon" />
                        <h2>{channels.find(c => c.id === activeChannel)?.name || "Select a channel"}</h2>
                    </div>
                    <div className="header-right">
                        {/* New Post Button simulation */}
                        <div style={{background: '#5865F2', borderRadius: '4px', padding: '4px 8px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer'}}>
                            <Plus size={14} /> New Post
                        </div>
                        <div className="search-bar">
                            <input type="text" placeholder="Search" />
                            <Search size={16} />
                        </div>
                        <Bell size={20} className="header-icon" />
                        <Users size={20} className="header-icon" />
                    </div>
                </div>

                <div className="chat-messages">
                    {!activeChannel ? (
                        <div className="empty-chat animate-fade-in" style={{textAlign: 'center', opacity: 0.5}}>
                            <h2>Create or select a channel</h2>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="empty-chat animate-fade-in">
                            <div style={{width: 68, height: 68, borderRadius: '50%', background: '#4e5058', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16}}>
                                <Hash size={40} color="white" />
                            </div>
                            <h2>Welcome to #{channels.find(c => c.id === activeChannel)?.name}!</h2>
                            <p>This is the start of the #{channels.find(c => c.id === activeChannel)?.name} channel.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            if (msg.is_system) {
                                return (
                                    <div key={msg._id || idx} style={{ 
                                        display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0', 
                                        color: '#949ba4', fontSize: '0.85rem' 
                                    }}>
                                        <div style={{flex: 1, height: '1px', background: '#3f4147'}}></div>
                                        <span>{msg.content}</span>
                                        <div style={{flex: 1, height: '1px', background: '#3f4147'}}></div>
                                    </div>
                                );
                            }

                            const date = new Date(msg.timestamp);
                            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const prevMsg = messages[idx - 1];
                            const showHeader = idx === 0 || prevMsg.is_system || prevMsg.sender_id !== msg.sender_id;
                            const isMine = msg.sender_id === currentUser.id;

                            return (
                                <div key={msg._id || idx} className={`message-item community-msg-row ${showHeader ? 'mt-4' : 'mt-1'}`}>
                                    {showHeader ? (
                                        <div className="message-avatar">
                                            {msg.sender_name.charAt(0).toUpperCase()}
                                        </div>
                                    ) : <div style={{width: 40}}></div>}
                                    
                                    <div className="message-content">
                                        {showHeader && (
                                            <div className="message-header">
                                                <span className="sender">{msg.sender_name}</span>
                                                <span className="time">{timeStr}</span>
                                            </div>
                                        )}
                                        {editingMsgId === msg._id ? (
                                            <form onSubmit={handleEditMessageSubmit} style={{display: 'flex', gap: '8px', marginTop: '4px', width: '100%'}}>
                                                <input 
                                                    className="edit-input" 
                                                    value={editContent} 
                                                    onChange={e => setEditContent(e.target.value)} 
                                                    autoFocus 
                                                />
                                            </form>
                                        ) : (
                                            <div className="text" style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                    {msg.content}
                                                    {msg.edited && <span style={{fontSize: '0.7rem', color: '#949ba4'}}>(edited)</span>}
                                                </div>
                                                {msg.attachment_url && (
                                                    <a href={msg.attachment_url} target="_blank" rel="noreferrer">
                                                        <img src={msg.attachment_url} alt="attachment" className="msg-attachment" />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Menu overlay on hover */}
                                    {isMine && !editingMsgId && (
                                        <div className="msg-actions">
                                            <Edit2 size={16} onClick={() => { setEditingMsgId(msg._id); setEditContent(msg.content); }} />
                                            <Trash2 size={16} className="danger-icon" onClick={() => handleDeleteMessage(msg._id)} />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-container">
                    {selectedFile && (
                        <div className="file-preview">
                            <span style={{color: '#dbdee1', fontSize: '0.85rem', flex: 1}}>{selectedFile.name}</span>
                            <X size={16} onClick={() => setSelectedFile(null)} style={{cursor: 'pointer', color: '#949ba4'}} />
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="chat-form">
                        <div className="file-upload-btn" onClick={() => fileInputRef.current?.click()}>
                            <PlusCircle size={24} />
                        </div>
                        <input type="file" ref={fileInputRef} style={{display: 'none'}} onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} accept="image/*" />
                        
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={activeChannel ? `Message #${channels.find(c => c.id === activeChannel)?.name}` : "Select a channel to chat"}
                            disabled={!activeChannel}
                            autoFocus
                        />
                        <button type="submit" disabled={(!newMessage.trim() && !selectedFile) || !activeChannel} className="send-btn" style={{display: 'none'}}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Members Sidebar */}
            <div className="members-sidebar">
                <div className="member-category">ONLINE — {onlineUsers.length}</div>
                {onlineUsers.map(user => (
                    <div className="member-item" key={user.id}>
                        <div className="member-avatar">
                            {user.name.charAt(0).toUpperCase()}
                            <div className="ds-status-dot"></div>
                        </div>
                        <div className="member-name">{user.name}</div>
                    </div>
                ))}
            </div>

            {/* Settings System */}
            {showSettingsModal && (
                <DiscordSettings 
                    currentUser={currentUser} 
                    onClose={() => setShowSettingsModal(false)}
                    onUpdate={handleUpdateProfile}
                    onLogout={handleLogout}
                />
            )}

            {/* Create Server Model */}
            {showServerModal && (
                <div className="modal-backdrop">
                    <div className="glass-card modal-content" style={{background: '#313338', color: '#dbdee1', padding: '0'}}>
                        <div style={{padding: '24px', textAlign: 'center'}}>
                            <h2 style={{color: '#f2f3f5', marginBottom: '8px'}}>Customize your server</h2>
                            <p style={{color: '#b5bac1', fontSize: '14px', marginBottom: '24px'}}>Give your new server a personality with a name. You can always change it later.</p>
                            <form onSubmit={handleCreateServer}>
                                <div style={{textAlign: 'left', marginBottom: '8px'}}>
                                    <label style={{color: '#b5bac1', fontSize: '12px', fontWeight: 'bold'}}>SERVER NAME</label>
                                </div>
                                <input 
                                    className="modal-input" 
                                    placeholder="Server Name" 
                                    value={newServerName} 
                                    onChange={e => setNewServerName(e.target.value)} 
                                    autoFocus
                                    style={{background: '#1e1f22'}}
                                />
                            </form>
                        </div>
                        <div className="modal-footer" style={{background: '#2b2d31', padding: '16px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', marginTop: 0, justifyContent: 'space-between', alignItems: 'center'}}>
                            <span style={{cursor: 'pointer'}} onClick={() => setShowServerModal(false)}>Back</span>
                            <button className="ds-btn-primary" onClick={handleCreateServer} disabled={!newServerName.trim()}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            {showChannelModal && (
                <div className="modal-backdrop">
                    <div className="glass-card modal-content" style={{background: '#313338', color: '#dbdee1'}}>
                        <div className="modal-header">
                            <h3>Create Text Channel</h3>
                            <X size={20} onClick={() => setShowChannelModal(false)} style={{cursor: 'pointer'}} />
                        </div>
                        <form onSubmit={handleCreateChannel}>
                            <input 
                                className="modal-input" 
                                placeholder="new-channel" 
                                value={newChannelName} 
                                onChange={e => setNewChannelName(e.target.value)} 
                                autoFocus
                                style={{background: '#1e1f22'}}
                            />
                            <div className="modal-footer" style={{marginTop: '24px'}}>
                                <button type="button" className="ds-btn-text" style={{marginRight: '8px'}} onClick={() => setShowChannelModal(false)}>Cancel</button>
                                <button type="submit" className="ds-btn-primary" disabled={!newChannelName.trim()}>Create Channel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Community;
