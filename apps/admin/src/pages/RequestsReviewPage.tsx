import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { simsStore, LeaveRequest, CorrectionRequest } from '@sims/shared';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';

export const RequestsReviewPage: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'leaves' | 'corrections'>('leaves');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const leaveRequests = simsStore.getLeaveRequests();
  const correctionRequests = simsStore.getCorrectionRequests();

  const [reviewLeave, setReviewLeave] = useState<LeaveRequest | null>(null);
  const [reviewCorrection, setReviewCorrection] = useState<CorrectionRequest | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const filteredLeaves = leaveRequests.filter((r) => statusFilter === 'all' || r.status === statusFilter);
  const filteredCorrections = correctionRequests.filter((r) => statusFilter === 'all' || r.status === statusFilter);

  const handleApproveLeave = () => {
    if (!reviewLeave || !currentAdmin) return;
    simsStore.reviewLeaveRequest(reviewLeave.id, 'approved', currentAdmin.uid, currentAdmin.name, remarks || 'Approved by School Administration');
    setActionSuccess(`Leave application for ${reviewLeave.studentName} approved.`);
    setReviewLeave(null);
    setRemarks('');
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleRejectLeave = () => {
    if (!reviewLeave || !currentAdmin) return;
    simsStore.reviewLeaveRequest(reviewLeave.id, 'rejected', currentAdmin.uid, currentAdmin.name, remarks || 'Rejected by School Administration');
    setActionSuccess(`Leave application for ${reviewLeave.studentName} rejected.`);
    setReviewLeave(null);
    setRemarks('');
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleApproveCorrection = () => {
    if (!reviewCorrection || !currentAdmin) return;
    simsStore.reviewCorrectionRequest(
      reviewCorrection.id,
      'approved',
      currentAdmin.uid,
      `${currentAdmin.name} (${currentAdmin.adminData?.adminRole || 'Admin'})`,
      remarks || 'Verified against teacher attendance roll.'
    );
    setActionSuccess(`Correction appeal approved. Lecture record and audit log updated.`);
    setReviewCorrection(null);
    setRemarks('');
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleRejectCorrection = () => {
    if (!reviewCorrection || !currentAdmin) return;
    simsStore.reviewCorrectionRequest(
      reviewCorrection.id,
      'rejected',
      currentAdmin.uid,
      `${currentAdmin.name} (${currentAdmin.adminData?.adminRole || 'Admin'})`,
      remarks || 'Appeal rejected. Record affirmed.'
    );
    setActionSuccess(`Correction appeal rejected.`);
    setReviewCorrection(null);
    setRemarks('');
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
          Student Appeals & Applications
        </span>
        <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
          Review Queue: Leaves & Discrepancies
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Approve or reject student leave requests and attendance correction appeals with administrative comments.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Primary Module Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-slate-200/80 p-1 rounded-2xl max-w-xs">
          <button
            onClick={() => setActiveTab('leaves')}
            className={`flex-1 py-2 text-xs font-heading font-bold rounded-xl transition-all ${
              activeTab === 'leaves' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Leave Requests ({leaveRequests.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('corrections')}
            className={`flex-1 py-2 text-xs font-heading font-bold rounded-xl transition-all ${
              activeTab === 'corrections' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Correction Appeals ({correctionRequests.filter((r) => r.status === 'pending').length})
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
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

      {/* Tab 1: Leaves */}
      {activeTab === 'leaves' && (
        <div className="space-y-3">
          {filteredLeaves.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              <FileCheck2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <span>No leave requests matching filter.</span>
            </div>
          ) : (
            filteredLeaves.map((req) => (
              <div
                key={req.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-bold text-slate-900 text-sm">
                      {req.studentName}
                    </h4>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {req.className} {req.sectionName}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="font-bold text-slate-700 text-xs">{req.leaveType}</span>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-semibold block mb-0.5">Reason:</span>
                    {req.reason}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>From: <strong className="text-slate-900">{req.startDate}</strong></span>
                    <span>To: <strong className="text-slate-900">{req.endDate}</strong></span>
                    <span>•</span>
                    <span>Submitted by: {req.submittedRole}</span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 flex-shrink-0">
                  {getStatusBadge(req.status)}
                  {req.status === 'pending' && (
                    <button
                      onClick={() => {
                        setReviewLeave(req);
                        setRemarks('');
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Corrections */}
      {activeTab === 'corrections' && (
        <div className="space-y-3">
          {filteredCorrections.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <span>No attendance correction appeals matching filter.</span>
            </div>
          ) : (
            filteredCorrections.map((corr) => (
              <div
                key={corr.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-bold text-slate-900 text-sm">
                      {corr.studentName}
                    </h4>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      {corr.subjectName}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">Date: {corr.sessionDate}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                      Current: {corr.recordedStatus === 'A' ? 'Absent' : corr.recordedStatus}
                    </span>
                    <span>→</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Requested: {corr.requestedStatus === 'P' ? 'Present' : corr.requestedStatus}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-semibold block mb-0.5">Discrepancy Claim:</span>
                    {corr.reason}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 flex-shrink-0">
                  {getStatusBadge(corr.status)}
                  {corr.status === 'pending' && (
                    <button
                      onClick={() => {
                        setReviewCorrection(corr);
                        setRemarks('');
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      Authorize Appeal
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Review Leave Modal */}
      {reviewLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-heading font-black text-slate-900 text-base">
              Decide Student Leave Request
            </h3>
            <p className="text-xs text-slate-500">
              {reviewLeave.studentName} ({reviewLeave.startDate} to {reviewLeave.endDate})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Evaluation Notes
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Approved. Medical documentation filed with health office..."
                rows={2}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setReviewLeave(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectLeave}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex-1"
              >
                Reject
              </button>
              <button
                onClick={handleApproveLeave}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex-1 shadow-xs"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Correction Modal */}
      {reviewCorrection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-heading font-black text-slate-900 text-base">
              Authorize Correction Appeal
            </h3>
            <p className="text-xs text-slate-500">
              For {reviewCorrection.studentName} ({reviewCorrection.subjectName} on {reviewCorrection.sessionDate})
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
              <strong>Audit Policy:</strong> Approving this request will automatically modify the official attendance record from '{reviewCorrection.recordedStatus}' to '{reviewCorrection.requestedStatus}' and commit an entry to the permanent audit ledger.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorization Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Cross-referenced laboratory sign-in sheet; attendance verified..."
                rows={2}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setReviewCorrection(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectCorrection}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex-1"
              >
                Reject Appeal
              </button>
              <button
                onClick={handleApproveCorrection}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex-1 shadow-xs"
              >
                Approve & Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

