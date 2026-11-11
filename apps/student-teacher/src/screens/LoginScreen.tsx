import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, ArrowLeft, KeyRound, Mail, Lock } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
  onNavigateSignUp: () => void;
  onNavigateTeacherLogin: () => void;
  onBack: () => void;
}

export const LoginScreen: React.FC<LoginProps> = ({
  onSuccess, onNavigateSignUp, onNavigateTeacherLogin, onBack,
}) => {
  const { login } = useAuth();
  const [email, setEmail]               = useState('alex.student@oakridge.edu');
  const [password, setPassword]         = useState('Demo@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(true);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [showForgot, setShowForgot]     = useState(false);
  const [forgotEmail, setForgotEmail]   = useState('');
  const [forgotSent, setForgotSent]     = useState(false);
  const [visible, setVisible]           = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const res = login(email);
      if (res.success) { onSuccess(); }
      else { setError(res.error || 'Invalid credentials.'); setLoading(false); }
    }, 500);
  };

  const inputCls = "w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-slate-800 placeholder:text-stone-400 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all";

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: '#F5F0EB' }}>

      {/* ── Back button ── */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-5 pt-5 pb-2 text-slate-600 hover:text-slate-900 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* ── Photo card ── */}
      <div
        className="mx-4 rounded-2xl overflow-hidden relative"
        style={{
          height: 200,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        <img
          src="/image.png"
          alt="Student studying"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(10,10,20,0.6) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-0.5">Student Portal</p>
          <h1 className="text-white font-bold text-xl leading-tight">Sign in to your account</h1>
        </div>
      </div>

      {/* ── Form ── */}
      <div
        className="flex-1 px-5 pt-6 pb-8 flex flex-col overflow-y-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.45s ease 150ms, transform 0.45s ease 150ms',
        }}
      >
        <h2 className="text-xl font-bold text-slate-900 mb-5">Welcome Back</h2>

        <form onSubmit={handleSignIn} className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
              style={{ animation: 'shakeX .3s ease' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
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

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setRememberMe(v => !v)}>
              <div className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-slate-800 border-slate-800' : 'bg-white border-stone-300'}`}>
                {rememberMe && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span className="text-sm text-slate-600">Keep me signed in</span>
            </label>
            <button type="button" onClick={() => { setForgotEmail(email); setShowForgot(true); setForgotSent(false); }}
              className="text-sm text-slate-700 font-medium hover:underline">
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 mt-1 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: loading ? '#94a3b8' : '#1e293b' }}>
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Signing in…</span></>
              : 'Log In'}
          </button>
        </form>

        {/* Demo quick fill */}
        <div className="flex items-center gap-3 mt-6 mb-4">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400">Demo access</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>
        <button
          type="button"
          onClick={() => { setEmail('alex.student@oakridge.edu'); setPassword('Demo@123'); }}
          className="w-full py-3 bg-white border border-stone-200 rounded-xl text-sm font-medium text-slate-700 hover:border-stone-400 active:scale-[0.97] transition-all"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          🎓 &nbsp;Use Student Demo Account
        </button>

        <div className="mt-auto pt-7 space-y-2.5 text-center">
          <p className="text-sm text-stone-500">
            Don't have an account?{' '}
            <button onClick={onNavigateSignUp} className="text-slate-800 font-semibold hover:underline">Sign Up</button>
          </p>
          <p className="text-xs text-stone-400">
            Faculty member?{' '}
            <button onClick={onNavigateTeacherLogin} className="text-slate-600 font-medium hover:underline">Teacher Sign In →</button>
          </p>
        </div>
      </div>

      {/* ── Forgot Password Sheet ── */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowForgot(false); }}
          style={{ animation: 'fadeIn .2s ease' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 mb-1"
            style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.18)', animation: 'slideUp .28s ease' }}>
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Reset Password</h3>
              <p className="text-xs text-stone-500 mt-1">Enter your email to receive recovery instructions.</p>
            </div>
            {forgotSent
              ? <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
                  ✓ Recovery link sent to <strong>{forgotEmail}</strong>
                </div>
              : <form onSubmit={e => { e.preventDefault(); if (forgotEmail) setForgotSent(true); }} className="space-y-3">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={inputCls + ' pl-10'} required />
                  </div>
                  <button type="submit" className="w-full py-3 bg-slate-800 text-white rounded-xl text-sm font-semibold">
                    Send Recovery Link
                  </button>
                </form>
            }
            <button onClick={() => setShowForgot(false)}
              className="w-full py-2.5 bg-stone-100 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};
