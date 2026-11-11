import React, { useState, useEffect } from 'react';
import { simsStore, UserProfile } from '@sims/shared';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, Mail, Lock, User, Hash, Calendar, GraduationCap } from 'lucide-react';

interface SignUpProps {
  onBack: () => void;
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

export const StudentSignUpScreen: React.FC<SignUpProps> = ({ onBack, onSuccess, onNavigateLogin }) => {
  const { switchDemoUser } = useAuth();
  const [step, setStep]                       = useState<1 | 2>(1);
  const [fullName, setFullName]               = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [requestedClass, setRequestedClass]   = useState('Grade 10');
  const [requestedSection, setRequestedSection] = useState('Section A');
  const [dob, setDob]                         = useState('2010-05-15');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [isSuccess, setIsSuccess]             = useState(false);
  const [visible, setVisible]                 = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  const inputCls = "w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-slate-800 placeholder:text-stone-400 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all";

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !admissionNumber.trim()) { setError('Please fill in all required fields.'); return; }
    setError(''); setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    const existing = simsStore.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) { setError('An account with this email is already registered.'); return; }
    setLoading(true);
    setTimeout(() => {
      const uid = `student-${Date.now()}`;
      const newStudent: UserProfile = {
        uid, name: fullName.trim(), email: email.trim().toLowerCase(),
        role: 'student', status: 'pending_placement', schoolId: 'school-oakridge-01',
        studentData: {
          admissionNumber: admissionNumber.trim() || `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          className: `${requestedClass} (Provisional)`,
          sectionName: `${requestedSection} (Provisional)`,
          dob,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      simsStore.saveUser(newStudent);
      simsStore.addNotification({ title: 'New Student Registration', message: `${fullName} registered.`, type: 'system', targetRoles: ['admin'] });
      setIsSuccess(true);
      setTimeout(() => { switchDemoUser(uid); onSuccess(); }, 1400);
    }, 600);
  };

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: '#F5F0EB' }}>

      {/* Back */}
      <button onClick={step === 2 ? () => { setStep(1); setError(''); } : onBack}
        className="flex items-center gap-1.5 px-5 pt-5 pb-2 text-slate-600 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Photo card */}
      <div className="mx-4 rounded-2xl overflow-hidden relative"
        style={{ height: 170, opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        <img
          src="/image.png"
          alt="Students campus"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(10,10,20,0.65) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 flex items-end justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-0.5">New Student</p>
            <h1 className="text-white font-bold text-xl leading-tight">Create Your Account</h1>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 pb-0.5">
            <div className={`w-2 h-2 rounded-full transition-all ${step === 1 ? 'bg-white' : 'bg-white/40'}`} />
            <div className={`w-2 h-2 rounded-full transition-all ${step === 2 ? 'bg-white' : 'bg-white/40'}`} />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pt-6 pb-8 flex flex-col overflow-y-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.45s ease 150ms, transform 0.45s ease 150ms',
        }}>

        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center"
              style={{ animation: 'popIn .4s ease' }}>
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Account Created!</h3>
            <p className="text-sm text-stone-500">Redirecting to your dashboard…</p>
          </div>

        ) : step === 1 ? (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Personal Information</h2>
            <p className="text-stone-500 text-sm mb-5">Step 1 of 2 — Your academic details</p>

            <form onSubmit={handleNextStep} className="space-y-3 flex-1 flex flex-col">
              {error && (
                <div className="flex items-center gap-2 px-3.5 py-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
                  style={{ animation: 'shakeX .3s ease' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Full legal name" className={inputCls + ' pl-10'} required />
              </div>
              <div className="relative">
                <Hash className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input type="text" value={admissionNumber} onChange={e => setAdmissionNumber(e.target.value)}
                  placeholder="Admission number (e.g. ADM-2026-1042)" className={inputCls + ' pl-10'} required />
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                  className={inputCls + ' pl-10'} required />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3 top-3.5 pointer-events-none" />
                  <select value={requestedClass} onChange={e => setRequestedClass(e.target.value)}
                    className={inputCls + ' pl-9'}>
                    {['Grade 9','Grade 10','Grade 11','Grade 12'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <select value={requestedSection} onChange={e => setRequestedSection(e.target.value)}
                  className={inputCls}>
                  <option>Section A</option><option>Section B</option>
                </select>
              </div>
              <div className="mt-auto pt-3">
                <button type="submit" className="w-full py-3.5 rounded-xl bg-slate-800 text-white text-sm font-semibold active:scale-[0.98] transition-all">
                  Continue →
                </button>
              </div>
            </form>
          </>

        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Account Credentials</h2>
            <p className="text-stone-500 text-sm mb-5">Step 2 of 2 — Set up your login</p>

            <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
              {error && (
                <div className="flex items-center gap-2 px-3.5 py-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
                  style={{ animation: 'shakeX .3s ease' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email address" className={inputCls + ' pl-10'} required />
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Create password" className={inputCls + ' pl-10 pr-11'} required />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password" className={inputCls + ' pl-10 pr-10'} required />
                {confirmPassword && (
                  <div className={`absolute right-3.5 top-3.5 w-4 h-4 rounded-full flex items-center justify-center ${password === confirmPassword ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {password === confirmPassword
                      ? <svg className="w-2.5 h-2.5 text-emerald-600" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      : <svg className="w-2.5 h-2.5 text-red-500" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
                  </div>
                )}
              </div>
              <div className="px-3.5 py-3 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-600 leading-relaxed">
                ℹ️ <strong>Provisional Access:</strong> You can explore notices & routines immediately. Official placement confirmed by admin.
              </div>
              <div className="mt-auto pt-2">
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 transition-all"
                  style={{ background: loading ? '#94a3b8' : '#1e293b' }}>
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Creating…</span></>
                    : 'Complete Registration'}
                </button>
              </div>
            </form>
          </>
        )}

        {!isSuccess && (
          <p className="text-center text-sm text-stone-500 pt-5">
            Already have an account?{' '}
            <button onClick={onNavigateLogin} className="text-slate-800 font-semibold hover:underline">Sign In</button>
          </p>
        )}
      </div>

      <style>{`
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
        @keyframes popIn  { 0%{transform:scale(.7);opacity:0} 70%{transform:scale(1.08);opacity:1} 100%{transform:scale(1)} }
      `}</style>
    </div>
  );
};
