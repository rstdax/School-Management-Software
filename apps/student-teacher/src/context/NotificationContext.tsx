import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem } from '@sims/shared';
import { simsStore, subscribeToStore } from '@sims/shared';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const refresh = () => {
    if (currentUser) {
      const items = simsStore.getNotifications(currentUser.uid, currentUser.role);
      setNotifications(items);
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToStore(refresh);
    return unsubscribe;
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    simsStore.markNotificationRead(id);
    refresh();
  };

  const markAllAsRead = () => {
    simsStore.markAllNotificationsRead();
    refresh();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        openDrawer: () => setIsOpen(true),
        closeDrawer: () => setIsOpen(false),
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};

