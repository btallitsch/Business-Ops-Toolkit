import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
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
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  upgradeAnonymous: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ─── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [authError, setAuthError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setStatus(firebaseUser.isAnonymous ? 'anonymous' : 'authenticated');
      } else {
        // No user — sign in anonymously automatically
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
    } catch (err: unknown) {
      setAuthError(friendlyError(err));
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      setAuthError(friendlyError(err));
      throw err;
    }
  };

  /**
   * Upgrade an anonymous account to email/password without losing data.
   * The same UID is preserved — Firestore data stays intact.
   */
  const upgradeAnonymous = async (email: string, password: string) => {
    setAuthError(null);
    if (!user) throw new Error('No user to upgrade');
    try {
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(user, credential);
      setStatus('authenticated');
    } catch (err: unknown) {
      setAuthError(friendlyError(err));
      throw err;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    // onAuthStateChanged will immediately sign in anonymously again
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isAnonymous: user?.isAnonymous ?? true,
        signIn,
        signUp,
        upgradeAnonymous,
        signOut,
        authError,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':          return 'Invalid email address.';
    case 'auth/user-not-found':         return 'No account found with this email.';
    case 'auth/wrong-password':         return 'Incorrect password.';
    case 'auth/email-already-in-use':   return 'An account with this email already exists.';
    case 'auth/weak-password':          return 'Password must be at least 6 characters.';
    case 'auth/credential-already-in-use': return 'This email is already linked to another account.';
    case 'auth/too-many-requests':      return 'Too many attempts. Please try again later.';
    default:                            return 'Something went wrong. Please try again.';
  }
}
