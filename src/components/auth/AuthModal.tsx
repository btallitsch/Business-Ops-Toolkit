import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

interface AuthModalProps {
  onClose: () => void;
  defaultMode?: 'signin' | 'signup' | 'upgrade';
}

type Mode = 'signin' | 'signup' | 'upgrade';

const AuthModal: React.FC<AuthModalProps> = ({ onClose, defaultMode = 'upgrade' }) => {
  const { signIn, signUp, upgradeAnonymous, isAnonymous, authError, clearAuthError } = useAuth();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    clearAuthError();
    setLoading(true);
    try {
      if (mode === 'upgrade') {
        await upgradeAnonymous(email, password);
        setSuccess(true);
        setTimeout(onClose, 1500);
      } else if (mode === 'signup') {
        await signUp(email, password);
        setSuccess(true);
        setTimeout(onClose, 1500);
      } else {
        await signIn(email, password);
        setSuccess(true);
        setTimeout(onClose, 1500);
      }
    } catch {
      // authError is set by context
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, string> = {
    upgrade: 'Save Your Account',
    signup: 'Create Account',
    signin: 'Sign In',
  };

  const descriptions: Record<Mode, string> = {
    upgrade: 'You\'re currently using a temporary anonymous session. Create an account to sync your data across devices and never lose your work.',
    signup: 'Create a new account to start syncing your Business Ops data to the cloud.',
    signin: 'Sign in to access your data from any device.',
  };

  return (
    <div className="modal-backdrop">
      <div className="modal auth-modal">
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
            <Shield size={28} color="var(--green)" />
            <p>
              {mode === 'upgrade' ? 'Account saved! Your data is now synced.' :
               mode === 'signup' ? 'Account created! Welcome.' :
               'Signed in successfully.'}
            </p>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label><Mail size={11} style={{ display: 'inline', marginRight: 4 }} />Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div className="form-group">
              <label><Lock size={11} style={{ display: 'inline', marginRight: 4 }} />Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {authError && (
              <div className="auth-error">{authError}</div>
            )}

            <button
              className="btn btn-primary w-full auth-submit-btn"
              onClick={handleSubmit}
              disabled={loading || !email || !password}
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
              {mode !== 'signup' && !isAnonymous && (
                <button onClick={() => { setMode('signup'); clearAuthError(); }}>
                  New here? Create account
                </button>
              )}
              {mode !== 'upgrade' && isAnonymous && (
                <button onClick={() => { setMode('upgrade'); clearAuthError(); }}>
                  Save your anonymous session
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
