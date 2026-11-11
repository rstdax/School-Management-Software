import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { simsStore, downloadCsvFile, UserProfile } from '@sims/shared';
import {
  BarChart3,
  Download,
  AlertTriangle,
  Users,
  Search,
  Star,
  UserPlus,
  Award,
  Upload,
  CheckCircle2,
  XCircle,
  Calendar,
  FileText,
  ClipboardCheck,
  UserCheck,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────
const calcGrade = (pct: number) =>
  pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F';

const parseCSV = (text: string) => {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, vals[i]]));
  });
};

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthLabelFromValue = (val: string) => {
  const [y, m] = val.split('-');
  return `${monthNames[parseInt(m, 10) - 1]} ${y}`;
};

const ratingLabel = (r: number) => ['', 'Poor', 'Below Avg', 'Average', 'Good', 'Excellent'][r] ?? '';

// ── Toast ───────────────────────────────────────────────────────────────────────
const Toast: React.FC<{ message: string; type: 'success' | 'error' | 'info'; onDone: () => void }> = ({ message, type, onDone }) => {
  React.useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [onDone]);
  const bg = type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#1e293b';
  return (
    <div className="fixed top-5 left-1/2 z-[200] px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white text-center"
      style={{ background: bg, transform: 'translateX(-50%)', maxWidth: 320, width: 'max-content' }}>
      {message}
    </div>
  );
};

// ── Rating Row (1-5 button group) ──────────────────────────────────────────────
const RatingRow: React.FC<{ label: string; value: number; onChange: (v: 1 | 2 | 3 | 4 | 5) => void }> = ({ label, value, onChange }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <span className="text-[11px] text-slate-400 font-medium">{value ? ratingLabel(value) : 'Not rated'}</span>
    </div>
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n as 1 | 2 | 3 | 4 | 5)}
          className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            value === n
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  </div>
);

type TabKey = 'attendance' | 'performance' | 'grade_sheet' | 'enrollment';

