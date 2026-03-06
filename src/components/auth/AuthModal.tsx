import React, { useState } from 'react';
import {
  X, Mail, Lock, LogIn, UserPlus, Shield,
  Settings, CheckCircle2, Send, KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AuthModalMode = 'signin' | 'signup' | 'upgrade' | 'settings';

interface AuthModalProps {
  onClose: () => void;
  defaultMode?: AuthModalMode;
}

// ─── Google SVG Icon ───────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ─── Settings View ─────────────────────────────────────────────────────────────

const SettingsView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, sendPasswordReset, signOut, authError, clearAuthError } = useAuth();
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const providers = user?.providerData.map((p) => p.providerId) ?? [];
  const hasGoogle = providers.includes('google.com');
  const hasEmail  = providers.includes('password');
  const email     = user?.email ?? user?.providerData[0]?.email ?? '';

  const handlePasswordReset = async () => {
    if (!email) return;
    clearAuthError();
    setResetLoading(true);
    try {
      await sendPasswordReset(email);
      setResetSent(true);
    } catch {
      // authError set by context
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <>
      <div className="modal-header">
        <div className="auth-modal-icon"><Settings size={20} /></div>
        <button className="btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      <h2 className="auth-modal-title">Account Settings</h2>

      {/* Account info */}
      <div className="settings-section">
        <div className="settings-label">Signed in as</div>
        <div className="settings-email">{email}</div>
      </div>

      {/* Connected providers */}
      <div className="settings-section">
        <div className="settings-label">Connected accounts</div>
        <div className="provider-list">
          <div className={`provider-row ${hasGoogle ? 'linked' : 'unlinked'}`}>
            <GoogleIcon />
            <span>Google</span>
            {hasGoogle
              ? <span className="provider-status linked-badge"><CheckCircle2 size={11} /> Connected</span>
              : <span className="provider-status unlinked-badge">Not connected</span>}
          </div>
          <div className={`provider-row ${hasEmail ? 'linked' : 'unlinked'}`}>
            <Mail size={15} />
            <span>Email / Password</span>
            {hasEmail
              ? <span className="provider-status linked-badge"><CheckCircle2 size={11} /> Connected</span>
              : <span className="provider-status unlinked-badge">Not connected</span>}
          </div>
        </div>
      </div>

      {/* Password reset */}
      {hasEmail && (
        <div className="settings-section">
          <div className="settings-label">Password</div>
          {resetSent ? (
            <div className="settings-success">
              <Send size={13} /> Reset email sent to {email}
            </div>
          ) : (
            <button
              className="btn btn-ghost btn-sm settings-action-btn"
              onClick={handlePasswordReset}
              disabled={resetLoading}
            >
              <KeyRound size={13} />
              {resetLoading ? 'Sending…' : 'Send password reset email'}
            </button>
          )}
        </div>
      )}

      {authError && <div className="auth-error">{authError}</div>}

      <div className="settings-footer">
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-danger btn-sm" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </>
  );
};

// ─── Auth Form (sign-in / sign-up / upgrade) ───────────────────────────────────

const AuthForm: React.FC<{
  defaultMode: 'signin' | 'signup' | 'upgrade';
  onClose: () => void;
}> = ({ defaultMode, onClose }) => {
  const {
    signIn, signInWithGoogle, signUp,
    upgradeAnonymous, upgradeAnonymousWithGoogle,
    isAnonymous, authError, clearAuthError,
  } = useAuth();

  type Mode = 'signin' | 'signup' | 'upgrade';
  const [mode, setMode]       = useState<Mode>(defaultMode);
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const doSuccess = () => { setSuccess(true); setTimeout(onClose, 1400); };

  const handleEmailSubmit = async () => {
    if (!email || !password) return;
    clearAuthError();
    setLoading(true);
    try {
      if (mode === 'upgrade') { await upgradeAnonymous(email, password); doSuccess(); }
      else if (mode === 'signup') { await signUp(email, password); doSuccess(); }
      else { await signIn(email, password); doSuccess(); }
    } catch { /* authError handled by context */ }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    clearAuthError();
    setGoogleLoading(true);
    try {
      if (mode === 'upgrade') { await upgradeAnonymousWithGoogle(); doSuccess(); }
      else { await signInWithGoogle(); doSuccess(); }
    } catch { /* authError handled by context */ }
    finally { setGoogleLoading(false); }
  };

  const titles: Record<Mode, string> = {
    upgrade: 'Save Your Account',
    signup:  'Create Account',
    signin:  'Sign In',
  };

  const descriptions: Record<Mode, string> = {
    upgrade: "You're on a temporary anonymous session. Save your account to sync data across devices and never lose your work.",
    signup:  'Create a new account to start syncing your Business Ops data.',
    signin:  'Sign in to access your data from any device.',
  };

  return (
    <>
      <div className="modal-header">
        <div className="auth-modal-icon">
          {mode === 'signin' ? <LogIn size={20} /> : <Shield size={20} />}
        </div>
        <button className="btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      <h2 className="auth-modal-title">{titles[mode]}</h2>
      <p className="auth-modal-desc">{descriptions[mode]}</p>

      {success ? (
        <div className="auth-success">
          <CheckCircle2 size={28} color="var(--green)" />
          <p>
            {mode === 'upgrade' ? 'Account saved! Your data is now synced to the cloud.' :
             mode === 'signup'  ? 'Account created! Welcome.' :
             'Signed in successfully.'}
          </p>
        </div>
      ) : (
        <>
          {/* Google button */}
          <button
            className="btn-google"
            onClick={handleGoogle}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <span className="btn-google-spinner" />
            ) : (
              <GoogleIcon />
            )}
            {mode === 'upgrade'
              ? 'Save account with Google'
              : mode === 'signup'
              ? 'Sign up with Google'
              : 'Sign in with Google'}
          </button>

          <div className="auth-divider"><span>or continue with email</span></div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
            />
          </div>

          {authError && <div className="auth-error">{authError}</div>}

          <button
            className="btn btn-primary auth-submit-btn"
            onClick={handleEmailSubmit}
            disabled={loading || googleLoading || !email || !password}
          >
            {loading ? 'Please wait…' : (
              mode === 'upgrade' ? <><Shield size={14} /> Save Account</> :
              mode === 'signup'  ? <><UserPlus size={14} /> Create Account</> :
              <><LogIn size={14} /> Sign In</>
            )}
          </button>

          <div className="auth-switch">
            {mode !== 'signin' && (
              <button onClick={() => { setMode('signin'); clearAuthError(); }}>
                Already have an account? Sign in
              </button>
            )}
            {mode === 'signin' && (
              <button onClick={() => { setMode('signup'); clearAuthError(); }}>
                New here? Create an account
              </button>
            )}
            {isAnonymous && mode !== 'upgrade' && (
              <button onClick={() => { setMode('upgrade'); clearAuthError(); }}>
                Save your anonymous session instead
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
};

// ─── Main Modal ────────────────────────────────────────────────────────────────

const AuthModal: React.FC<AuthModalProps> = ({ onClose, defaultMode = 'upgrade' }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal auth-modal">
        {defaultMode === 'settings' ? (
          <SettingsView onClose={onClose} />
        ) : (
          <AuthForm defaultMode={defaultMode} onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
