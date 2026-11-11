import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { X, CheckCheck, Bell, CalendarCheck, Megaphone, AlertCircle, Clock } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const { isOpen, closeDrawer, notifications, markAsRead, markAllAsRead, unreadCount } =
    useNotifications();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <CalendarCheck className="w-4 h-4 text-emerald-600" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-blue-600" />;
      case 'leave':
      case 'correction':
        return <Clock className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-bold text-slate-900 text-base">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Recent alerts</span>
              <button
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    item.read
                      ? 'bg-white border-slate-100 text-slate-600'
                      : 'bg-blue-50/50 border-blue-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-white rounded-lg shadow-xs mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-2 block">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