export const TeacherReportsScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('attendance');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => setToast({ message, type });

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'attendance',   label: 'Attendance',  icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { key: 'performance',  label: 'Performance', icon: <Star className="w-3.5 h-3.5" /> },
    { key: 'grade_sheet',   label: 'Grade Sheet', icon: <Award className="w-3.5 h-3.5" /> },
    { key: 'enrollment',   label: 'Enrollment',  icon: <UserPlus className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen pb-20" style={{ background: '#F5F0EB' }}>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      <div className="p-4 sm:p-5 max-w-lg mx-auto space-y-4">
        {/* Title */}
        <div>
          <h1 className="font-heading font-black text-xl text-slate-900 tracking-tight">Teacher Reports</h1>
          <p className="text-xs text-slate-500">Attendance, performance, grades & enrollment</p>
        </div>

        {/* Tab Bar */}
        <div className="flex bg-white rounded-2xl p-1 border border-slate-200 shadow-xs sticky top-0 z-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-heading font-bold rounded-xl transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'attendance' && <AttendanceTab showToast={showToast} />}
        {activeTab === 'performance' && <PerformanceTab showToast={showToast} />}
        {activeTab === 'grade_sheet' && <GradeSheetTab showToast={showToast} />}
        {activeTab === 'enrollment' && <EnrollmentTab showToast={showToast} />}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// TAB 1 — ATTENDANCE
// ════════════════════════════════════════════════════════════════════════════════
const AttendanceTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const [view, setView] = useState<'roster' | 'sessions'>('roster');
  const [selectedClassId, setSelectedClassId] = useState('class-g10');
  const [selectedSectionId, setSelectedSectionId] = useState('sec-g10-a');
  const [shortageOnly, setShortageOnly] = useState(false);
  const [search, setSearch] = useState('');
  // Previous sessions filter
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'finalized' | 'draft'>('all');

  const classes  = simsStore.getClasses();
  const sections = simsStore.getSections(selectedClassId);
  const roster   = simsStore.getClassRoster(selectedClassId, selectedSectionId);

  const studentReports = roster.map(st => ({ ...st, stats: simsStore.getStudentAttendanceStats(st.id) }));
  const filtered = studentReports.filter(st => {
    if (shortageOnly && !st.stats.isShortage) return false;
    if (search && !st.name.toLowerCase().includes(search.toLowerCase()) && !st.roll.includes(search)) return false;
    return true;
  });

  const totalStudents = studentReports.length;
  const shortageCount = studentReports.filter(s => s.stats.isShortage).length;
  const avgPct = totalStudents > 0
    ? Math.round(studentReports.reduce((a, s) => a + s.stats.overallPercentage, 0) / totalStudents)
    : 0;

  // Previous sessions
  const allSessions = simsStore.getAttendanceSessions({
    classId: selectedClassId,
    sectionId: selectedSectionId,
    date: dateFilter || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  }).sort((a, b) => b.date.localeCompare(a.date));

  const handleExportCsv = () => {
    const headers = ['Roll #', 'Student Name', 'Admission #', 'Total Classes', 'Present', 'Absent', 'Attendance %', 'Status'];
    const rows = studentReports.map(st => [
      st.roll, st.name, st.admission,
      st.stats.totalLectures, st.stats.presentLectures, st.stats.absentLectures,
      `${st.stats.overallPercentage}%`, st.stats.isShortage ? 'SHORTAGE (<75%)' : 'Eligible',
    ]);
    downloadCsvFile(`Attendance_${selectedClassId}_${new Date().toISOString().split('T')[0]}`, headers, rows);
    showToast('CSV exported');
  };

  return (
    <>
      {/* ── Subheader ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-sm text-slate-900">Class Attendance</h2>
          <p className="text-xs text-slate-500">Roster summary & previous sessions</p>
        </div>
        <button onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* ── Class + Section filter ── */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Class</label>
          <select value={selectedClassId}
            onChange={e => { setSelectedClassId(e.target.value); setSelectedSectionId(simsStore.getSections(e.target.value)[0]?.id ?? ''); }}
            className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400">
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Section</label>
          <select value={selectedSectionId} onChange={e => setSelectedSectionId(e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400">
            {sections.map(s => <option key={s.id} value={s.id}>{s.name} ({s.room})</option>)}
          </select>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
          <span className="text-xs text-slate-400 font-medium block">Enrolled</span>
          <span className="font-heading font-black text-base text-slate-900 block mt-0.5">{totalStudents}</span>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-center shadow-xs">
          <span className="text-xs text-blue-600 font-medium block">Avg. Attendance</span>
          <span className="font-heading font-black text-base text-blue-700 block mt-0.5">{avgPct}%</span>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-center shadow-xs">
          <span className="text-xs text-amber-600 font-medium block">Below 75%</span>
          <span className="font-heading font-black text-base text-amber-700 block mt-0.5">{shortageCount}</span>
        </div>
      </div>

      {/* ── View switcher ── */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        <button onClick={() => setView('roster')}
          className={`flex-1 py-2 text-xs font-heading font-bold rounded-xl transition-all ${view === 'roster' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>
          📋 Student Roster
        </button>
        <button onClick={() => setView('sessions')}
          className={`flex-1 py-2 text-xs font-heading font-bold rounded-xl transition-all ${view === 'sessions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>
          📅 Previous Sessions ({allSessions.length})
        </button>
      </div>

      {/* ── Roster View ── */}
      {view === 'roster' && (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search student or roll #..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none" />
            </div>
            <button onClick={() => setShortageOnly(!shortageOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${shortageOnly ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
              <AlertTriangle className="w-3.5 h-3.5" /> Shortage
            </button>
          </div>

          <div className="space-y-2">
            {filtered.map(st => (
              <div key={st.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${st.stats.isShortage ? 'bg-amber-50/30 border-amber-200' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center ${st.stats.isShortage ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'}`}>
                    #{st.roll}
                  </span>
                  <div>
                    <p className="font-bold text-xs text-slate-900">{st.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{st.stats.presentLectures}/{st.stats.totalLectures} present</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-black text-sm block ${st.stats.isShortage ? 'text-rose-600' : 'text-slate-900'}`}>
                    {st.stats.overallPercentage}%
                  </span>
                  <span className="text-[10px] text-slate-400">{st.stats.isShortage ? '⚠ Shortage' : '✓ Good'}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No students match your filter</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Previous Sessions View ── */}
      {view === 'sessions' && (
        <>
          {/* Date + Status filter */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Date</label>
              <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | 'finalized' | 'draft')}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none font-semibold">
                <option value="all">All</option>
                <option value="finalized">Finalized</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-[11px] text-slate-400 hover:text-slate-700 font-semibold -mt-1">
              × Clear date filter
            </button>
          )}

          <div className="space-y-2.5">
            {allSessions.length === 0 && (
              <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No sessions found for this filter</p>
              </div>
            )}
            {allSessions.map(sess => (
              <div key={sess.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{sess.subjectName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {sess.date} · Period {sess.periodNumber ?? 1} · {sess.teacherName}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 ${
                    sess.status === 'finalized'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {sess.status === 'finalized' ? '✓ Finalized' : 'Draft'}
                  </span>
                </div>
                {/* Summary pills */}
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 font-bold">
                    P: {sess.presentCount}
                  </span>
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-100 font-bold">
                    A: {sess.absentCount}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 font-bold">
                    L: {sess.leaveCount}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-200 font-bold">
                    Total: {sess.totalStudents}
                  </span>
                </div>
                {/* Per-student records */}
                <details className="mt-2">
                  <summary className="text-[11px] font-semibold text-blue-600 cursor-pointer hover:text-blue-800">
                    View student records ▸
                  </summary>
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                    {roster.map(st => {
                      const s = sess.records[st.id];
                      return (
                        <div key={st.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-50 text-xs">
                          <span className="font-medium text-slate-700">#{st.roll} {st.name}</span>
                          <span className={`px-2 py-0.5 rounded-lg font-bold text-[10px] ${
                            s === 'P' ? 'bg-emerald-100 text-emerald-700' :
                            s === 'A' ? 'bg-rose-100 text-rose-700' :
                            s === 'L' ? 'bg-purple-100 text-purple-700' :
                            'bg-slate-100 text-slate-400'
                          }`}>
                            {s ?? '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// TAB 2 — PERFORMANCE REPORT
// ════════════════════════════════════════════════════════════════════════════════
const PerformanceTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const { currentUser } = useAuth();
  const classId = 'class-g10';
  const sectionId = 'sec-g10-a';
  const roster = simsStore.getClassRoster(classId, sectionId);

  const [studentId, setStudentId] = useState('');
  const [month, setMonth] = useState('2026-11');
  const [academicRating, setAcademicRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [behaviorRating, setBehaviorRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [participationRating, setParticipationRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [homeworkRating, setHomeworkRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [teacherRemarks, setTeacherRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!currentUser) return null;

  const selectedStudent = roster.find((s) => s.id === studentId);

  const handleSubmit = () => {
    if (!studentId || !selectedStudent) {
      showToast('Please select a student first', 'error');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      simsStore.savePerformanceReport({
        id: `perf-${Date.now()}`,
        schoolId: currentUser.schoolId,
        studentId,
        studentName: selectedStudent.name,
        classId,
        sectionId,
        teacherId: currentUser.uid,
        teacherName: currentUser.name,
        month,
        monthLabel: monthLabelFromValue(month),
        academicRating,
        behaviorRating,
        participationRating,
        homeworkRating,
        strengths,
        improvements,
        teacherRemarks,
        createdAt: new Date().toISOString(),
      });
      setSubmitting(false);
      showToast('Performance report submitted!');
      // Reset
      setStudentId('');
      setStrengths('');
      setImprovements('');
      setTeacherRemarks('');
    }, 500);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-amber-500" />
        <h2 className="font-heading font-bold text-sm text-slate-900">Monthly Performance Report</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
        {/* Student Select */}
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1.5">Select Student</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full text-sm font-semibold text-slate-800 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400"
          >
            <option value="">Choose a student…</option>
            {roster.map((s) => (
              <option key={s.id} value={s.id}>#{s.roll} · {s.name}</option>
            ))}
          </select>
        </div>

        {/* Month Select */}
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1.5">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full text-sm font-semibold text-slate-800 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400"
          />
          <p className="text-[11px] text-slate-400 mt-1">{monthLabelFromValue(month)}</p>
        </div>

        {/* Ratings */}
        <div className="space-y-3 pt-1">
          <RatingRow label="Academic Rating" value={academicRating} onChange={setAcademicRating} />
          <RatingRow label="Behavior Rating" value={behaviorRating} onChange={setBehaviorRating} />
          <RatingRow label="Participation Rating" value={participationRating} onChange={setParticipationRating} />
          <RatingRow label="Homework Rating" value={homeworkRating} onChange={setHomeworkRating} />
        </div>

        {/* Textareas */}
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1.5">Strengths</label>
          <textarea
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            rows={3}
            placeholder="Key strengths observed this month…"
            className="w-full text-xs text-slate-700 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1.5">Areas for Improvement</label>
          <textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            rows={3}
            placeholder="Areas where the student can improve…"
            className="w-full text-xs text-slate-700 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1.5">Teacher Remarks</label>
          <textarea
            value={teacherRemarks}
            onChange={(e) => setTeacherRemarks(e.target.value)}
            rows={3}
            placeholder="Overall remarks for parents/records…"
            className="w-full text-xs text-slate-700 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !studentId}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-sm transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <ClipboardCheck className="w-4 h-4" />
          )}
          {submitting ? 'Submitting…' : 'Submit Performance Report'}
        </button>
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// TAB 3 — GRADE SHEET UPLOAD
// ════════════════════════════════════════════════════════════════════════════════
interface CsvRow {
  StudentId: string;
  SubjectId: string;
  SubjectName: string;
  ObtainedMarks: string;
  TotalMarks: string;
}

const GradeSheetTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const { currentUser } = useAuth();
  const classId = 'class-g10';
  const sectionId = 'sec-g10-a';
  const roster = simsStore.getClassRoster(classId, sectionId);

  const [examName, setExamName] = useState('');
  const [examType, setExamType] = useState<'midterm' | 'final' | 'unit_test' | 'quarterly'>('midterm');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const currentClass = simsStore.getClasses().find((c) => c.id === classId);
  const currentSection = simsStore.getSections(classId).find((s) => s.id === sectionId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result ?? '');
      const parsed = parseCSV(text) as unknown as CsvRow[];
      setCsvRows(parsed);
      if (parsed.length > 0) {
        showToast(`${parsed.length} rows parsed from CSV`);
      } else {
        showToast('CSV is empty or invalid', 'error');
      }
    };
    reader.readAsText(file);
  };

  const uniqueStudentIds = Array.from(new Set(csvRows.map((r) => r.StudentId).filter(Boolean)));

  const handleSubmit = () => {
    if (!examName.trim()) { showToast('Please enter an exam name', 'error'); return; }
    if (csvRows.length === 0) { showToast('Please upload a CSV file first', 'error'); return; }

    setSubmitting(true);
    setTimeout(() => {
      uniqueStudentIds.forEach((sid) => {
        const studentRows = csvRows.filter((r) => r.StudentId === sid);
        const rosterStudent = roster.find((r) => r.id === sid);
        const studentName = rosterStudent?.name ?? sid;

        const subjects = studentRows.map((r) => {
          const obtained = Number(r.ObtainedMarks) || 0;
          const total = Number(r.TotalMarks) || 100;
          const pct = total > 0 ? (obtained / total) * 100 : 0;
          return {
            subjectId: r.SubjectId || `sub-${Date.now()}`,
            subjectName: r.SubjectName || 'Unknown',
            totalMarks: total,
            obtainedMarks: obtained,
            grade: calcGrade(pct),
            isPassed: pct >= 50,
          };
        });

        const totalMarks = subjects.reduce((a, s) => a + s.totalMarks, 0);
        const obtainedMarks = subjects.reduce((a, s) => a + s.obtainedMarks, 0);
        const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 1000) / 10 : 0;

        simsStore.saveExamResult({
          id: `result-${sid}-${Date.now()}`,
          schoolId: currentUser.schoolId,
          studentId: sid,
          studentName,
          classId,
          className: currentClass?.name ?? 'Grade 10',
          sectionId,
          examName: examName.trim(),
          examType,
          academicYear,
          subjects,
          totalMarks,
          obtainedMarks,
          percentage,
          grade: calcGrade(percentage),
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
      });
      setSubmitting(false);
      showToast(`Grade sheet published for ${uniqueStudentIds.length} students!`);
      // Reset
      setExamName('');
      setCsvRows([]);
      setFileName('');
      if (fileRef.current) fileRef.current.value = '';
    }, 600);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-amber-500" />
        <h2 className="font-heading font-bold text-sm text-slate-900">Grade Sheet Upload</h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
        {/* Exam Name */}
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1.5">Exam Name</label>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="e.g. Mid-Term 2026"
            className="w-full text-sm font-semibold text-slate-800 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Exam Type */}
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1.5">Exam Type</label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value as 'midterm' | 'final' | 'unit_test' | 'quarterly')}
            className="w-full text-sm font-semibold text-slate-800 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400"
          >
            <option value="midterm">Midterm</option>
            <option value="final">Final</option>
            <option value="unit_test">Unit Test</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>

        {/* Academic Year */}
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1.5">Academic Year</label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="2026-2027"
            className="w-full text-sm font-semibold text-slate-800 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* CSV Upload */}
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1.5">Upload Grades CSV</label>
          <div className="flex items-center gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              {fileName || 'Choose CSV file…'}
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            CSV header: <code className="bg-slate-100 px-1 rounded">StudentId,SubjectId,SubjectName,ObtainedMarks,TotalMarks</code>
          </p>
        </div>

        {/* Preview Table */}
        {csvRows.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600">Preview ({csvRows.length} rows · {uniqueStudentIds.length} students)</span>
              <button onClick={() => { setCsvRows([]); setFileName(''); if (fileRef.current) fileRef.current.value = ''; }}
                className="text-[11px] text-rose-600 font-semibold hover:underline">Clear</button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="text-left px-3 py-2 font-semibold">Student</th>
                    <th className="text-left px-2 py-2 font-semibold">Subject</th>
                    <th className="text-center px-2 py-2 font-semibold">Marks</th>
                    <th className="text-center px-2 py-2 font-semibold">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(0, 50).map((r, i) => {
                    const obtained = Number(r.ObtainedMarks) || 0;
                    const total = Number(r.TotalMarks) || 100;
                    const pct = total > 0 ? (obtained / total) * 100 : 0;
                    return (
                      <tr key={i} className={`border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                        <td className="px-3 py-2 font-medium text-slate-800 truncate max-w-[90px]">{r.StudentId}</td>
                        <td className="px-2 py-2 text-slate-600 truncate max-w-[90px]">{r.SubjectName}</td>
                        <td className="px-2 py-2 text-center text-slate-600">{obtained}/{total}</td>
                        <td className="px-2 py-2 text-center">
                          <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">{calcGrade(pct)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {csvRows.length > 50 && (
                <p className="text-[10px] text-slate-400 text-center py-1.5 bg-slate-50">…and {csvRows.length - 50} more rows</p>
              )}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || csvRows.length === 0 || !examName.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-sm transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          {submitting ? 'Publishing…' : `Publish Grades for ${uniqueStudentIds.length || 0} Students`}
        </button>
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// TAB 4 — ENROLLMENT APPROVAL
// ════════════════════════════════════════════════════════════════════════════════
const EnrollmentTab: React.FC<{ showToast: (m: string, t?: 'success' | 'error' | 'info') => void }> = ({ showToast }) => {
  const { currentUser } = useAuth();
  const [actionBanner, setActionBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const classId = 'class-g10';
  const sectionId = 'sec-g10-a';
  const className = 'Grade 10';
  const sectionName = 'Section A';

  const roster = simsStore.getClassRoster(classId, sectionId);

  const pendingStudents = simsStore
    .getPendingPlacementStudents()
    .filter((st) => st.studentData?.className?.includes('Grade 10'));

  if (!currentUser) return null;

  const handleApprove = (student: UserProfile) => {
    const nextRollNumber = String(roster.length + 1).padStart(2, '0');
    simsStore.assignOfficialPlacement(student.uid, classId, className, sectionId, sectionName, nextRollNumber);
    setActionBanner({ type: 'success', message: `${student.name} approved and assigned to ${className} ${sectionName} (Roll #${nextRollNumber})` });
    showToast('Enrollment approved!');
  };

  const handleReject = (student: UserProfile) => {
    const st = simsStore.getUserById(student.uid);
    if (st) {
      simsStore.saveUser({ ...st, status: 'rejected' });
      setActionBanner({ type: 'error', message: `${student.name}'s enrollment request has been rejected` });
      showToast('Enrollment rejected', 'info');
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-slate-600" />
        <h2 className="font-heading font-bold text-sm text-slate-900">Enrollment Approval</h2>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
          {pendingStudents.length} pending
        </span>
      </div>

      {actionBanner && (
        <div className={`p-3 rounded-2xl border flex items-start gap-2 ${
          actionBanner.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {actionBanner.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          <span className="text-xs font-semibold">{actionBanner.message}</span>
        </div>
      )}

      {pendingStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-10 text-center">
          <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">No pending enrollment requests for your class</p>
          <p className="text-xs text-slate-400 mt-1">New placement requests will appear here for approval.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingStudents.map((st) => (
            <div key={st.uid} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
                    {st.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-heading font-bold text-sm text-slate-900 truncate">{st.name}</h4>
                    <p className="text-[11px] text-slate-500">Admission # {st.studentData?.admissionNumber ?? 'N/A'}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200 flex-shrink-0">
                  Pending
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-50 rounded-xl px-3 py-2">
                  <span className="text-[10px] text-slate-400 font-medium block">Requested Class</span>
                  <span className="text-xs font-bold text-slate-700">{st.studentData?.className ?? 'N/A'}</span>
                </div>
                <div className="bg-slate-50 rounded-xl px-3 py-2">
                  <span className="text-[10px] text-slate-400 font-medium block">Date of Birth</span>
                  <span className="text-xs font-bold text-slate-700">{st.studentData?.dob ?? 'N/A'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(st)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(st)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
