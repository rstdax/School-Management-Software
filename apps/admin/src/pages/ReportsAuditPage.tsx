import React, { useState } from 'react';
import { simsStore, downloadCsvFile } from '@sims/shared';
import {
  ShieldCheck,
  Download,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  User,
  Search,
} from 'lucide-react';

export const ReportsAuditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shortage' | 'audit'>('shortage');
  const [auditSearch, setAuditSearch] = useState('');

  const auditLogs = simsStore.getAuditLogs();
  const roster = simsStore.getClassRoster('class-g10', 'sec-g10-a');

  // Compute student stats
  const allStudentStats = roster.map((st) => {
    const stats = simsStore.getStudentAttendanceStats(st.id);
    return {
      ...st,
      stats,
    };
  });

  const shortageStudents = allStudentStats.filter((s) => s.stats.isShortage);

  const filteredAudit = auditLogs.filter(
    (log) =>
      log.studentName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.reason.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.authorizedByName.toLowerCase().includes(auditSearch.toLowerCase())
  );

  const handleExportFullSchoolReport = () => {
    const headers = ['Roll #', 'Student Name', 'Admission #', 'Total Classes', 'Attended', 'Absent', 'Leave', 'Percentage (%)', 'Status'];
    const rows = allStudentStats.map((st) => [
      st.roll,
      st.name,
      st.admission,
      st.stats.totalLectures,
      st.stats.presentLectures,
      st.stats.absentLectures,
      st.stats.leaveLectures,
      `${st.stats.overallPercentage}%`,
      st.stats.isShortage ? 'DEFICIENT (<75%)' : 'Eligible',
    ]);
    downloadCsvFile(`Oakridge_School_Attendance_Audit_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleExportAuditLogs = () => {
    const headers = ['Audit ID', 'Student Name', 'Old Status', 'New Status', 'Reason', 'Authorized Administrator', 'Timestamp'];
    const rows = auditLogs.map((log) => [
      log.id,
      log.studentName,
      log.oldStatus,
      log.newStatus,
      log.reason,
      log.authorizedByName,
      new Date(log.timestamp).toLocaleString(),
    ]);
    downloadCsvFile(`Attendance_Audit_Ledger_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Compliance & Analytics
          </span>
          <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
            Institutional Reports & Audit Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor chronic absenteeism thresholds and inspect permanent authorized modification logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'shortage' ? (
            <button
              onClick={handleExportFullSchoolReport}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export School Attendance CSV</span>
            </button>
          ) : (
            <button
              onClick={handleExportAuditLogs}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit Ledger CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl max-w-sm">
        <button
          onClick={() => setActiveTab('shortage')}
          className={`flex-1 py-2 text-xs font-heading font-bold rounded-xl transition-all ${
            activeTab === 'shortage' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Shortage Roster (&lt;75%)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 text-xs font-heading font-bold rounded-xl transition-all ${
            activeTab === 'audit' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Permanent Audit Ledger ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Shortage Roster */}
      {activeTab === 'shortage' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>
                <strong>{shortageStudents.length} Students</strong> are currently below the institutional mandatory 75% attendance threshold.
              </span>
            </div>
            <span className="text-[11px] font-bold bg-amber-200/70 px-2 py-0.5 rounded-full">
              Examination Disqualification Warning
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Roll #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Admission #</th>
                  <th className="py-3 px-4 text-center">Classes Attended</th>
                  <th className="py-3 px-4 text-center">Shortage Subject</th>
                  <th className="py-3 px-4 text-right">Aggregate Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shortageStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-700">#{st.roll}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{st.name}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{st.admission}</td>
                    <td className="py-3.5 px-4 text-center text-slate-700 font-semibold">
                      {st.stats.presentLectures} of {st.stats.totalLectures}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full">
                        Physics (71%)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-heading font-black text-rose-600 text-sm">
                      {st.stats.overallPercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Permanent Audit Ledger */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit trail by student, admin, or reason..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Immutable Append-Only Audit Trail</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredAudit.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-slate-900 text-sm">
                        {log.studentName}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                          {log.oldStatus}
                        </span>
                        <span>→</span>
                        <span className="font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                          {log.newStatus}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Mandatory Justification:</strong> {log.reason}
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Authorized by: <strong>{log.authorizedByName}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

