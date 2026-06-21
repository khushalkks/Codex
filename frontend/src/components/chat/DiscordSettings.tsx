import React, { useState } from 'react';
import { X, LogOut } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
}

interface Props {
  currentUser: any;
  onClose: () => void;
  onUpdate: (user: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export default function DiscordSettings({ currentUser, onClose, onUpdate, onLogout }: Props) {
  // Mock full profile loading from currentUser
  const [profile, setProfile] = useState<UserProfile>({
    id: currentUser.id,
    name: currentUser.name,
    username: currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, '_'),
    email: currentUser.email || 'hidden@gmail.com',
    phone: currentUser.phone || ''
  });

  const [editMode, setEditMode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleEditClick = (field: keyof UserProfile) => {
    setEditMode(field);
    setEditValue(profile[field]);
  };

  const handleSave = (field: keyof UserProfile) => {
    const updated = { ...profile, [field]: editValue };
    setProfile(updated);
    onUpdate(updated);
    setEditMode(null);
  };

  return (
    <div className="discord-settings-overlay">
      <div className="ds-sidebar">
        <div className="ds-sidebar-content">
          <div className="ds-sidebar-group">
            <h4>User Settings</h4>
            <div className="ds-sidebar-item active">My Account</div>
            <div className="ds-sidebar-item">Profiles</div>
            <div className="ds-sidebar-item">Privacy & Safety</div>
            <div className="ds-sidebar-item">Family Center</div>
            <div className="ds-sidebar-item">Authorized Apps</div>
            <div className="ds-sidebar-item">Devices</div>
            <div className="ds-sidebar-item">Connections</div>
            <div className="ds-sidebar-item">Clips</div>
          </div>
          
          <div className="ds-divider"></div>
          
          <div className="ds-sidebar-group">
            <h4>App Settings</h4>
            <div className="ds-sidebar-item">Appearance <span className="ds-badge">NEW</span></div>
            <div className="ds-sidebar-item">Accessibility</div>
            <div className="ds-sidebar-item">Voice & Video</div>
          </div>

          <div className="ds-divider"></div>
          
          <div className="ds-sidebar-item ds-logout" onClick={onLogout}>
            <LogOut size={16} />
            Log Out
          </div>
        </div>
      </div>

      <div className="ds-main">
        <div className="ds-main-content">
          <div className="ds-header">
            <h2>My Account</h2>
            <div className="ds-close-btn" onClick={onClose}>
              <X size={24} />
              <span>ESC</span>
            </div>
          </div>

          <div className="ds-card">
            <div className="ds-banner" style={{background: 'linear-gradient(to right, #7b3e19, #aa5b2b)'}}></div>
            <div className="ds-card-header">
              <div className="ds-avatar-wrapper">
                <div className="ds-avatar lg">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="ds-status-dot lg"></div>
              </div>
              <div className="ds-user-header-info">
                <h3>{profile.name}</h3>
                <span className="ds-username-tag">{profile.username}</span>
              </div>
              <button className="ds-btn-primary" onClick={() => handleEditClick('name')}>Edit User Profile</button>
            </div>

            <div className="ds-info-grid">
              
              <div className="ds-info-row">
                <div className="ds-info-details">
                  <span className="ds-label">DISPLAY NAME</span>
                  {editMode === 'name' ? (
                    <div style={{display: 'flex', gap: '8px', marginTop: '4px'}}>
                      <input className="ds-input" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus />
                      <button className="ds-btn-small" onClick={() => handleSave('name')}>Save</button>
                      <button className="ds-btn-text" onClick={() => setEditMode(null)}>Cancel</button>
                    </div>
                  ) : (
                    <span className="ds-value">{profile.name}</span>
                  )}
                </div>
                {editMode !== 'name' && <button className="ds-btn-secondary" onClick={() => handleEditClick('name')}>Edit</button>}
              </div>

              <div className="ds-info-row">
                <div className="ds-info-details">
                  <span className="ds-label">USERNAME</span>
                  {editMode === 'username' ? (
                    <div style={{display: 'flex', gap: '8px', marginTop: '4px'}}>
                      <input className="ds-input" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus />
                      <button className="ds-btn-small" onClick={() => handleSave('username')}>Save</button>
                      <button className="ds-btn-text" onClick={() => setEditMode(null)}>Cancel</button>
                    </div>
                  ) : (
                    <span className="ds-value">{profile.username}</span>
                  )}
                </div>
                {editMode !== 'username' && <button className="ds-btn-secondary" onClick={() => handleEditClick('username')}>Edit</button>}
              </div>

              <div className="ds-info-row">
                <div className="ds-info-details">
                  <span className="ds-label">EMAIL</span>
                  {editMode === 'email' ? (
                    <div style={{display: 'flex', gap: '8px', marginTop: '4px'}}>
                      <input className="ds-input" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus />
                      <button className="ds-btn-small" onClick={() => handleSave('email')}>Save</button>
                      <button className="ds-btn-text" onClick={() => setEditMode(null)}>Cancel</button>
                    </div>
                  ) : (
                    <span className="ds-value">{profile.email.replace(/(.{2})(.*)(?=@)/, '$1***')} <a href="#" className="ds-link">Reveal</a></span>
                  )}
                </div>
                {editMode !== 'email' && <button className="ds-btn-secondary" onClick={() => handleEditClick('email')}>Edit</button>}
              </div>

              <div className="ds-info-row">
                <div className="ds-info-details">
                  <span className="ds-label">PHONE NUMBER</span>
                  {editMode === 'phone' ? (
                    <div style={{display: 'flex', gap: '8px', marginTop: '4px'}}>
                      <input className="ds-input" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus />
                      <button className="ds-btn-small" onClick={() => handleSave('phone')}>Save</button>
                      <button className="ds-btn-text" onClick={() => setEditMode(null)}>Cancel</button>
                    </div>
                  ) : (
                    <span className="ds-value">{profile.phone || "You haven't added a phone number yet."}</span>
                  )}
                </div>
                {editMode !== 'phone' && <button className="ds-btn-secondary" onClick={() => handleEditClick('phone')}>{profile.phone ? "Edit" : "Add"}</button>}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
