import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { simsStore, AttendanceStatus, AttendanceSession } from '@sims/shared';
import {
  CheckCircle2,
  Save,
  CheckCheck,
  AlertTriangle,
  RotateCcw,
  Clock,
  ShieldAlert,
  Users,
  BookOpen,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Calendar,
  Edit3,
} from 'lucide-react';
interface TakeAttendanceProps {
  initialClassId?: string;
  initialSectionId?: string;
  initialSubjectId?: string;
  initialDate?: string;
  initialPeriod?: number;
  onSuccess?: () => void;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast: React.FC<{ message: string; type: 'success' | 'error' | 'info'; onDone: () => void }> = ({
  message, type, onDone,
}) => {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  const bg = type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#1e293b';
  return (
    <div
      className="fixed top-5 left-1/2 z-[200] px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white text-center"
      style={{ background: bg, transform: 'translateX(-50%)', maxWidth: 300, width: 'max-content', animation: 'toastPop .3s cubic-bezier(.34,1.56,.64,1) both' }}
    >{message}</div>
  );
};

// ─── P / A / L Button ─────────────────────────────────────────────────────────
const MarkBtn: React.FC<{ label: 'P' | 'A' | 'L'; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => {
  const palette = {
    P: { on: 'bg-emerald-500 text-white shadow-lg shadow-emerald-200', off: 'bg-white border border-slate-200 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300' },
    A: { on: 'bg-rose-500 text-white shadow-lg shadow-rose-200', off: 'bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300' },
    L: { on: 'bg-purple-500 text-white shadow-lg shadow-purple-200', off: 'bg-white border border-slate-200 text-slate-400 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300' },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-11 h-11 rounded-2xl font-black text-base select-none transition-all duration-150 active:scale-90
        ${active ? `${palette[label].on} scale-105` : palette[label].off}`}
    >{label}</button>
  );
};

// ─── Lecture Picker Card ──────────────────────────────────────────────────────
interface LectureOption {
  classId: string; sectionId: string; subjectId: string;
  date: string; period: number;
  className: string; sectionName: string; subjectName: string;
  time: string; room: string;
  sessionStatus: 'new' | 'draft' | 'finalized';
  savedTime?: string;
}

const LecturePicker: React.FC<{
  options: LectureOption[];
  onSelect: (opt: LectureOption) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}> = ({ options, onSelect, selectedDate, onDateChange }) => (
  <div className="flex-1 px-4 py-4 space-y-3">
    <div className="mb-4">
      <h2 className="font-heading font-black text-xl text-slate-900">Lectures</h2>
      <p className="text-sm text-slate-500 mt-0.5">Select a lecture to mark attendance</p>
    </div>

    {/* Date Picker */}
    <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1.5">
        <Calendar className="w-3.5 h-3.5 text-slate-500" />
        Select Date
      </label>
      <input
        type="date"
        value={selectedDate}
        max={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-full text-sm font-semibold text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400"
      />
    </div>

    {/* Class Teacher Note */}
    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
      <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
      <span>Showing only your assigned class teacher sections.</span>
    </div>

    {options.length === 0 && (
      <div className="py-16 text-center">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">You are not assigned as class teacher to any section.</p>
        <p className="text-xs text-slate-400 mt-1">Only class teachers can take attendance.</p>
      </div>
    )}

    {options.map((opt) => {
      const statusColor =
        opt.sessionStatus === 'finalized' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
        opt.sessionStatus === 'draft'     ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                            'bg-blue-100 text-blue-700 border-blue-200';
      const statusLabel =
        opt.sessionStatus === 'finalized' ? '✓ Finalized' :
        opt.sessionStatus === 'draft'     ? `Draft · ${opt.savedTime ?? ''}` :
                                            'Not Started';
      const canMark = opt.sessionStatus !== 'finalized';

      return (
        <button
          key={`${opt.sectionId}-${opt.subjectId}-${opt.period}`}
          onClick={() => onSelect(opt)}
          className={`w-full text-left px-4 py-4 bg-white rounded-2xl border transition-all duration-150 active:scale-[0.98]
            ${canMark ? 'border-slate-200 hover:border-blue-300 hover:shadow-md' : 'border-slate-200 opacity-80'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Subject chip */}
              <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100 mb-2">
                {opt.subjectName}
              </span>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">
                {opt.className} — {opt.sectionName}
              </h3>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />{opt.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{opt.room}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColor}`}>
                {statusLabel}
              </span>
              {canMark && (
                <span className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                  {opt.sessionStatus === 'draft' ? 'Resume' : 'Start'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
              {!canMark && (
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                  View <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>
        </button>
      );
    })}
  </div>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const TeacherTakeAttendanceScreen: React.FC<TakeAttendanceProps> = ({
  initialClassId,
  initialSectionId,
  initialSubjectId,
  initialDate = '2026-11-03',
  initialPeriod,
  onSuccess,
}) => {
  const { currentUser } = useAuth();

  // If params were passed directly (from dashboard lecture card), skip picker
  const hasDirectParams = !!(initialClassId && initialSectionId && initialSubjectId && initialPeriod);

  // ── Date state for the picker ──
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // ── Selected session ──
  const [selectedOpt, setSelectedOpt] = useState<LectureOption | null>(null);

  // Auto-select if direct params given
  useEffect(() => {
    if (hasDirectParams) {
      const classes  = simsStore.getClasses();
      const sections = simsStore.getSections(initialClassId!);
      const subjects = simsStore.getSubjects();
      const cls  = classes.find(c => c.id === initialClassId);
      const sec  = sections.find(s => s.id === initialSectionId);
      const subj = subjects.find(s => s.id === initialSubjectId);

      const existingSessions = simsStore.getAttendanceSessions({
        classId: initialClassId!, sectionId: initialSectionId!,
        subjectId: initialSubjectId!, date: initialDate,
      });
      const match = existingSessions[0];
      const status: 'new' | 'draft' | 'finalized' =
        match?.status === 'finalized' ? 'finalized' :
        match?.status === 'draft'     ? 'draft'     : 'new';

      setSelectedOpt({
        classId: initialClassId!, sectionId: initialSectionId!,
        subjectId: initialSubjectId!, date: initialDate,
        period: initialPeriod!,
        className: cls?.name ?? 'Class',
        sectionName: sec?.name ?? 'Section',
        subjectName: subj?.name ?? 'Subject',
        time: '', room: '',
        sessionStatus: status,
        savedTime: match?.lastDraftSavedAt
          ? new Date(match.lastDraftSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : undefined,
      });
    }
  }, []);

  // ── Build lecture options for picker (filtered by class teacher) ──
  const lectureOptions = React.useMemo((): LectureOption[] => {
    if (!currentUser) return [];
    const classes  = simsStore.getClasses();
    const subjects = simsStore.getSubjects();
    const allSections = simsStore.getSections();

    // Only sections where the current teacher is the class teacher
    const teacherSectionIds = new Set(
      allSections.filter((s) => s.classTeacherId === currentUser.uid).map((s) => s.id)
    );

    // Demo hardcoded lectures for teacher-david
    const demoLectures = [
      { classId: 'class-g10', sectionId: 'sec-g10-a', subjectId: 'sub-math', period: 1, time: '09:00 – 09:50 AM', room: 'Room 302' },
      { classId: 'class-g10', sectionId: 'sec-g10-b', subjectId: 'sub-math', period: 3, time: '11:00 – 11:50 AM', room: 'Room 304' },
      { classId: 'class-g11', sectionId: 'sec-g11-a', subjectId: 'sub-math', period: 4, time: '01:00 – 01:50 PM', room: 'Room 401' },
    ];

    // Filter to only class-teacher-assigned sections
    const filteredLectures = demoLectures.filter((l) => teacherSectionIds.has(l.sectionId));

    return filteredLectures.map((l) => {
      const sections = simsStore.getSections(l.classId);
      const cls  = classes.find(c => c.id === l.classId);
      const sec  = sections.find(s => s.id === l.sectionId);
      const subj = subjects.find(s => s.id === l.subjectId);

      const sessions = simsStore.getAttendanceSessions({
        classId: l.classId, sectionId: l.sectionId,
        subjectId: l.subjectId, date: selectedDate,
      });
      const match = sessions[0];
      const status: 'new' | 'draft' | 'finalized' =
        match?.status === 'finalized' ? 'finalized' :
        match?.status === 'draft'     ? 'draft'     : 'new';

      return {
        ...l,
        date: selectedDate,
        className: cls?.name ?? 'Class',
        sectionName: sec?.name ?? 'Section',
        subjectName: subj?.name ?? 'Subject',
        sessionStatus: status,
        savedTime: match?.lastDraftSavedAt
          ? new Date(match.lastDraftSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : undefined,
      };
    });
  }, [currentUser, selectedDate]);

  // ── Session / roster state ──
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [existingSession, setExistingSession] = useState<AttendanceSession | undefined>();
  const [isFinalized, setIsFinalized] = useState(false);
  const [reEditing24hr, setReEditing24hr] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const actionBarRef = useRef<HTMLDivElement>(null);
  const [actionBarHeight, setActionBarHeight] = useState(76);
  useEffect(() => {
    if (!actionBarRef.current) return;
    const ro = new ResizeObserver(() => setActionBarHeight(actionBarRef.current?.offsetHeight ?? 76));
    ro.observe(actionBarRef.current);
    return () => ro.disconnect();
  }, [isFinalized, selectedOpt]);

  // Load session when a lecture is selected
  useEffect(() => {
    if (!selectedOpt) return;
    const match = simsStore.getAttendanceSessions({
      classId: selectedOpt.classId, sectionId: selectedOpt.sectionId,
      subjectId: selectedOpt.subjectId, date: selectedOpt.date,
    })[0];

    if (match) {
      setExistingSession(match);
      setRecords(match.records ?? {});
      setIsFinalized(match.status === 'finalized');
      setReEditing24hr(false);
      setLastSavedTime(
        match.lastDraftSavedAt
          ? new Date(match.lastDraftSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : null
      );
    } else {
      setExistingSession(undefined);
      setRecords({});
      setIsFinalized(false);
      setReEditing24hr(false);
      setLastSavedTime(null);
    }
  }, [selectedOpt]);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') =>
    setToast({ message: msg, type });

  const roster = selectedOpt
    ? simsStore.getClassRoster(selectedOpt.classId, selectedOpt.sectionId)
    : [];

  const classes  = simsStore.getClasses();
  const sections = selectedOpt ? simsStore.getSections(selectedOpt.classId) : [];
  const subjects = simsStore.getSubjects();
  const currentClass   = classes.find(c => c.id === selectedOpt?.classId);
  const currentSection = sections.find(s => s.id === selectedOpt?.sectionId);
  const currentSubject = subjects.find(s => s.id === selectedOpt?.subjectId);

  // ── 24-hour edit eligibility ──
  const canEdit24hr =
    !!existingSession?.finalizedAt &&
    !!currentUser &&
    (Date.now() - new Date(existingSession.finalizedAt).getTime()) < 24 * 60 * 60 * 1000 &&
    existingSession.finalizedBy === currentUser.uid;

  // Past date = view only (cannot mark)
  const isViewingPastDate = selectedOpt ? selectedOpt.date !== initialDate : false;
  const isReadOnly = isFinalized || isViewingPastDate;

  // ── Mark handler ──
  const handleMark = (studentId: string, status: AttendanceStatus) => {
    if (isReadOnly) return;
    setRecords(prev => {
      if (prev[studentId] === status) { const n = { ...prev }; delete n[studentId]; return n; }
      return { ...prev, [studentId]: status };
    });
  };

  const handleMarkAllPresent = () => {
    if (isReadOnly) return;
    const n: Record<string, AttendanceStatus> = {};
    roster.forEach(s => (n[s.id] = 'P'));
    setRecords(n);
  };

  const handleReset = () => { if (!isReadOnly) setRecords({}); };

  const buildPayload = () => ({
    id: existingSession?.id,
    schoolId: currentUser?.schoolId ?? 'school-oakridge-01',
    classId: selectedOpt!.classId,
    className: currentClass?.name ?? '',
    sectionId: selectedOpt!.sectionId,
    sectionName: currentSection?.name ?? '',
    subjectId: selectedOpt!.subjectId,
    subjectName: currentSubject?.name ?? '',
    date: selectedOpt!.date,
    periodNumber: selectedOpt!.period,
    teacherId: currentUser?.uid ?? '',
    teacherName: currentUser?.name ?? '',
    records,
    totalStudents: roster.length,
    presentCount: Object.values(records).filter(s => s === 'P').length,
    absentCount:  Object.values(records).filter(s => s === 'A').length,
    leaveCount:   Object.values(records).filter(s => s === 'L').length,
  });

  const handleSaveDraft = () => {
    if (!currentUser || isFinalized || !selectedOpt) return;
    setSavingDraft(true);
    setTimeout(() => {
      const saved = simsStore.saveAttendanceDraft(buildPayload());
      setExistingSession(saved);
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(t);
      setSavingDraft(false);
      showToast(`Draft saved at ${t}`);
    }, 400);
  };

  const handleConfirmFinalize = () => {
    if (!currentUser || !selectedOpt) return;
    let targetId = existingSession?.id;
    if (!targetId) { const d = simsStore.saveAttendanceDraft(buildPayload()); targetId = d.id; }
    const fin = simsStore.finalizeAttendance(targetId, currentUser.uid, currentUser.name);
    setExistingSession(fin);
    setIsFinalized(true);
    setReEditing24hr(false);
    setShowFinalizeModal(false);
    showToast('Attendance finalized & published!');
    if (onSuccess) setTimeout(onSuccess, 1400);
  };

  // ── Reopen for 24hr edit ──
  const handleReopen24hr = () => {
    setIsFinalized(false);
    setReEditing24hr(true);
    showToast('Session reopened for editing (24hr window)', 'info');
  };

  // Counts
  const presentCount  = Object.values(records).filter(s => s === 'P').length;
  const absentCount   = Object.values(records).filter(s => s === 'A').length;
  const leaveCount    = Object.values(records).filter(s => s === 'L').length;
  const unmarkedCount = Math.max(0, roster.length - Object.keys(records).length);

  // ── If no lecture selected → show picker ──
  if (!selectedOpt) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
        <div className="bg-white border-b border-slate-100 px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)' }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-black text-lg text-slate-900">Take Attendance</h1>
              <p className="text-xs text-slate-500">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
        <LecturePicker
          options={lectureOptions}
          onSelect={setSelectedOpt}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>
    );
  }

  // ── Roster / marking view ──
  const statusPillClass = isFinalized
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : reEditing24hr
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : existingSession
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-blue-100 text-blue-700 border-blue-200';
  const statusLabel = isFinalized ? '✓ Finalized'
    : reEditing24hr ? 'Re-Editing (24hr)'
    : existingSession ? `Draft · ${lastSavedTime ?? ''}`
    : 'New Session';

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-3 shadow-sm">
        {/* Back to picker */}
        <button
          onClick={() => setSelectedOpt(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Lectures
        </button>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-heading font-black text-xl text-slate-900 leading-tight">
              {currentClass?.name} — {currentSection?.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentSubject?.name} · Period {selectedOpt.period}
            </p>
          </div>
          <span className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border ${statusPillClass}`}>
            {statusLabel}
          </span>
        </div>

        {/* ── Date selector with prev/next ── */}
        <div className="mt-3 flex items-center gap-2">
          {/* Previous day */}
          <button
            onClick={() => {
              const d = new Date(selectedOpt.date);
              d.setDate(d.getDate() - 1);
              setSelectedOpt(prev => prev ? { ...prev, date: d.toISOString().split('T')[0] } : prev);
            }}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center transition-all flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>

          {/* Date input */}
          <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="date"
              value={selectedOpt.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => {
                const newDate = e.target.value;
                if (!newDate) return;
                setSelectedOpt(prev => prev ? { ...prev, date: newDate } : prev);
              }}
              className="flex-1 text-sm font-semibold text-slate-800 bg-transparent outline-none"
            />
          </div>

          {/* Next day — disabled if already on today */}
          <button
            onClick={() => {
              const d = new Date(selectedOpt.date);
              const today = new Date();
              today.setHours(0,0,0,0);
              if (d >= today) return;
              d.setDate(d.getDate() + 1);
              setSelectedOpt(prev => prev ? { ...prev, date: d.toISOString().split('T')[0] } : prev);
            }}
            disabled={selectedOpt.date >= new Date().toISOString().split('T')[0]}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {selectedOpt.date !== initialDate && (
          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-400" />
            Viewing past date — attendance cannot be changed
          </p>
        )}
      </div>

      {/* ── Stats Bar ── */}
      <div className="flex bg-white border-b border-slate-100 divide-x divide-slate-100">
        {[
          { label: 'Total',    value: roster.length, vCls: 'text-slate-800',   dot: 'bg-slate-400'  },
          { label: 'Present',  value: presentCount,  vCls: 'text-emerald-700', dot: 'bg-emerald-500'},
          { label: 'Absent',   value: absentCount,   vCls: 'text-rose-700',    dot: 'bg-rose-500'   },
          { label: 'Leave',    value: leaveCount,    vCls: 'text-purple-700',  dot: 'bg-purple-500' },
          { label: 'Unmarked', value: unmarkedCount, vCls: 'text-amber-700',   dot: 'bg-amber-400'  },
        ].map(s => (
          <div key={s.label} className="flex-1 py-2.5 text-center">
            <div className={`font-black text-lg leading-none ${s.vCls}`}>{s.value}</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Batch Actions ── */}
      {!isReadOnly && (
        <div className="flex items-center gap-2 bg-white border-b border-slate-100 px-4 py-2.5">
          <button onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-all">
            <CheckCheck className="w-3.5 h-3.5" /> All Present
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 rounded-xl text-xs font-semibold transition-all">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <div className="flex-1" />
          {unmarkedCount > 0
            ? <span className="text-[11px] text-amber-600 font-semibold">{unmarkedCount} left</span>
            : <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> All marked</span>
          }
        </div>
      )}

      {/* ── Finalized Banner / 24hr Edit ── */}
      {isFinalized && existingSession && (
        canEdit24hr ? (
          <div className="mx-4 mt-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold block">Finalized — Editable Within 24 Hours</span>
              Finalized by you on{' '}
              {new Date(existingSession.finalizedAt ?? existingSession.createdAt).toLocaleString()}.
              You can still edit this session within the 24-hour window.
            </div>
            <button
              onClick={handleReopen24hr}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Within 24hrs
            </button>
          </div>
        ) : (
          <div className="mx-4 mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <span className="font-bold block">Session Locked — Official Record</span>
              Finalized by <strong>{existingSession.finalizedByName ?? 'Teacher'}</strong> on{' '}
              {new Date(existingSession.finalizedAt ?? existingSession.createdAt).toLocaleString()}.
              Corrections require admin authorization.
            </div>
          </div>
        )
      )}

      {/* ── Roster ── */}
      <div
        className="flex-1 px-4 py-3 space-y-2 overflow-y-auto"
        style={{ paddingBottom: isFinalized ? 32 : actionBarHeight + 16 }}
      >
        {roster.length === 0 && (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">No students found</p>
          </div>
        )}

        {roster.map((student, idx) => {
          const status = records[student.id];
          const isP = status === 'P', isA = status === 'A', isL = status === 'L';

          const rowBg = isP ? 'bg-emerald-50 border-emerald-200'
            : isA ? 'bg-rose-50 border-rose-200'
            : isL ? 'bg-purple-50 border-purple-200'
            : 'bg-white border-slate-200';

          const avatarBg = isP ? 'bg-emerald-500 text-white'
            : isA ? 'bg-rose-500 text-white'
            : isL ? 'bg-purple-500 text-white'
            : 'bg-slate-100 text-slate-500';

          return (
            <div key={student.id}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl border transition-colors duration-150 ${rowBg}`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-colors duration-150 ${avatarBg}`}>
                {idx + 1}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate leading-tight">{student.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">#{student.roll} · {student.admission}</p>
              </div>

              {/* Buttons OR read-only badge */}
              {!isReadOnly ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <MarkBtn label="P" active={isP} onClick={() => handleMark(student.id, 'P')} />
                  <MarkBtn label="A" active={isA} onClick={() => handleMark(student.id, 'A')} />
                  <MarkBtn label="L" active={isL} onClick={() => handleMark(student.id, 'L')} />
                </div>
              ) : (
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0
                  ${isP ? 'bg-emerald-100 text-emerald-700' : isA ? 'bg-rose-100 text-rose-700' : isL ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-400'}`}>
                  {status ?? '—'}
                </div>
              )}
            </div>
          );
        })}

        {/* ── In-page Submit button (at bottom of roster) ── */}
        {!isReadOnly && roster.length > 0 && (
          <div className="pt-3 pb-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl mb-3 text-xs text-slate-600 text-center">
              {unmarkedCount > 0
                ? <span className="text-amber-700 font-semibold">⚠️ {unmarkedCount} student{unmarkedCount !== 1 ? 's' : ''} still unmarked</span>
                : <span className="text-emerald-700 font-semibold">✓ All {roster.length} students marked — ready to submit</span>
              }
            </div>
            <button
              onClick={unmarkedCount === 0 ? handleConfirmFinalize : () => setShowFinalizeModal(true)}
              className="w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              style={{
                background: unmarkedCount === 0
                  ? 'linear-gradient(135deg,#059669,#0d9488)'
                  : 'linear-gradient(135deg,#1d4ed8,#4f46e5)',
                boxShadow: unmarkedCount === 0
                  ? '0 4px 18px rgba(5,150,105,.35)'
                  : '0 4px 18px rgba(37,99,235,.35)',
              }}
            >
              <CheckCircle2 className="w-5 h-5" />
              {unmarkedCount === 0
                ? (reEditing24hr ? 'Re-Submit Attendance' : 'Submit Attendance')
                : 'Finalize with Unmarked Students'}
            </button>
          </div>
        )}
      </div>

      {/* ── Sticky Bottom Bar ── */}
      {!isFinalized && (
        <div
          ref={actionBarRef}
          className="fixed bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl"
          style={{ left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '448px' }}
        >
          <div className="flex gap-3 px-4 py-3">
            <button onClick={handleSaveDraft} disabled={savingDraft}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.97] text-slate-700 rounded-2xl font-bold text-sm transition-all disabled:opacity-60">
              {savingDraft
                ? <span className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin" />
                : <Save className="w-4 h-4" />}
              {savingDraft ? 'Saving…' : 'Save Draft'}
            </button>

            {/* If all students are marked → direct Submit button, else Finalize with modal */}
            {unmarkedCount === 0 ? (
              <button
                onClick={handleConfirmFinalize}
                className="flex-1 flex items-center justify-center gap-2 py-4 text-white rounded-2xl font-bold text-sm transition-all active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg,#059669,#0d9488)', boxShadow: '0 4px 18px rgba(5,150,105,.35)' }}
              >
                <CheckCircle2 className="w-4 h-4" />
                {reEditing24hr ? 'Re-Submit' : 'Submit Attendance'}
              </button>
            ) : (
              <button onClick={() => setShowFinalizeModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-4 text-white rounded-2xl font-bold text-sm transition-all active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', boxShadow: '0 4px 18px rgba(37,99,235,.35)' }}>
                <CheckCircle2 className="w-4 h-4" /> {reEditing24hr ? 'Re-Finalize' : 'Finalize'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Finalize Modal ── */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowFinalizeModal(false); }}
          style={{ animation: 'fadeIn .2s ease' }}>
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl mb-2 space-y-4"
            style={{ animation: 'slideUp .3s cubic-bezier(.34,1.2,.64,1) both' }}>
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-center">
              <h3 className="font-heading font-black text-slate-900 text-lg">{reEditing24hr ? 'Re-Finalize Attendance?' : 'Finalize Attendance?'}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                <strong className="text-slate-800">{currentClass?.name} — {currentSection?.name}</strong>
                {' '}· {currentSubject?.name} · {selectedOpt.date}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { l: 'Total',   v: roster.length, c: 'bg-slate-50 border-slate-200 text-slate-700' },
                { l: 'Present', v: presentCount,  c: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                { l: 'Absent',  v: absentCount,   c: 'bg-rose-50 border-rose-200 text-rose-700' },
                { l: 'Leave',   v: leaveCount,    c: 'bg-purple-50 border-purple-200 text-purple-700' },
              ].map(s => (
                <div key={s.l} className={`rounded-xl border py-2.5 text-center ${s.c}`}>
                  <div className="text-lg font-black">{s.v}</div>
                  <div className="text-[9px] font-bold uppercase tracking-wide opacity-60 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
            {unmarkedCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                ⚠️ {unmarkedCount} student{unmarkedCount !== 1 ? 's' : ''} unmarked — no status will be recorded.
              </div>
            )}
            <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
              <strong>Audit Policy:</strong> Once finalized, this becomes an official record. Changes require admin authorization and are permanently logged.
            </p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowFinalizeModal(false)}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-colors">
                Go Back
              </button>
              <button onClick={handleConfirmFinalize}
                className="flex-1 py-3.5 text-white rounded-2xl font-bold text-sm active:scale-[0.97] transition-all"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', boxShadow: '0 4px 14px rgba(37,99,235,.3)' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastPop  { from{opacity:0;transform:translateX(-50%) translateY(-14px) scale(.9)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(48px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
    </div>
  );
};
