import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, ArrowLeft, GraduationCap } from 'lucide-react';

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onNavigateScreen: (screen: string) => void;
  currentScreen: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  showBack,
  onBack,
  onNavigateScreen,
  currentScreen,
}) => {
  const { currentUser } = useAuth();
  const { unreadCount, openDrawer } = useNotifications();

  const getRoleBadge = () => {
    switch (currentUser?.role) {
      case 'student':
        return <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">Student</span>;
      case 'teacher':
        return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">Teacher</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 transition-all">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2.5">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div
              onClick={() => onNavigateScreen('dashboard')}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-extrabold text-slate-900 tracking-tight text-base leading-none">
                    SIMS
                  </span>
                  {getRoleBadge()}
                </div>
                <span className="text-[10px] text-slate-500 font-medium leading-tight">
                  Oakridge Academy
                </span>
              </div>
            </div>
          )}

          {title && showBack && (
            <h1 className="font-heading font-bold text-slate-900 text-base truncate">
              {title}
            </h1>
          )}
        </div>

        {currentUser && (
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={openDrawer}
              className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar Profile */}
            <button
              onClick={() => onNavigateScreen('profile')}
              className={`w-9 h-9 rounded-full ring-2 transition-all overflow-hidden flex items-center justify-center font-bold text-xs ${
                currentScreen === 'profile'
                  ? 'ring-blue-600 ring-offset-2'
                  : 'ring-slate-200 hover:ring-blue-400'
              }`}
              title={currentUser.name}
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {currentUser.name.charAt(0)}
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

