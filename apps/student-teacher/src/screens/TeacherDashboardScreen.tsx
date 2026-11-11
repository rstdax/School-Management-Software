import React from 'react';
import { useAuth } from '../context/AuthContext';
import { simsStore } from '@sims/shared';
import {
  CheckCircle2,
  Clock,
  BarChart3,
  FileCheck2,
  Users,
  MapPin,
  ArrowRight,
  AlertCircle,
  FileEdit,
  UserPlus,
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigateScreen: (screen: string) => void;
  onSelectLectureToMark: (classId: string, sectionId: string, subjectId: string, date: string, period: number) => void;
}

export const TeacherDashboardScreen: React.FC<TeacherDashboardProps> = ({
  onNavigateScreen,
  onSelectLectureToMark,
}) => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const todayStr = '2026-11-03';
  const timetableToday = simsStore.getTeacherTimetable(currentUser.uid, 2); // Tuesday lectures
  const todaySessions = simsStore.getAttendanceSessions({ date: todayStr, teacherId: currentUser.uid });
  const pendingLeaves = simsStore.getLeaveRequests({ status: 'pending' });
  const pendingEnrollments = simsStore
    .getPendingPlacementStudents()
    .filter((st) => st.studentData?.className?.includes('Grade 10'));

  // Today stats
  const totalLecturesToday = timetableToday.length || 3;
  const finalizedLecturesToday = todaySessions.filter((s) => s.status === 'finalized').length;

  return (
    <div className="p-4 sm:p-5 max-w-lg mx-auto space-y-4 pb-20">
      {/* Teacher Profile Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Senior Faculty
          </span>
          <h2 className="font-heading font-black text-xl text-slate-900 tracking-tight">
            {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {currentUser.teacherData?.department || 'Department of Mathematics'} • {currentUser.teacherData?.employeeId || 'EMP-MTH-408'}
          </p>
        </div>

        <div className="w-14 h-14 rounded-2xl ring-2 ring-emerald-100 overflow-hidden flex-shrink-0 shadow-xs">
          {currentUser.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Today's Teaching Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-white border border-slate-200/80 rounded-2xl text-center shadow-xs">
          <span className="text-xs text-slate-400 font-medium block">Lectures Today</span>
          <span className="font-heading font-black text-lg text-slate-900 block mt-0.5">
            {totalLecturesToday}
          </span>
        </div>

        <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-center shadow-xs">
          <span className="text-xs text-emerald-600 font-medium block">Finalized</span>
          <span className="font-heading font-black text-lg text-emerald-700 block mt-0.5">
            {finalizedLecturesToday} of {totalLecturesToday}
          </span>
        </div>

        <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl text-center shadow-xs">
          <span className="text-xs text-purple-600 font-medium block">Pending Leaves</span>
          <span className="font-heading font-black text-lg text-purple-700 block mt-0.5">
            {pendingLeaves.length}
          </span>
        </div>
      </div>

      {/* Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => onNavigateScreen('teacher_attendance')}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs transition-colors"
        >
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl mb-1.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 leading-tight">Take Attendance</span>
        </button>

        <button
          onClick={() => onNavigateScreen('teacher_reports')}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs transition-colors relative"
        >
          {pendingEnrollments.length > 0 && (
            <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
              {pendingEnrollments.length}
            </span>
          )}
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl mb-1.5">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 leading-tight">Class Reports</span>
        </button>

        <button
          onClick={() => onNavigateScreen('leave_requests')}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs transition-colors relative"
        >
          {pendingLeaves.length > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl mb-1.5">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 leading-tight">Review Leaves</span>
        </button>

        <button
          onClick={() => onNavigateScreen('teacher_reports')}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs transition-colors relative"
        >
          {pendingEnrollments.length > 0 && (
            <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
              {pendingEnrollments.length}
            </span>
          )}
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl mb-1.5">
            <UserPlus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 leading-tight">Enrollment</span>
        </button>
      </div>

      {/* Today's Teaching Schedule List */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="font-heading font-bold text-slate-900 text-sm">
              Today's Lectures Schedule
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Tuesday, Nov 3</span>
        </div>

        <div className="space-y-3">
          {/* Slot 1: Period 1 Grade 10-A (Finalized) */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Grade 10 - Section A
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Mathematics
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  09:00 AM - 09:50 AM
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Room 302
                </span>
              </div>
            </div>

            <div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Finalized
              </span>
            </div>
          </div>

          {/* Slot 2: Period 3 Grade 10-B (Draft in Progress) */}
          <div className="p-3.5 bg-amber-50/40 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Grade 10 - Section B
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Mathematics
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  11:00 AM - 11:50 AM
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Room 304
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectLectureToMark('class-g10', 'sec-g10-b', 'sub-math', todayStr, 3)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
            >
              <FileEdit className="w-3.5 h-3.5" />
              Resume Draft
            </button>
          </div>

          {/* Slot 3: Period 4 Grade 11-A (Not Started) */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Grade 11 - Section A
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Calculus
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  01:00 PM - 01:50 PM
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Room 401
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectLectureToMark('class-g11', 'sec-g11-a', 'sub-math', todayStr, 4)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Take Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Assigned Classes Grid */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <h3 className="font-heading font-bold text-slate-900 text-sm mb-3">
          Assigned Cohorts & Sections
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
            <span className="font-bold text-xs text-slate-900 block">Grade 10-A</span>
            <span className="text-[10px] text-slate-500">30 Enrolled</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
            <span className="font-bold text-xs text-slate-900 block">Grade 10-B</span>
            <span className="text-[10px] text-slate-500">30 Enrolled</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
            <span className="font-bold text-xs text-slate-900 block">Grade 11-A</span>
            <span className="text-[10px] text-slate-500">28 Enrolled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
