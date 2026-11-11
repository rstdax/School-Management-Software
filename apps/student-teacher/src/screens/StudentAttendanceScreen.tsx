import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { simsStore } from '@sims/shared';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building2,
} from 'lucide-react';

interface StudentAttendanceProps {
  onOpenExportModal: () => void;
  onOpenCorrectionModal: () => void;
  targetStudentId?: string;
}

export const StudentAttendanceScreen: React.FC<StudentAttendanceProps> = ({
  onOpenExportModal,
  onOpenCorrectionModal,
  targetStudentId,
}) => {
  const { currentUser } = useAuth();
  const studentId = targetStudentId || currentUser?.uid || 'student-alex';
  const student = simsStore.getUserById(studentId);

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // November
  const [selectedDay, setSelectedDay] = useState<number>(3);

  const stats = simsStore.getStudentAttendanceStats(studentId);
  const finalizedSessions = simsStore.getAttendanceSessions({ status: 'finalized' }).filter(
    s => s.records[studentId] !== undefined
  );

  // ── Monthly stats — recalculate for the currently viewed month ──
  const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthSessions = finalizedSessions.filter(s => s.date.startsWith(currentMonthStr));
  const monthPresent  = monthSessions.filter(s => s.records[studentId] === 'P').length;
  const monthAbsent   = monthSessions.filter(s => s.records[studentId] === 'A').length;
  const monthLeave    = monthSessions.filter(s => s.records[studentId] === 'L').length;
  const monthTotal    = monthSessions.length;

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const daysInMonth  = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset  = (firstDayIndex + 6) % 7; // Monday = 0

  type DayStatus = 'P' | 'A' | 'L' | 'C' | 'N'; // C = School Closed (Sunday/holiday)

  const getDayStatus = (day: number): DayStatus => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dow = new Date(currentYear, currentMonth, day).getDay();
    if (dow === 0) return 'C'; // Sunday = school closed

    // Check finalized sessions
    const sessionsOnDay = finalizedSessions.filter(s => s.date === dateStr);
    if (sessionsOnDay.length > 0) {
      // Majority status
      const statuses = sessionsOnDay.map(s => s.records[studentId]);
      if (statuses.includes('A')) return 'A';
      if (statuses.every(s => s === 'L')) return 'L';
      return 'P';
    }

    // Demo: weekdays before today
    if (currentMonth === 10 && day <= 3) {
      if (day === 2) return 'A';
      return 'P';
    }
    return 'N';
  };

  const selectedDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const selectedDow     = new Date(currentYear, currentMonth, selectedDay).getDay();
  const sessionsOnDay   = finalizedSessions.filter(s => s.date === selectedDateStr);
  const dayStatus       = getDayStatus(selectedDay);

  const dotColorMap: Record<DayStatus, string> = {
    P: 'bg-emerald-500',
    A: 'bg-rose-500',
    L: 'bg-purple-500',
    C: 'bg-slate-300',
    N: '',
  };

  // Today's overall status label
  const todayStatusUI = () => {
    if (selectedDow === 0) return (
      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-700">School Closed</p>
          <p className="text-xs text-slate-500 mt-0.5">Sunday — No classes scheduled</p>
        </div>
      </div>
    );

    if (dayStatus === 'N') return (
      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-500">No Records</p>
          <p className="text-xs text-slate-400 mt-0.5">No finalized sessions for this date</p>
        </div>
      </div>
    );

    if (dayStatus === 'P') return (
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-800">Present</p>
          <p className="text-xs text-emerald-600 mt-0.5">You attended school on this day</p>
        </div>
      </div>
    );

    if (dayStatus === 'A') return (
      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <XCircle className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-rose-800">Absent</p>
          <p className="text-xs text-rose-600 mt-0.5">Marked absent on this day</p>
        </div>
      </div>
    );

    if (dayStatus === 'L') return (
      <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-2xl">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-purple-800">On Leave</p>
          <p className="text-xs text-purple-600 mt-0.5">Approved leave on this day</p>
        </div>
      </div>
    );

    return null;
  };

  return (
    <div className="p-4 sm:p-5 max-w-lg mx-auto space-y-4 pb-20">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-xl text-slate-900 tracking-tight">Attendance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {student?.studentData?.className ?? 'Grade 10'} · {student?.studentData?.sectionName ?? 'Section A'} · Roll #{student?.studentData?.rollNumber ?? '14'}
          </p>
        </div>
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          Export
        </button>
      </div>

      {/* Stats row — current month only */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total',   value: monthTotal,   bg: 'bg-white border-slate-200',       text: 'text-slate-900',   sub: 'text-slate-500'   },
          { label: 'Present', value: monthPresent, bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-800', sub: 'text-emerald-600' },
          { label: 'Absent',  value: monthAbsent,  bg: 'bg-rose-50 border-rose-100',       text: 'text-rose-800',    sub: 'text-rose-600'    },
          { label: 'Leave',   value: monthLeave,   bg: 'bg-purple-50 border-purple-100',   text: 'text-purple-800',  sub: 'text-purple-600'  },
        ].map(s => (
          <div key={s.label} className={`p-3 ${s.bg} border rounded-2xl text-center shadow-sm`}>
            <span className={`text-sm font-black block ${s.text}`}>{s.value}</span>
            <span className={`text-[10px] font-medium ${s.sub}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Shortage warning — based on overall % */}
      {stats.isShortage && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-900">
              Attendance Shortage — {stats.overallPercentage}% overall (min 75%)
            </p>
            <p className="text-xs text-amber-800 mt-0.5">Please attend upcoming sessions regularly.</p>
          </div>
        </div>
      )}

      {/* Monthly Calendar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <h3 className="font-heading font-bold text-slate-900 text-sm">
              {monthNames[currentMonth]} {currentYear}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <span key={d}>{d}</span>)}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: startOffset }).map((_, i) => <div key={`off-${i}`} className="h-9" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day    = i + 1;
            const status = getDayStatus(day);
            const isSel  = selectedDay === day;
            const dot    = dotColorMap[status];

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`h-9 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all ${
                  isSel ? 'bg-slate-800 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>{day}</span>
                {dot && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSel ? 'bg-white' : dot}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 font-medium flex-wrap">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span>Present</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /><span>Absent</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /><span>Leave</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" /><span>Closed</span></div>
        </div>
      </div>

      {/* Selected day status */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2 px-0.5">
          {monthNames[currentMonth]} {selectedDay}, {currentYear}
        </p>
        {todayStatusUI()}
      </div>

      {/* Per-session records for selected day */}
      {sessionsOnDay.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 px-0.5">{sessionsOnDay.length} Session(s)</p>
          {sessionsOnDay.map(sess => {
            const s = sess.records[studentId];
            return (
              <div key={sess.id} className="bg-white p-3.5 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-sm font-bold text-slate-900">{sess.subjectName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Period {sess.periodNumber ?? 1} · {sess.teacherName}
                  </p>
                </div>
                {s === 'P' && (
                  <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Present
                  </span>
                )}
                {s === 'A' && (
                  <span className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-xl border border-rose-200">
                    <XCircle className="w-3.5 h-3.5" /> Absent
                  </span>
                )}
                {s === 'L' && (
                  <span className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-800 text-xs font-bold rounded-xl border border-purple-200">
                    <HelpCircle className="w-3.5 h-3.5" /> Leave
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
