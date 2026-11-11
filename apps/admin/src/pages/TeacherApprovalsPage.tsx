import React, { useState } from 'react';
import { simsStore, UserProfile } from '@sims/shared';
import { UserCheck, CheckCircle2, XCircle, AlertCircle, Mail, Phone, BookOpen, Clock } from 'lucide-react';

export const TeacherApprovalsPage: React.FC = () => {
  const pendingTeachers = simsStore.getPendingTeachers();
  const [selectedTeacher, setSelectedTeacher] = useState<UserProfile | null>(null);
  const [assignedDepartment, setAssignedDepartment] = useState('Science & Biology');
  const [actionSuccess, setActionSuccess] = useState('');

  const handleApprove = (teacher: UserProfile) => {
    simsStore.approveTeacher(teacher.uid, assignedDepartment);
    setActionSuccess(`Faculty account for ${teacher.name} approved successfully. Teacher can now access classroom rosters.`);
    setSelectedTeacher(null);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleReject = (teacher: UserProfile) => {
    if (window.confirm(`Are you sure you want to reject the application for ${teacher.name}?`)) {
      simsStore.rejectTeacher(teacher.uid, 'Credentials did not match institutional criteria.');
      setActionSuccess(`Application for ${teacher.name} was rejected.`);
      setSelectedTeacher(null);
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
          Faculty Governance
        </span>
        <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
          Teacher Registration Approvals
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Newly registered teacher accounts require administrator verification prior to granting classroom workspace access.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Pending Teachers Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="font-heading font-bold text-slate-900 text-sm">
            Pending Faculty Verification Queue ({pendingTeachers.length})
          </h3>
          <span className="text-xs text-slate-400">
            Self-registered teacher submissions
          </span>
        </div>

        {pendingTeachers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-600" />
            <h4 className="font-heading font-bold text-slate-700 text-sm">
              All Faculty Verified
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              There are currently no teacher registration submissions pending review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingTeachers.map((teacher) => (
              <div key={teacher.uid} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-lg flex items-center justify-center flex-shrink-0 border border-indigo-100">
                    {teacher.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-slate-900 text-base">
                        {teacher.name}
                      </h4>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                        Verification Pending
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      {teacher.teacherData?.designation || 'Lecturer'} • {teacher.teacherData?.department || 'Science'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {teacher.email}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {teacher.phone || 'Phone verified'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Registered: {new Date(teacher.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleReject(teacher)}
                    className="px-4 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(teacher)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Faculty</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

