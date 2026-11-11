import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { simsStore } from '@sims/shared';
import { X, Send, Calendar, AlertCircle } from 'lucide-react';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudentId?: string;
  targetStudentName?: string;
  targetClassName?: string;
  targetSectionName?: string;
  onSuccess?: () => void;
}

export const LeaveRequestModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  targetStudentId,
  targetStudentName,
  targetClassName,
  targetSectionName,
  onSuccess,
}) => {
  const { currentUser } = useAuth();

  const studentId = targetStudentId || currentUser?.uid || '';
  const studentName = targetStudentName || currentUser?.name || 'Student';
  const className = targetClassName || currentUser?.studentData?.className || 'Grade 10';
  const sectionName = targetSectionName || currentUser?.studentData?.sectionName || 'Section A';

  const [leaveType, setLeaveType] = useState<'Medical' | 'Casual' | 'Family Emergency' | 'Academic'>('Medical');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '+1 (555) 000-0000');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 8) {
      setError('Please provide a specific reason for the leave (at least 8 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      simsStore.submitLeaveRequest({
        schoolId: currentUser?.schoolId || 'school-oakridge-01',
        studentId,
        studentName,
        className,
        sectionName,
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
        contactPhone,
        submittedBy: currentUser?.uid || 'user-unknown',
        submittedRole: (currentUser?.role as any) || 'student',
      });

      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
      alert('Leave application submitted successfully. You will be notified when reviewed.');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit leave request.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                Apply for Leave
              </h3>
              <p className="text-xs text-slate-500">
                For {studentName} ({className} {sectionName})
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Leave Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Medical', 'Casual', 'Family Emergency', 'Academic'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setLeaveType(type)}
                  className={`text-xs py-2 px-3 rounded-xl border text-center font-medium transition-colors ${
                    leaveType === type
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Medical Context
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              rows={3}
              placeholder="Explain the specific reason for absence (e.g. medical illness, doctor appointment)..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Emergency Contact Phone
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              required
            />
          </div>

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
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

