import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { simsStore, AttendanceStatus } from '@sims/shared';
import { X, Send, AlertTriangle, AlertCircle } from 'lucide-react';

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillSessionId?: string;
  prefillDate?: string;
  prefillSubject?: string;
  onSuccess?: () => void;
}

export const CorrectionRequestModal: React.FC<CorrectionModalProps> = ({
  isOpen,
  onClose,
  prefillSessionId,
  prefillDate,
  prefillSubject,
  onSuccess,
}) => {
  const { currentUser } = useAuth();

  const [sessionDate, setSessionDate] = useState(prefillDate || '2026-11-02');
  const [subjectName, setSubjectName] = useState(prefillSubject || 'Physics');
  const [sessionId, _setSessionId] = useState(prefillSessionId || 'session-20261102-phy-10a');
  const [recordedStatus, _setRecordedStatus] = useState<AttendanceStatus>('A');
  const [requestedStatus, setRequestedStatus] = useState<AttendanceStatus>('P');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 10) {
      setError('Please provide a detailed explanation of the discrepancy (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      simsStore.submitCorrectionRequest({
        schoolId: currentUser?.schoolId || 'school-oakridge-01',
        studentId: currentUser?.uid || 'student-alex',
        studentName: currentUser?.name || 'Alex Rivera',
        sessionId,
        sessionDate,
        subjectName,
        recordedStatus,
        requestedStatus,
        reason: reason.trim(),
        submittedBy: currentUser?.uid || 'user-unknown',
      });

      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
      alert('Attendance correction appeal has been lodged. The Attendance Officer will review the lecture roster.');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit correction request.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                Report Attendance Discrepancy
              </h3>
              <p className="text-xs text-slate-500">
                Official correction appeal request
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lecture Date
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recorded Status
              </label>
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold text-center">
                Absent (A)
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requested Status
              </label>
              <select
                value={requestedStatus}
                onChange={(e) => setRequestedStatus(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              >
                <option value="P">Present (P)</option>
                <option value="L">Excused Leave (L)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Reason & Evidence
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              rows={3}
              placeholder="e.g., I was present in the lab during period 2 and submitted my assignment sheet to the teacher..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              required
            />
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Note: Authorized corrections require school verification and are logged into the permanent audit ledger.
          </p>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Lodging...' : 'Submit Appeal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

