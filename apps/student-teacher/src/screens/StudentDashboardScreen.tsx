import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { simsStore } from '@sims/shared';
import {
  CalendarCheck,
  Clock,
  FileText,
  AlertTriangle,
  Megaphone,
  ArrowRight,
  MapPin,
  AlertCircle,
  X,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigateScreen: (screen: string) => void;
  onOpenLeaveModal: () => void;
  onOpenCorrectionModal: () => void;
  onSelectAnnouncement: (ann: any) => void;
}

export const StudentDashboardScreen: React.FC<StudentDashboardProps> = ({
  onNavigateScreen,
  onOpenLeaveModal,
  onOpenCorrectionModal,
  onSelectAnnouncement,
}) => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const [showFeesBanner, setShowFeesBanner] = useState(true);

  const stats       = simsStore.getStudentAttendanceStats(currentUser.uid);
  const timetable   = simsStore.getTimetable('class-g10', 'sec-g10-a', 2);
  const announcements = simsStore.getAnnouncements().slice(0, 3);
  const subjects    = simsStore.getSubjects();
  const pendingFees = simsStore.getStudentPendingFees(currentUser.uid);

  // Current month stats
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthStats = simsStore.getStudentAttendanceStats(currentUser.uid, currentMonthStr);
  const monthName = now.toLocaleString('default', { month: 'long' });

  const isPendingPlacement = currentUser.status === 'pending_placement';

  return (
    <div className="p-4 sm:p-5 max-w-lg mx-auto space-y-4 pb-20">

      {/* ── Pending Placement notice ── */}
      {isPendingPlacement && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Provisional Enrollment Active</span>
            Your official section and roll number are pending admin placement.
          </div>
        </div>
      )}

      {/* ── Greeting / Profile Card ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Welcome back</span>
            <span className="text-blue-600 font-bold">· Term 1</span>
          </div>
          <h2 className="font-heading font-black text-xl text-slate-900 tracking-tight truncate">
            {currentUser.name}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              {currentUser.studentData?.className ?? 'Grade 10'} · {currentUser.studentData?.sectionName ?? 'Section A'}
            </span>
            <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              Roll #{currentUser.studentData?.rollNumber ?? '14'}
            </span>
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl ring-2 ring-blue-100 overflow-hidden flex-shrink-0 shadow-sm ml-3">
          {currentUser.avatarUrl
            ? <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>}
        </div>
      </div>

      {/* ── Attendance Summary ── */}
      {stats && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-sm">Attendance Summary</h3>
                <p className="text-[10px] text-slate-400 font-medium">{monthName}</p>
              </div>
            </div>
            <button onClick={() => onNavigateScreen('attendance')}
              className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-xl font-black text-blue-700 leading-none">{monthStats.overallPercentage}%</span>
              <span className="text-[10px] font-bold text-blue-600/80 mt-1 uppercase tracking-wider">Month</span>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              {[
                { label: 'Present', value: monthStats.presentLectures, bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-800', sub: 'text-emerald-600' },
                { label: 'Absent',  value: monthStats.absentLectures,  bg: 'bg-rose-50 border-rose-100',    text: 'text-rose-800',    sub: 'text-rose-600'    },
                { label: 'Leave',   value: monthStats.leaveLectures,   bg: 'bg-purple-50 border-purple-100',text: 'text-purple-800',  sub: 'text-purple-600'  },
              ].map(s => (
                <div key={s.label} className={`p-2.5 ${s.bg} border rounded-xl text-center`}>
                  <span className={`text-xs font-black block ${s.text}`}>{s.value}</span>
                  <span className={`text-[10px] font-medium ${s.sub}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar — overall % */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
              <span>Minimum 75% Required</span>
              <span className={stats.isShortage ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                {stats.isShortage ? '⚠️ Below Threshold' : '✓ Good Standing'}
              </span>
            </div>
            <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${stats.isShortage ? 'bg-amber-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(stats.overallPercentage, 100)}%` }} />
              <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-rose-400" />
            </div>
          </div>
        </div>
      )}

      {/* ── Fees Alert Banner — shown below attendance ── */}
      {pendingFees.length > 0 && showFeesBanner && (
        <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-2xl text-orange-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="font-bold text-sm block">⚠️ Fee Payment Pending</span>
            <p className="text-xs mt-0.5 text-orange-800">
              {pendingFees.length} month(s) due. Please clear to avoid suspension.
            </p>
            <p className="text-[10px] mt-0.5 text-orange-700 font-medium">
              {pendingFees.map(f => f.monthLabel).join(', ')}
            </p>
            <button
              onClick={() => onNavigateScreen('fees')}
              className="mt-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold rounded-lg transition-colors"
            >
              View Details
            </button>
          </div>
          <button
            onClick={() => setShowFeesBanner(false)}
            className="p-1 rounded-lg text-orange-400 hover:text-orange-700 hover:bg-orange-100 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Quick Action Shortcuts ── */}
      <div className="grid grid-cols-4 gap-2">
        <button onClick={() => onNavigateScreen('attendance')}
          className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md active:scale-[0.97] transition-all">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl mb-1.5"><CalendarCheck className="w-4 h-4" /></div>
          <span className="text-[11px] font-bold text-slate-800">Attendance</span>
        </button>

        <button onClick={() => onNavigateScreen('routine')}
          className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md active:scale-[0.97] transition-all">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl mb-1.5"><Clock className="w-4 h-4" /></div>
          <span className="text-[11px] font-bold text-slate-800">Routine</span>
        </button>

        <button onClick={() => onNavigateScreen('leave_requests')}
          className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md active:scale-[0.97] transition-all">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl mb-1.5"><FileText className="w-4 h-4" /></div>
          <span className="text-[11px] font-bold text-slate-800">Leave</span>
        </button>

        <button onClick={() => onOpenCorrectionModal()}
          className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md active:scale-[0.97] transition-all">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl mb-1.5"><AlertTriangle className="w-4 h-4" /></div>
          <span className="text-[11px] font-bold text-slate-800">Correction</span>
        </button>
      </div>

      {/* ── Today's Lectures ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Clock className="w-4 h-4" /></div>
            <h3 className="font-heading font-bold text-slate-900 text-sm">Today's Lectures</h3>
          </div>
          <span className="text-xs text-slate-400">Tuesday · {timetable.length} sessions</span>
        </div>

        <div className="space-y-2.5">
          {timetable.map((slot, idx) => {
            const subj    = subjects.find(s => s.id === slot.subjectId);
            const isDone  = idx === 0;
            return (
              <div key={slot.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDone ? 'bg-emerald-50/40 border-emerald-200/60' : 'bg-slate-50 border-slate-200/70'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    P{slot.periodNumber}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{subj?.name ?? 'Academic Class'}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{slot.startTime} – {slot.endTime}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{slot.roomNumber}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-700'
                }`}>
                  {isDone ? 'Finalized' : 'Upcoming'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Announcements ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Megaphone className="w-4 h-4" /></div>
            <h3 className="font-heading font-bold text-slate-900 text-sm">School Announcements</h3>
          </div>
          <button onClick={() => onNavigateScreen('announcements')}
            className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
            All Notices <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-2.5">
          {announcements.map(ann => (
            <div key={ann.id} onClick={() => onSelectAnnouncement(ann)}
              className="p-3 bg-slate-50 hover:bg-blue-50/40 border border-slate-200/70 rounded-xl cursor-pointer transition-all">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full uppercase">
                  {ann.category}
                </span>
                <span className="text-[10px] text-slate-400">{new Date(ann.publishedAt).toLocaleDateString()}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">{ann.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ann.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
