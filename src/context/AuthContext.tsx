import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  onAuthStateChanged,
  User,
  db,
  doc,
  setDoc,
  getDoc,
} from '../lib/firebase.ts';
import { validatePasswordStrength } from '../utils/productivity.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  sendResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuest(false);
        // Ensure user document exists in firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Nexus User',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn('Could not initialize user profile document in Firestore:', e);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 8 characters with letters, numbers, and symbols.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please verify your credentials.';
      case 'auth/too-many-requests':
        return 'Access temporarily restricted due to many failed attempts. Please try again later or reset your password.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completing.';
      default:
        return err?.message || 'Authentication operation failed. Please check your network and try again.';
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    // Password security best practice validation
    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      return {
        success: false,
        error: 'Password must be at least 8 characters and include numbers or special characters.',
      };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Create user profile
      const userRef = doc(db, 'users', cred.user.uid);
      await setDoc(userRef, {
        uid: cred.user.uid,
        email: cred.user.email || email.trim(),
        displayName: email.trim().split('@')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { success: true };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: cred.user.uid,
          email: cred.user.email || '',
          displayName: cred.user.displayName || 'Nexus User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  const sendResetEmail = async (email: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsGuest(true);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        sendResetEmail,
        logout,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
