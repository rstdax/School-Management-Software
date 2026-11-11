import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { simsStore, AttendanceSession, AttendanceStatus } from '@sims/shared';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Edit3,
  Calendar,
  X,
  User,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export const AttendanceOversightPage: React.FC = () => {
  const { currentAdmin, hasPermission } = useAdminAuth();

  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'finalized'>('all');
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);

  // Correction Modal
  const [correctionTargetStudent, setCorrectionTargetStudent] = useState<{ id: string; name: string; currentStatus: AttendanceStatus } | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('P');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionError, setCorrectionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const sessions = simsStore.getAttendanceSessions({
    date: dateFilter || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const roster = selectedSession
    ? simsStore.getClassRoster(selectedSession.classId, selectedSession.sectionId)
    : [];

  const handleOpenCorrection = (studentId: string, studentName: string, currentStatus: AttendanceStatus) => {
    setCorrectionTargetStudent({ id: studentId, name: studentName, currentStatus });
    setNewStatus(currentStatus === 'P' ? 'A' : 'P');
    setCorrectionReason('');
    setCorrectionError('');
  };

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !correctionTargetStudent || !currentAdmin) return;

    if (!correctionReason || correctionReason.trim().length < 5) {
      setCorrectionError('Mandatory audit policy: A reason (min 5 chars) is required for authorized correction.');
      return;
    }

    const res = simsStore.applyAuthorizedCorrection({
      sessionId: selectedSession.id,
      studentId: correctionTargetStudent.id,
      studentName: correctionTargetStudent.name,
      newStatus,
      reason: correctionReason.trim(),
      authorizedBy: currentAdmin.uid,
      authorizedByName: `${currentAdmin.name} (${currentAdmin.adminData?.adminRole || 'Admin'})`,
    });

    if (!res.success) {
      setCorrectionError(res.error || 'Failed to apply authorized correction.');
      return;
    }

    // Refresh selected session in view
    const updated = simsStore.getAttendanceSessionById(selectedSession.id);
    if (updated) setSelectedSession(updated);

    setActionSuccess(`Attendance for ${correctionTargetStudent.name} updated to '${newStatus}'. Immutable audit record recorded.`);
    setCorrectionTargetStudent(null);
    setTimeout(() => setActionSuccess(''), 4500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
          Compliance & Verification
        </span>
        <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
          Attendance Oversight & Authorized Corrections
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review all institution lecture rosters. Corrections post-finalization mandate authorized justification and append to the immutable audit ledger.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Clear Date
              </button>
            )}
          </div>

          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
            {(['all', 'finalized', 'draft'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {sessions.length} recorded session(s)
        </span>
      </div>

      {/* Main Grid: Sessions List + Roster Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sessions Column */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-heading font-bold text-slate-900 text-sm">
            Lecture Attendance Sessions
          </h3>

          {sessions.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <span>No sessions match the current filter.</span>
            </div>
          ) : (
            sessions.map((sess) => {
              const isSelected = selectedSession?.id === sess.id;
              return (
                <div
                  key={sess.id}
                  onClick={() => setSelectedSession(sess)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading font-bold text-sm text-slate-900">
                      {sess.className} - {sess.sectionName}
                    </span>
                    {sess.status === 'finalized' ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        Finalized ✓
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-indigo-700 mt-1">
                    {sess.subjectName} • Period {sess.periodNumber || 1}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    <span>{sess.date}</span>
                    <span>By: {sess.teacherName}</span>
                  </div>

                  {/* Summary pills */}
                  <div className="flex items-center gap-2 mt-2 pt-1 text-[11px]">
                    <span className="text-emerald-700 font-bold">{sess.presentCount} Present</span>
                    <span>•</span>
                    <span className="text-rose-700 font-bold">{sess.absentCount} Absent</span>
                    <span>•</span>
                    <span className="text-slate-400">{sess.totalStudents} Total</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Session Roster Inspector */}
        <div className="lg:col-span-7">
          {selectedSession ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-slate-900 text-base">
                      {selectedSession.className} {selectedSession.sectionName} - {selectedSession.subjectName}
                    </h3>
                    <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                      {selectedSession.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedSession.status === 'finalized'
                      ? `Finalized by ${selectedSession.finalizedByName || selectedSession.teacherName} on ${new Date(selectedSession.finalizedAt || selectedSession.createdAt).toLocaleString()}`
                      : 'Draft lecture session - not yet officially finalized'}
                  </p>
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">Roll #</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Admission</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roster.map((st) => {
                      const stStatus = selectedSession.records[st.id] || 'A';
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-bold text-slate-700">
                            #{st.roll}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {st.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono">
                            {st.admission}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {stStatus === 'P' ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                                Present
                              </span>
                            ) : stStatus === 'L' ? (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-full">
                                Leave
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full">
                                Absent
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleOpenCorrection(st.id, st.name, stStatus)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg text-[11px] font-bold transition-colors"
                              title="Authorized Correction"
                            >
                              Authorize Correction
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 text-slate-400 text-center">
              <CheckSquare className="w-10 h-10 opacity-30 mb-2" />
              <h4 className="font-heading font-bold text-slate-700 text-sm">Select a Lecture Session</h4>
              <p className="text-xs text-slate-400 mt-1">
                Choose any lecture from the list on the left to inspect student attendance records and perform authorized modifications.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Authorized Correction Modal */}
      {correctionTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                <h3 className="font-heading font-black text-slate-900 text-base">
                  Authorized Attendance Correction
                </h3>
              </div>
              <button
                onClick={() => setCorrectionTargetStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1 text-slate-600">
              <div>Student: <strong className="text-slate-900">{correctionTargetStudent.name}</strong></div>
              <div>Session: {selectedSession?.className} {selectedSession?.sectionName} ({selectedSession?.subjectName})</div>
              <div>Date: {selectedSession?.date}</div>
              <div>Current Status: <strong className="text-slate-900">{correctionTargetStudent.currentStatus}</strong></div>
            </div>

            {correctionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{correctionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitCorrection} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Official Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['P', 'A', 'L'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        newStatus === st
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {st === 'P' ? 'Present (P)' : st === 'A' ? 'Absent (A)' : 'Leave (L)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mandatory Audit Reason (Required) *
                </label>
                <textarea
                  value={correctionReason}
                  onChange={(e) => {
                    setCorrectionReason(e.target.value);
                    if (correctionError) setCorrectionError('');
                  }}
                  rows={3}
                  placeholder="e.g. Medical certificate verified by Principal; student attended laboratory..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * An immutable entry containing your administrator credentials, old status, new status, and timestamp will be written to the audit log.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCorrectionTargetStudent(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Confirm & Commit to Audit Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

