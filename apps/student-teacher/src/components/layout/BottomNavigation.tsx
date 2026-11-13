import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  CalendarCheck,
  User,
  CheckCircle2,
  BarChart3,
  FileCheck2,
  Award,
} from 'lucide-react';

interface BottomNavProps {
  currentScreen: string;
  onNavigateScreen: (screen: string) => void;
}

export const BottomNavigation: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigateScreen,
}) => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const role = currentUser.role;
  let navItems: { screen: string; label: string; icon: React.ReactNode }[] = [];

  if (role === 'student') {
    navItems = [
      { screen: 'dashboard',      label: 'Home',       icon: <Home className="w-5 h-5" /> },
      { screen: 'attendance',     label: 'Attendance', icon: <CalendarCheck className="w-5 h-5" /> },
      { screen: 'grades',         label: 'Grades',     icon: <Award className="w-5 h-5" /> },
      { screen: 'leave_requests', label: 'Leaves',     icon: <FileCheck2 className="w-5 h-5" /> },
      { screen: 'profile',        label: 'Profile',    icon: <User className="w-5 h-5" /> },
    ];
  } else if (role === 'teacher') {
    navItems = [
      { screen: 'dashboard',          label: 'Home',       icon: <Home className="w-5 h-5" /> },
      { screen: 'teacher_attendance', label: 'Attendance', icon: <CheckCircle2 className="w-5 h-5" /> },
      { screen: 'teacher_reports',    label: 'Reports',    icon: <BarChart3 className="w-5 h-5" /> },
      { screen: 'leave_requests',     label: 'Leaves',     icon: <FileCheck2 className="w-5 h-5" /> },
      { screen: 'profile',            label: 'Profile',    icon: <User className="w-5 h-5" /> },
    ];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg no-print">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => onNavigateScreen(item.screen)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 ${
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>
                {item.icon}
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
