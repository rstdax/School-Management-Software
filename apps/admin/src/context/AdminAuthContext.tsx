import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AdminRole } from '@sims/shared';
import { simsStore, subscribeToStore } from '@sims/shared';

interface AdminAuthContextType {
  currentAdmin: UserProfile | null;
  adminRole: AdminRole | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  switchAdminRole: (uid: string) => void;
  hasPermission: (perm: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<UserProfile | null>(() => {
    return simsStore.getCurrentAdmin() || null;
  });

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      const a = simsStore.getCurrentAdmin();
      setCurrentAdmin(a || null);
    });
    return unsubscribe;
  }, []);

  const login = (email: string, _password?: string) => {
    const users = simsStore.getUsers();
    const admin = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === 'admin'
    );

    if (!admin) {
      return {
        success: false,
        error: 'Access Denied: No administrator account registered with this email address.',
      };
    }

    if (admin.status !== 'active') {
      return {
        success: false,
        error: 'This administrator account is suspended or inactive.',
      };
    }

    simsStore.setCurrentAdmin(admin.uid);
    setCurrentAdmin(admin);
    return { success: true };
  };

  const logout = () => {
    simsStore.setCurrentAdmin(null);
    setCurrentAdmin(null);
  };

  const switchAdminRole = (uid: string) => {
    const user = simsStore.getUserById(uid);
    if (user && user.role === 'admin') {
      simsStore.setCurrentAdmin(user.uid);
      setCurrentAdmin(user);
    }
  };

  const hasPermission = (perm: string): boolean => {
    if (!currentAdmin?.adminData) return false;
    if (currentAdmin.adminData.adminRole === 'super_admin') return true;
    const permissions = currentAdmin.adminData.permissions || [];
    return permissions.includes('all') || permissions.includes(perm);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        currentAdmin,
        adminRole: currentAdmin?.adminData?.adminRole || null,
        isAuthenticated: Boolean(currentAdmin),
        login,
        logout,
        switchAdminRole,
        hasPermission,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
};

