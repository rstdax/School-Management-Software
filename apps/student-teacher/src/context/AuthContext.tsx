import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@sims/shared';
import { simsStore, subscribeToStore, isFirebaseConfigured, getFirebaseAuth, getFirebaseFirestore } from '@sims/shared';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  fetchSignInMethodsForEmail,
  deleteUser,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: UserProfile | null;
  activeRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; uid?: string; email?: string; name?: string }>;
  logout: () => Promise<void>;
  switchDemoUser: (uid: string) => void;
  isFirebaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SCHOOL_ID = 'school-oakridge-01';

// ── Load profile from Firestore → localStorage fallback ──────────────────────
async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseFirestore();
      if (db) {
        const snap = await getDoc(doc(db, 'schools', SCHOOL_ID, 'users', uid));
        if (snap.exists()) return snap.data() as UserProfile;
      }
    } catch { /* fall through */ }
  }
  return simsStore.getUserById(uid) || null;
}

// ── Save profile to Firestore + localStorage ──────────────────────────────────
async function saveUserProfile(profile: UserProfile): Promise<void> {
  simsStore.saveUser(profile);
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseFirestore();
      if (db) await setDoc(doc(db, 'schools', SCHOOL_ID, 'users', profile.uid), profile, { merge: true });
    } catch (e) { console.error('Firestore save failed:', e); }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const firebaseActive = isFirebaseConfigured();

  // ── Auth state listener ───────────────────────────────────────────
  useEffect(() => {
    if (firebaseActive) {
      const auth = getFirebaseAuth();
      if (!auth) { setIsLoading(false); return; }
      const unsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const profile = await loadUserProfile(fbUser.uid);
          if (profile) { simsStore.setCurrentUser(profile.uid); setCurrentUser(profile); }
          else { setCurrentUser(null); }
        } else {
          simsStore.setCurrentUser(null); setCurrentUser(null);
        }
        setIsLoading(false);
      });
      return unsub;
    } else {
      setCurrentUser(simsStore.getCurrentUser() || null);
      setIsLoading(false);
      const unsub = subscribeToStore(() => setCurrentUser(simsStore.getCurrentUser() || null));
      return unsub;
    }
  }, [firebaseActive]);

  // ── Email/Password Login ──────────────────────────────────────────
  const login = async (
    email: string,
    password: string,
    expectedRole?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {

    if (!firebaseActive) {
      // Demo mode
      const users = simsStore.getUsers();
      const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) return { success: false, error: 'No account found with this email.' };
      if (expectedRole && user.role !== expectedRole)
        return { success: false, error: `This account is registered as a ${user.role}.` };
      if (user.role === 'teacher' && user.status === 'pending')
        return { success: false, error: 'Your teacher registration is pending admin verification.' };
      simsStore.setCurrentUser(user.uid); setCurrentUser(user);
      return { success: true };
    }

    // Firebase mode
    const auth = getFirebaseAuth();
    if (!auth) return { success: false, error: 'Auth not initialized.' };

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await loadUserProfile(cred.user.uid);

      if (!profile) {
        await signOut(auth);
        return { success: false, error: 'No school profile found. Please contact admin.' };
      }
      if (expectedRole && profile.role !== expectedRole) {
        await signOut(auth);
        return { success: false, error: `This account is registered as a ${profile.role}.` };
      }
      if (profile.role === 'teacher' && profile.status === 'pending') {
        await signOut(auth);
        return { success: false, error: 'Your teacher registration is pending admin verification.' };
      }

      simsStore.setCurrentUser(profile.uid); setCurrentUser(profile);
      return { success: true };

    } catch (err: any) {
      const code: string = err?.code ?? '';

      // Google-only account — no password set
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        // Check if this email was registered via Google
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods.includes('google.com') && !methods.includes('password')) {
            return {
              success: false,
              error: 'You registered with Google. Please use "Continue with Google" to sign in.',
            };
          }
        } catch { /* ignore */ }
        return { success: false, error: 'Invalid email or password.' };
      }

      if (code === 'auth/user-not-found')
        return { success: false, error: 'No account found with this email. Please sign up first.' };
      if (code === 'auth/too-many-requests')
        return { success: false, error: 'Too many attempts. Please try again later.' };
      if (code === 'auth/invalid-email')
        return { success: false, error: 'Please enter a valid email address.' };

      return { success: false, error: err?.message || 'Sign-in failed.' };
    }
  };

  // ── Google Sign-In / Sign-Up ──────────────────────────────────────
  const loginWithGoogle = async (): Promise<{
    success: boolean; error?: string; uid?: string; email?: string; name?: string;
  }> => {
    if (!firebaseActive)
      return { success: false, error: 'Google sign-in requires Firebase.' };

    const auth = getFirebaseAuth();
    if (!auth) return { success: false, error: 'Auth not initialized.' };

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const fbUser = cred.user;

      const profile = await loadUserProfile(fbUser.uid);

      if (!profile) {
        // No school profile — this user has not registered via signup
        // DELETE the Firebase Auth account so they can signup fresh next time
        try { await deleteUser(fbUser); } catch { await signOut(auth); }
        return {
          success: false,
          error: 'No account found. Please sign up first to create your student profile.',
        };
      }

      // Existing user — link Google provider if not already linked
      // (so email+pass users can also use Google going forward)
      const hasGoogle = fbUser.providerData.some(p => p.providerId === 'google.com');
      if (!hasGoogle) {
        try { await linkWithPopup(fbUser, provider); } catch { /* already linked or not needed */ }
      }

      if (profile.role === 'teacher' && profile.status === 'pending') {
        await signOut(auth);
        return { success: false, error: 'Your teacher account is pending admin verification.' };
      }

      simsStore.setCurrentUser(profile.uid); setCurrentUser(profile);
      return { success: true };

    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request')
        return { success: false, error: 'Sign-in cancelled.' };
      if (err?.code === 'auth/account-exists-with-different-credential') {
        return {
          success: false,
          error: 'An account already exists with this email. Please sign in with email & password first, then link Google from your profile.',
        };
      }
      return { success: false, error: err?.message || 'Google sign-in failed.' };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────
  const logout = async () => {
    if (firebaseActive) {
      try { const auth = getFirebaseAuth(); if (auth) await signOut(auth); } catch { /* ignore */ }
    }
    simsStore.setCurrentUser(null); setCurrentUser(null);
  };

  // ── Demo switch ───────────────────────────────────────────────────
  const switchDemoUser = (uid: string) => {
    const user = simsStore.getUserById(uid);
    if (user) { simsStore.setCurrentUser(user.uid); setCurrentUser(user); }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      activeRole: currentUser?.role || null,
      isAuthenticated: Boolean(currentUser),
      isLoading,
      login,
      loginWithGoogle,
      logout,
      switchDemoUser,
      isFirebaseActive: firebaseActive,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
