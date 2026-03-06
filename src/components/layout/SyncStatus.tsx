import React, { useState } from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle2, LogOut, User, Shield } from 'lucide-react';
import { useApp, type SyncStatus } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';
import './SyncStatus.css';

const SyncStatusBar: React.FC = () => {
  const { syncStatus, syncError } = useApp();
  const { user, isAnonymous, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const iconMap: Record<SyncStatus, React.ReactNode> = {
    loading:  <RefreshCw size={12} className="spin" />,
    syncing:  <RefreshCw size={12} className="spin" />,
    synced:   <CheckCircle2 size={12} />,
    offline:  <CloudOff size={12} />,
    error:    <AlertCircle size={12} />,
  };

  const labelMap: Record<SyncStatus, string> = {
    loading: 'Connecting…',
    syncing: 'Saving…',
    synced:  'Synced',
    offline: 'Offline',
    error:   'Sync error',
  };

  return (
    <>
      <div className="sync-status-bar">
        {/* Sync indicator */}
        <div className={`sync-pill sync-${syncStatus}`} title={syncError ?? labelMap[syncStatus]}>
          {iconMap[syncStatus]}
          <span>{labelMap[syncStatus]}</span>
        </div>

        {/* Account button */}
        <div className="account-wrap">
          <button
            className={`account-btn ${isAnonymous ? 'anonymous' : 'authenticated'}`}
            onClick={() => setShowMenu((p) => !p)}
            title={isAnonymous ? 'Anonymous session — click to save account' : user?.email ?? 'Account'}
          >
            {isAnonymous ? <User size={13} /> : <Shield size={13} />}
          </button>

          {showMenu && (
            <div className="account-menu">
              <div className="account-menu-header">
                {isAnonymous ? (
                  <>
                    <div className="account-menu-name">Anonymous session</div>
                    <div className="account-menu-uid mono">{user?.uid?.slice(0, 12)}…</div>
                    <div className="account-menu-warn">Your data is temporary. Save it.</div>
                  </>
                ) : (
                  <>
                    <div className="account-menu-name">{user?.email}</div>
                    <div className="account-menu-uid mono">Cloud sync active</div>
                  </>
                )}
              </div>
              <div className="account-menu-divider" />
              {isAnonymous && (
                <button className="account-menu-item primary" onClick={() => { setShowMenu(false); setShowAuth(true); }}>
                  <Shield size={13} /> Save Account
                </button>
              )}
              {!isAnonymous && (
                <button className="account-menu-item" onClick={() => { setShowMenu(false); setShowAuth(true); }}>
                  <User size={13} /> Account Settings
                </button>
              )}
              <button className="account-menu-item danger" onClick={() => { setShowMenu(false); signOut(); }}>
                <LogOut size={13} /> Sign Out
              </button>
              <div className="account-menu-note">
                Signing out creates a new anonymous session.
              </div>
            </div>
          )}
        </div>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          defaultMode={isAnonymous ? 'upgrade' : 'signin'}
        />
      )}
    </>
  );
};

export default SyncStatusBar;
