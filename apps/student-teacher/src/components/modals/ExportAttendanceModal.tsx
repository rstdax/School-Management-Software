import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { simsStore, downloadCsvFile } from '@sims/shared';
import { X, Printer, Download, Award } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudentId?: string;
}

export const ExportAttendanceModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  targetStudentId,
}) => {
  const { currentUser } = useAuth();
  if (!isOpen) return null;

  const studentId = targetStudentId || currentUser?.uid || 'student-alex';
  const student = simsStore.getUserById(studentId) || currentUser;
  const school = simsStore.getSchool();
  const stats = simsStore.getStudentAttendanceStats(studentId);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['Subject', 'Department', 'Total Lectures', 'Present', 'Absent', 'Leave', 'Percentage (%)', 'Status'];
    const rows = stats.subjectBreakdown.map((s) => [
      s.subjectName,
      'Academic',
      s.total,
      s.present,
      s.absent,
      s.leave,
      `${s.percentage}%`,
      s.percentage < 75 ? 'SHORTAGE ALERT' : 'Normal',
    ]);

    // Add summary row
    rows.push([
      'TOTAL CUMULATIVE',
      'All Subjects',
      stats.totalLectures,
      stats.presentLectures,
      stats.absentLectures,
      stats.leaveLectures,
      `${stats.overallPercentage}%`,
      stats.isShortage ? 'DEFICIENT (<75%)' : 'ELIGIBLE',
    ]);

    const filename = `${student?.name.replace(/\s+/g, '_')}_Attendance_Report_${new Date().toISOString().split('T')[0]}`;
    downloadCsvFile(filename, headers, rows);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity no-print" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Action Header (hidden on print) */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="font-heading font-bold text-slate-900 text-sm">
              Official Attendance Statement & Export
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              Download CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / PDF
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document */}
        <div className="p-8 text-slate-800 space-y-6">
          {/* Institution Header */}
          <div className="text-center border-b border-slate-200 pb-5">
            <h1 className="font-heading font-black text-xl text-slate-900 tracking-tight">
              {school.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{school.address} • {school.phone}</p>
            <div className="inline-block bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-full mt-2 uppercase tracking-wider">
              Cumulative Student Attendance Dossier • Academic Year {school.academicYear}
            </div>
          </div>

          {/* Student Dossier Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Student Name</span>
              <span className="font-bold text-slate-900">{student?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Admission No.</span>
              <span className="font-bold text-slate-900">{student?.studentData?.admissionNumber || 'ADM-2026-1042'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Class & Section</span>
              <span className="font-bold text-slate-900">{student?.studentData?.className || 'Grade 10'} - {student?.studentData?.sectionName || 'Section A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Roll Number</span>
              <span className="font-bold text-slate-900">#{student?.studentData?.rollNumber || '14'}</span>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <span className="block text-[10px] font-bold uppercase text-blue-700">Total Lectures</span>
              <span className="text-lg font-black text-blue-900">{stats.totalLectures}</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="block text-[10px] font-bold uppercase text-emerald-700">Present</span>
              <span className="text-lg font-black text-emerald-900">{stats.presentLectures}</span>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <span className="block text-[10px] font-bold uppercase text-rose-700">Absent</span>
              <span className="text-lg font-black text-rose-900">{stats.absentLectures}</span>
            </div>
            <div className={`p-3 rounded-xl border ${stats.isShortage ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
              <span className="block text-[10px] font-bold uppercase opacity-80">Aggregate</span>
              <span className="text-lg font-black">{stats.overallPercentage}%</span>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
              Course-wise Lecture Attendance
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3 text-center">Classes</th>
                    <th className="py-2.5 px-3 text-center">Present</th>
                    <th className="py-2.5 px-3 text-center">Absent</th>
                    <th className="py-2.5 px-3 text-right">Percentage</th>
                    <th className="py-2.5 px-3 text-center">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.subjectBreakdown.map((sub) => (
                    <tr key={sub.subjectId} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-800">{sub.subjectName}</td>
                      <td className="py-2 px-3 text-center text-slate-600">{sub.total}</td>
                      <td className="py-2 px-3 text-center text-emerald-600 font-semibold">{sub.present}</td>
                      <td className="py-2 px-3 text-center text-rose-600 font-semibold">{sub.absent}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{sub.percentage}%</td>
                      <td className="py-2 px-3 text-center">
                        {sub.percentage < 75 ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full">
                            Shortage Alert
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                            Satisfactory
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Signatures */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-[11px] text-slate-500">
            <div className="border-t border-slate-300 pt-2 font-medium">
              Class Teacher Signature
            </div>
            <div className="border-t border-slate-300 pt-2 font-medium">
              Attendance Officer / Dean
            </div>
            <div className="border-t border-slate-300 pt-2 font-medium">
              Parent / Guardian Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

