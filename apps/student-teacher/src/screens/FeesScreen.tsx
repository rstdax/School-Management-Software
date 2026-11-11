import React from 'react';
import { useAuth } from '../context/AuthContext';
import { simsStore, FeeRecord } from '@sims/shared';
import { Wallet, CheckCircle2, Clock, AlertTriangle, Calendar } from 'lucide-react';

interface FeesScreenProps {
  onBack: () => void;
}

const statusBadge = (status: FeeRecord['status']) => {
  switch (status) {
    case 'paid':
      return <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> Paid
      </span>;
    case 'pending':
      return <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
        <Clock className="w-3 h-3" /> Pending
      </span>;
    case 'overdue':
      return <span className="flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full border border-red-200">
        <AlertTriangle className="w-3 h-3" /> Overdue
      </span>;
  }
};

export const FeesScreen: React.FC<FeesScreenProps> = ({ onBack: _onBack }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const records = simsStore.getFeeRecords(currentUser.uid);

  const totalPaid    = records.filter(r => r.status === 'paid').reduce((s, r) => s + (r.paidAmount ?? r.amount), 0);
  const totalPending = records.filter(r => r.status !== 'paid').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="p-4 sm:p-5 max-w-lg mx-auto space-y-4 pb-20" style={{ background: '#F5F0EB', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-xl text-slate-900 tracking-tight">Fee Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">Your fee payment history</p>
        </div>
        <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
          <Wallet className="w-5 h-5 text-slate-600" />
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <h2 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
            <span className="text-base font-black text-emerald-800 block">
              ৳{totalPaid.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Total Paid</span>
          </div>
          <div className={`p-3 rounded-xl text-center border ${totalPending > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
            <span className={`text-base font-black block ${totalPending > 0 ? 'text-red-700' : 'text-slate-600'}`}>
              ৳{totalPending.toLocaleString()}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${totalPending > 0 ? 'text-red-500' : 'text-slate-500'}`}>
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* Fee records */}
      {records.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center text-slate-400">
          <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No fee records found</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {records.map(record => (
            <div
              key={record.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 flex items-start justify-between gap-3 ${
                record.status === 'overdue'
                  ? 'border-red-200 border-l-4 border-l-red-500'
                  : 'border-slate-200'
              }`}
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading font-bold text-slate-900 text-sm">{record.monthLabel}</span>
                  {statusBadge(record.status)}
                </div>

                <div className="text-lg font-black text-slate-800">
                  ৳{record.amount.toLocaleString()}
                </div>

                <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-0.5">
                    <Calendar className="w-3 h-3" /> Due: {new Date(record.dueDate).toLocaleDateString()}
                  </span>
                  {record.paidDate && (
                    <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Paid: {new Date(record.paidDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {record.remarks && (
                  <p className="text-[10px] text-slate-500 italic">{record.remarks}</p>
                )}
              </div>

              {/* Paid amount chip if different */}
              {record.paidAmount !== undefined && record.paidAmount !== record.amount && (
                <div className="flex-shrink-0 text-right">
                  <span className="text-[10px] text-slate-400 block">Paid</span>
                  <span className="text-sm font-black text-emerald-700">৳{record.paidAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
