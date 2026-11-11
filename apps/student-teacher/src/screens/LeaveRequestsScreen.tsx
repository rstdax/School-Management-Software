import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { simsStore, LeaveRequest } from '@sims/shared';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';

interface LeaveRequestsProps {
  onOpenApplyModal: () => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return (
        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved
        </span>
      );
    case 'rejected':
      return (
        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-lg flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Pending Review
        </span>
      );
  }
};

interface RequestsListProps {
  filtered: LeaveRequest[];
  isTeacher: boolean;
  onReview: (req: LeaveRequest) => void;
}

const RequestsList: React.FC<RequestsListProps> = ({ filtered, isTeacher, onReview }) => {
  if (filtered.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <span>No leave requests in this category.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((req) => (
        <div key={req.id} className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-slate-900 text-sm">{req.studentName}</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {req.className} {req.sectionName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-medium">
                <span className="font-bold text-slate-700">{req.leaveType} Leave</span>
                <span>•</span>
                <span>Submitted by {req.submittedRole}</span>
              </div>
            </div>
            <div>{getStatusBadge(req.status)}</div>
          </div>

          {/* Dates */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              From: <strong className="text-slate-900">{req.startDate}</strong>
            </span>
            <span className="flex items-center gap-1">
              To: <strong className="text-slate-900">{req.endDate}</strong>
            </span>
          </div>

          {/* Reason */}
          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-700 block mb-0.5">Reason:</span>
            {req.reason}
          </div>

          {/* Remarks if reviewed */}
          {req.reviewedBy && (
            <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-900">
              <span className="font-bold block">Reviewed by {req.reviewedByName}:</span>
              <span className="text-slate-600">{req.reviewRemarks || 'No remarks.'}</span>
            </div>
          )}

          {/* Teacher Action Controls */}
          {isTeacher && req.status === 'pending' && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => onReview(req)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Review Application
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const LeaveRequestsScreen: React.FC<LeaveRequestsProps> = ({ onOpenApplyModal }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const isTeacher = currentUser.role === 'teacher';
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [activeTab, setActiveTab] = useState<'apply' | 'history' | 'permissions'>('history');
  const [reviewModalRequest, setReviewModalRequest] = useState<LeaveRequest | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  const allRequests = isTeacher
    ? simsStore.getLeaveRequests()
    : simsStore.getLeaveRequests({ studentId: currentUser.uid });

  const filtered = allRequests.filter((r) => filter === 'all' || r.status === filter);

  const handleApprove = (req: LeaveRequest) => {
    simsStore.reviewLeaveRequest(req.id, 'approved', currentUser.uid, currentUser.name, reviewRemarks || 'Approved by Class Teacher');
    setReviewModalRequest(null);
    setReviewRemarks('');
    alert('Leave request approved.');
  };

  const handleReject = (req: LeaveRequest) => {
    simsStore.reviewLeaveRequest(req.id, 'rejected', currentUser.uid, currentUser.name, reviewRemarks || 'Insufficient medical/attendance eligibility.');
    setReviewModalRequest(null);
    setReviewRemarks('');
    alert('Leave request rejected.');
  };

  return (
    <div className="p-4 sm:p-5 max-w-lg mx-auto space-y-4 pb-20">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-xl text-slate-900 tracking-tight">
            Leave Applications
          </h1>
          <p className="text-xs text-slate-500">
            {isTeacher ? 'Student leave review queue' : 'Your submitted leave requests'}
          </p>
        </div>

        {!isTeacher && (
          <button
            onClick={onOpenApplyModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
        )}
      </div>

      {/* ── Student: three-tab layout ── */}
      {!isTeacher && (
        <>
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {([
              { key: 'apply',       label: 'Apply Leave'   },
              { key: 'history',     label: 'Leave History' },
              { key: 'permissions', label: 'Permissions'   },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-1.5 text-[11px] font-heading font-bold rounded-xl capitalize transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Apply Leave tab */}
          {activeTab === 'apply' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center space-y-3">
              <FileText className="w-10 h-10 mx-auto text-purple-400 opacity-70" />
              <p className="text-sm font-semibold text-slate-700">Apply for a leave</p>
              <p className="text-xs text-slate-400">Use the button below to open the leave application form.</p>
              <button
                onClick={onOpenApplyModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Open Application Form
              </button>
            </div>
          )}

          {/* Leave History tab */}
          {activeTab === 'history' && (
            <>
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`flex-1 py-1.5 text-xs font-heading font-bold rounded-xl capitalize transition-all ${
                      filter === tab
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <RequestsList
                filtered={filtered}
                isTeacher={false}
                onReview={(req) => { setReviewModalRequest(req); setReviewRemarks(''); }}
              />
            </>
          )}

          {/* Permissions tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              {allRequests.filter((r) => r.status === 'approved').length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <span className="text-xs">No approved permissions yet.</span>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
                    <span className="font-bold block">📋 Note:</span>
                    Show this to your class teacher when returning from approved leave.
                  </div>
                  {allRequests
                    .filter((r) => r.status === 'approved')
                    .map((req) => (
                      <div key={req.id} className="p-4 bg-white border border-emerald-200 rounded-2xl shadow-xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-heading font-bold text-slate-900 text-sm">{req.leaveType} Leave</span>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {req.startDate} → {req.endDate}
                            </div>
                          </div>
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Permission Granted
                          </span>
                        </div>
                        {req.reviewedByName && (
                          <p className="text-[10px] text-slate-500">Approved by {req.reviewedByName}</p>
                        )}
                      </div>
                    ))}
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Teacher: existing filter + list ── */}
      {isTeacher && (
        <>
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 py-1.5 text-xs font-heading font-bold rounded-xl capitalize transition-all ${
                  filter === tab
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <RequestsList
            filtered={filtered}
            isTeacher={true}
            onReview={(req) => { setReviewModalRequest(req); setReviewRemarks(''); }}
          />
        </>
      )}

      {/* Review Dialog for Teacher */}
      {reviewModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div>
              <h3 className="font-heading font-black text-slate-900 text-base">
                Review Student Leave Request
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                For {reviewModalRequest.studentName} ({reviewModalRequest.startDate} to {reviewModalRequest.endDate})
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
              <div><strong>Category:</strong> {reviewModalRequest.leaveType}</div>
              <div><strong>Explanation:</strong> {reviewModalRequest.reason}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teacher Remarks (optional)
              </label>
              <textarea
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="e.g. Approved. Student must complete missed chemistry lab..."
                rows={2}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalRequest(null)}
                className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReject(reviewModalRequest)}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex-1"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleApprove(reviewModalRequest)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex-1 shadow-xs"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
