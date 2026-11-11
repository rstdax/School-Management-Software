import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Shield, Eye, EyeOff, LogIn, AlertCircle, Sparkles, Lock } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login, switchAdminRole } = useAdminAuth();

  const [email, setEmail] = useState('admin@oakridge.edu');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = login(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid administrator credentials.');
    }
  };

  const handleQuickLogin = (adminUid: string) => {
    switchAdminRole(adminUid);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="font-heading font-black text-2xl text-slate-100 tracking-tight">
            SIMS Administration
          </h1>
          <p className="text-xs text-slate-400">
            Oakridge International Academy Management Console
          </p>
        </div>

        {/* Notice of Restricted Access */}
        <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs text-slate-300 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>Restricted Portal. Public registration is strictly disabled.</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Administrator Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@oakridge.edu"
              className="w-full text-xs px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Secure Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden pr-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-heading font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Authenticate Session</span>
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>One-Click Pre-Configured Admin Roles</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => handleQuickLogin('admin-eleanor')}
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-bold text-xs text-slate-200 block">Eleanor Vance</span>
                <span className="text-[10px] text-indigo-400">Principal • Super Admin (Full Scopes)</span>
              </div>
              <span className="text-xs text-slate-400 font-bold">Login →</span>
            </button>

            <button
              onClick={() => handleQuickLogin('admin-robert')}
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-bold text-xs text-slate-200 block">Robert Sterling</span>
                <span className="text-[10px] text-blue-400">Academic Dean (Enrollment, Timetable)</span>
              </div>
              <span className="text-xs text-slate-400 font-bold">Login →</span>
            </button>

            <button
              onClick={() => handleQuickLogin('admin-clara')}
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-bold text-xs text-slate-200 block">Clara Oswald</span>
                <span className="text-[10px] text-emerald-400">Attendance Officer (Oversight, Corrections)</span>
              </div>
              <span className="text-xs text-slate-400 font-bold">Login →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

