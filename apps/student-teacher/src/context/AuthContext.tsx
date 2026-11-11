import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@sims/shared';
import { simsStore, subscribeToStore } from '@sims/shared';

interface AuthContextType {
  currentUser: UserProfile | null;
  activeRole: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => { success: boolean; error?: string };
  logout: () => void;
  switchDemoUser: (uid: string) => void;
  isFirebaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return simsStore.getCurrentUser() || null;
  });

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      const u = simsStore.getCurrentUser();
      setCurrentUser(u || null);
    });
    return unsubscribe;
  }, []);

  const login = (email: string, expectedRole?: UserRole) => {
    const users = simsStore.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (expectedRole && user.role !== expectedRole) {
      return {
        success: false,
        error: `This account is registered as a ${user.role}. Please select the correct tab to sign in.`,
      };
    }

    // Role-specific status checks
    if (user.role === 'teacher' && user.status === 'pending') {
      return {
        success: false,
        error: 'Your teacher registration is currently pending administrator verification. Please check back later.',
      };
    }

    simsStore.setCurrentUser(user.uid);
    setCurrentUser(user);
    return { success: true };
  };

  const logout = () => {
    simsStore.setCurrentUser(null);
    setCurrentUser(null);
  };

  const switchDemoUser = (uid: string) => {
    const user = simsStore.getUserById(uid);
    if (user) {
      simsStore.setCurrentUser(user.uid);
      setCurrentUser(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole: currentUser?.role || null,
        isAuthenticated: Boolean(currentUser),
        login,
        logout,
        switchDemoUser,
        isFirebaseActive: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

