import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { simsStore } from '@sims/shared';
import {
  LayoutDashboard,
  UserCheck,
  UserPlus,
  BookOpen,
  Calendar,
  CheckSquare,
  FileCheck2,
  Megaphone,
  BarChart3,
  LogOut,
  Shield,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onNavigateTab,
  children,
}) => {
  const { currentAdmin, adminRole, logout, switchAdminRole, hasPermission } = useAdminAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const pendingTeachersCount = simsStore.getPendingTeachers().length;
  const pendingStudentsCount = simsStore.getPendingPlacementStudents().length;
  const pendingLeavesCount = simsStore.getLeaveRequests({ status: 'pending' }).length;
  const pendingCorrectionsCount = simsStore.getCorrectionRequests({ status: 'pending' }).length;

  const school = simsStore.getSchool();

  const navItems = [
    { id: 'overview', label: 'School Overview', icon: <LayoutDashboard className="w-5 h-5" />, permission: 'all' },
    {
      id: 'teacher_approvals',
      label: 'Teacher Approvals',
      icon: <UserCheck className="w-5 h-5" />,
      badge: pendingTeachersCount > 0 ? pendingTeachersCount : undefined,
      badgeColor: 'bg-amber-500',
      permission: 'all',
    },
    {
      id: 'student_placement',
      label: 'Student Placement',
      icon: <UserPlus className="w-5 h-5" />,
      badge: pendingStudentsCount > 0 ? pendingStudentsCount : undefined,
      badgeColor: 'bg-blue-600',
      permission: 'manage_enrollments',
    },
    { id: 'academics', label: 'Academic Master', icon: <BookOpen className="w-5 h-5" />, permission: 'manage_academics' },
    { id: 'timetable', label: 'Timetable Planner', icon: <Calendar className="w-5 h-5" />, permission: 'manage_timetable' },
    { id: 'attendance', label: 'Attendance Oversight', icon: <CheckSquare className="w-5 h-5" />, permission: 'manage_attendance' },
    {
      id: 'requests',
      label: 'Review Queue',
      icon: <FileCheck2 className="w-5 h-5" />,
      badge: pendingLeavesCount + pendingCorrectionsCount > 0 ? pendingLeavesCount + pendingCorrectionsCount : undefined,
      badgeColor: 'bg-purple-600',
      permission: 'leave_reviews',
    },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone className="w-5 h-5" />, permission: 'announcements' },
    { id: 'reports', label: 'Reports & Audit Log', icon: <BarChart3 className="w-5 h-5" />, permission: 'reports' },
  ];

  const getAdminRoleBadge = () => {
    switch (adminRole) {
      case 'super_admin':
        return <span className="bg-indigo-900/60 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-700/60">Super Admin</span>;
      case 'academic_admin':
        return <span className="bg-blue-900/60 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-700/60">Academic Dean</span>;
      case 'attendance_officer':
        return <span className="bg-emerald-900/60 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-700/60">Attendance Officer</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Demo Bar */}
      <div className="bg-slate-950 text-slate-200 text-xs py-2 px-4 shadow-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-50">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-800/60">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            SIMS Administration Workspace
          </span>
          <span className="hidden md:inline text-slate-400 text-xs">
            Admin Persona:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => switchAdminRole('admin-eleanor')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                currentAdmin?.uid === 'admin-eleanor'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Super Admin - Eleanor Vance (Principal)"
            >
              Principal (Super)
            </button>
            <button
              onClick={() => switchAdminRole('admin-robert')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                currentAdmin?.uid === 'admin-robert'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Academic Dean - Robert Sterling"
            >
              Academic Dean
            </button>
            <button
              onClick={() => switchAdminRole('admin-clara')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                currentAdmin?.uid === 'admin-clara'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Attendance Officer - Clara Oswald"
            >
              Attendance Officer
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
            title="Open Student/Teacher App on Port 5173"
          >
            <span>Student & Teacher App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800">
          {/* Institution Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-black text-slate-100 text-base leading-tight truncate">
                SIMS Admin
              </h2>
              <span className="text-[11px] text-slate-400 block truncate">
                {school.name}
              </span>
            </div>
          </div>

          {/* Admin User Card */}
          <div className="p-4 mx-3 my-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center font-bold text-sm text-indigo-300 flex-shrink-0">
              {currentAdmin?.avatarUrl ? (
                <img src={currentAdmin.avatarUrl} alt={currentAdmin.name} className="w-full h-full object-cover" />
              ) : (
                currentAdmin?.name.charAt(0) || 'A'
              )}
            </div>
            <div className="min-w-0">
              <span className="font-heading font-bold text-xs text-slate-200 block truncate">
                {currentAdmin?.name}
              </span>
              <div className="mt-0.5">{getAdminRoleBadge()}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const allowed = hasPermission(item.permission);
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateTab(item.id)}
                  disabled={!allowed}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : allowed
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-blue-600'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout footer */}
          <div className="p-3 border-t border-slate-800/80">
            <button
              onClick={logout}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 border border-slate-800 flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="lg:hidden bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="font-heading font-black text-sm">SIMS Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold truncate max-w-[140px]">
                {currentAdmin?.name}
              </span>
              <button onClick={logout} className="p-1 text-rose-400 hover:text-rose-300">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Mobile Sidebar Overlay */}
          {isMobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <div className="relative w-72 bg-slate-900 text-white flex flex-col p-4 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <span className="font-heading font-black text-base">Navigation</span>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigateTab(item.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        currentTab === item.id
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Main Workspace Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

