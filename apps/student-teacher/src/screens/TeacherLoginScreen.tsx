import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Mail, Lock } from 'lucide-react';

interface TeacherLoginProps {
  onSuccess: () => void;
  onNavigateStudentLogin: () => void;
  onNavigateSignUp: () => void;
  onBack: () => void;
}

const DEMO_TEACHERS = [
  { label: 'Prof. Miller', email: 'david.teacher@oakridge.edu' },
  { label: 'Dr. Jenkins',  email: 'sarah.teacher@oakridge.edu' },
];

export const TeacherLoginScreen: React.FC<TeacherLoginProps> = ({
  onSuccess, onNavigateStudentLogin, onNavigateSignUp, onBack,
}) => {
  const { login } = useAuth();
  const [email, setEmail]               = useState('david.teacher@oakridge.edu');
  const [password, setPassword]         = useState('Demo@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(true);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [visible, setVisible]           = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password, 'teacher');
    if (res.success) { onSuccess(); }
    else { setError(res.error || 'Invalid credentials.'); setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-slate-800 placeholder:text-stone-400 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all";

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: '#F5F0EB' }}>

      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-1.5 px-5 pt-5 pb-2 text-slate-600 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Photo card */}
      <div className="mx-4 rounded-2xl overflow-hidden relative"
        style={{ height: 200, opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        <img
          src="/image.png"
          alt="Teacher in classroom"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(10,10,20,0.62) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-0.5">Faculty Portal</p>
          <h1 className="text-white font-bold text-xl leading-tight">Teacher &amp; Faculty Sign In</h1>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pt-6 pb-8 flex flex-col overflow-y-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.45s ease 150ms, transform 0.45s ease 150ms',
        }}>
        <h2 className="text-xl font-bold text-slate-900 mb-5">Welcome, Educator</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
              style={{ animation: 'shakeX .3s ease' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Institutional faculty email"
              className={inputCls + ' pl-10'} required />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className={inputCls + ' pl-10 pr-11'} required />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              className="absolute right-3.5 top-3 text-stone-400 hover:text-slate-600 transition-colors">
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none pt-0.5" onClick={() => setRememberMe(v => !v)}>
            <div className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-slate-800 border-slate-800' : 'bg-white border-stone-300'}`}>
              {rememberMe && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            <span className="text-sm text-slate-600">Remember this device</span>
          </label>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 mt-1 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: loading ? '#94a3b8' : '#1e293b' }}>
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Signing in…</span></>
              : 'Enter Faculty Workspace'}
          </button>
        </form>

        {/* Demo */}
        <div className="flex items-center gap-3 mt-6 mb-4">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400">Demo access</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {DEMO_TEACHERS.map(d => (
            <button key={d.label} type="button" onClick={() => { setEmail(d.email); setPassword('Demo@123'); }}
              className="py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-slate-700 hover:border-stone-400 active:scale-[0.97] transition-all"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              🧑‍🏫 &nbsp;{d.label}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 space-y-2.5 text-center">
          <p className="text-sm text-stone-500">
            Student access?{' '}
            <button onClick={onNavigateStudentLogin} className="text-slate-800 font-semibold hover:underline">Sign In Here →</button>
          </p>
          <p className="text-xs text-stone-400">
            New faculty?{' '}
            <button onClick={onNavigateSignUp} className="text-slate-600 font-medium hover:underline">Register Here →</button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
      `}</style>
    </div>
  );
};
