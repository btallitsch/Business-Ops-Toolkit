import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  linkWithCredential,
  linkWithPopup,
  EmailAuthProvider,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase/config';

// ─── Types ─────────────────────────────────────────────────────────────────────

type AuthStatus = 'loading' | 'anonymous' | 'authenticated' | 'error';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isAnonymous: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  upgradeAnonymous: (email: string, password: string) => Promise<void>;
  upgradeAnonymousWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ─── Provider ──────────────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]         = useState<User | null>(null);
  const [status, setStatus]     = useState<AuthStatus>('loading');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setStatus(firebaseUser.isAnonymous ? 'anonymous' : 'authenticated');
      } else {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error('Anonymous sign-in failed:', err);
          setStatus('error');
        }
      }
    });
    return unsub;
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError(friendlyError(err)); throw err;
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(friendlyError(err)); throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError(friendlyError(err)); throw err;
    }
  };

  /** Upgrade anonymous → email/password. Same UID preserved — data stays intact. */
  const upgradeAnonymous = async (email: string, password: string) => {
    setAuthError(null);
    if (!user) throw new Error('No user to upgrade');
    try {
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(user, credential);
      setStatus('authenticated');
    } catch (err) {
      setAuthError(friendlyError(err)); throw err;
    }
  };

  /** Upgrade anonymous → Google. Same UID preserved — data stays intact. */
  const upgradeAnonymousWithGoogle = async () => {
    setAuthError(null);
    if (!user) throw new Error('No user to upgrade');
    try {
      await linkWithPopup(user, googleProvider);
      setStatus('authenticated');
    } catch (err) {
      setAuthError(friendlyError(err)); throw err;
    }
  };

  const sendPasswordReset = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setAuthError(friendlyError(err)); throw err;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    // onAuthStateChanged re-creates an anonymous session automatically
  };

  return (
    <AuthContext.Provider value={{
      user, status,
      isAnonymous: user?.isAnonymous ?? true,
      signIn, signInWithGoogle, signUp,
      upgradeAnonymous, upgradeAnonymousWithGoogle,
      sendPasswordReset, signOut,
      authError,
      clearAuthError: () => setAuthError(null),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Error helpers ─────────────────────────────────────────────────────────────

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':              return 'Invalid email address.';
    case 'auth/user-not-found':             return 'No account found with this email.';
    case 'auth/wrong-password':             return 'Incorrect password.';
    case 'auth/invalid-credential':         return 'Email or password is incorrect.';
    case 'auth/email-already-in-use':       return 'An account with this email already exists.';
    case 'auth/weak-password':              return 'Password must be at least 6 characters.';
    case 'auth/credential-already-in-use':  return 'This Google account is already linked to another account.';
    case 'auth/provider-already-linked':    return 'Google is already linked to this account.';
    case 'auth/popup-closed-by-user':       return 'Sign-in popup was closed. Please try again.';
    case 'auth/popup-blocked':              return 'Popup was blocked by your browser. Please allow popups and try again.';
    case 'auth/too-many-requests':          return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':     return 'Network error. Check your connection and try again.';
    default:                                return 'Something went wrong. Please try again.';
  }
}
