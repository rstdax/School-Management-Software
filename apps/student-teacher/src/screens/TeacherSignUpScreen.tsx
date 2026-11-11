import React, { useState, useEffect } from 'react';
import { simsStore, UserProfile } from '@sims/shared';
import {
  ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2,
  Mail, Lock, User, Briefcase, Hash, UserCheck,
} from 'lucide-react';

interface TeacherSignUpProps {
  onBack: () => void;
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

const DEPARTMENTS = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'English Literature', 'Humanities', 'Social Sciences', 'Technology', 'Computer Science',
];

export const TeacherSignUpScreen: React.FC<TeacherSignUpProps> = ({
  onBack, onSuccess, onNavigateLogin,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 — Professional Info
  const [fullName, setFullName]         = useState('');
  const [employeeId, setEmployeeId]     = useState('');
  const [department, setDepartment]     = useState('Mathematics');
  const [designation, setDesignation]   = useState('');
  const [phone, setPhone]               = useState('');

  // Step 2 — Credentials
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  const bodyAnim: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(22px)',
    transition: 'opacity 0.5s ease 120ms, transform 0.5s ease 120ms',
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !designation.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setStep(2);
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
      const uid = `teacher-${Date.now()}`;
      const newTeacher: UserProfile = {
        uid,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role: 'teacher',
        status: 'pending',          // ← must be approved by admin
        schoolId: 'school-oakridge-01',
        phone: phone.trim() || undefined,
        teacherData: {
          employeeId: employeeId.trim() || `EMP-${Date.now().toString().slice(-6)}`,
          department,
          designation: designation.trim(),
          assignedClassIds: [],
          assignedSubjectIds: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      simsStore.saveUser(newTeacher);
      simsStore.addNotification({
        title: 'New Teacher Registration',
        message: `${fullName} (${department}) submitted a faculty registration. Pending admin verification.`,
        type: 'system',
        targetRoles: ['admin'],
      });

      setLoading(false);
      setIsSuccess(true);
    }, 700);
  };

  return (
    <div className="flex flex-col bg-slate-50" style={{ minHeight: '100dvh' }}>

      {/* ── Hero Banner (Emerald) ── */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          height: 190,
          background: 'linear-gradient(135deg,#065f46 0%,#059669 55%,#0d9488 100%)',
          borderBottomLeftRadius: '2rem',
          borderBottomRightRadius: '2rem',
        }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#6ee7b7,transparent 70%)' }} />

        {/* Back */}
        <button
          onClick={step === 2 ? () => { setStep(1); setError(''); } : onBack}
          className="absolute top-5 left-5 z-20 w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div
          className="absolute inset-0 flex items-end justify-between px-7 pb-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/70 text-xs font-semibold uppercase tracking-wide">Faculty Registration</span>
            </div>
            <h1 className="text-white font-black text-xl leading-tight">
              Apply for<br /><span className="text-emerald-200">Teacher Account</span>
            </h1>
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-2 pb-1">
            <div className={`w-2.5 h-2.5 rounded-full transition-all ${step === 1 ? 'bg-white' : 'bg-white/40'}`} />
            <div className={`w-2.5 h-2.5 rounded-full transition-all ${step === 2 ? 'bg-white' : 'bg-white/40'}`} />
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="flex-1 px-6 pt-7 pb-8 flex flex-col overflow-y-auto" style={bodyAnim}>

        {isSuccess ? (
          /* ── Success state ── */
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#059669,#0d9488)', boxShadow: '0 8px 24px rgba(5,150,105,.35)', animation: 'popIn .4s ease' }}>
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Application Submitted!</h3>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 leading-relaxed text-left">
              <p className="font-bold mb-1">⏳ Pending Admin Verification</p>
              <p>Your registration has been sent to school administration. You will be able to sign in once your credentials are verified and approved.</p>
            </div>
            <button
              onClick={onNavigateLogin}
              className="w-full py-4 rounded-2xl text-white font-bold text-sm mt-2"
              style={{ background: 'linear-gradient(135deg,#065f46,#059669)' }}
            >
              Back to Teacher Sign In
            </button>
          </div>

        ) : step === 1 ? (
          /* ── Step 1: Professional Info ── */
          <>
            <h2 className="text-xl font-black text-slate-900 mb-0.5">Professional Information</h2>
            <p className="text-slate-500 text-sm mb-6">Step 1 of 2 — Your faculty details</p>

            <form onSubmit={handleNextStep} className="space-y-4 flex-1 flex flex-col">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl"
                  style={{ animation: 'shakeX .35s ease' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}

              {/* Full Name */}
              <div className="flex items-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <User className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Full name (e.g. Prof. David Miller)"
                  className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" required />
              </div>

              {/* Designation */}
              <div className="flex items-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <Briefcase className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input type="text" value={designation} onChange={e => setDesignation(e.target.value)}
                  placeholder="Designation (e.g. Senior Lecturer in Physics)"
                  className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" required />
              </div>

              {/* Department */}
              <div className="flex items-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <Hash className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <select value={department} onChange={e => setDepartment(e.target.value)}
                  className="flex-1 text-sm bg-transparent outline-none text-slate-800">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Employee ID (optional) */}
              <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 focus-within:bg-white transition-all">
                <Hash className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                  placeholder="Employee ID (optional, e.g. EMP-MTH-408)"
                  className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" />
              </div>

              {/* Phone (optional) */}
              <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 focus-within:bg-white transition-all">
                <User className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" />
              </div>

              {/* Notice */}
              <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Admin Approval Required:</strong> Your account will be in pending status until school administration verifies your credentials.
                </p>
              </div>

              <div className="mt-auto pt-4">
                <button type="submit" className="w-full py-4 rounded-2xl text-white font-bold text-sm active:scale-[0.98] transition-all"
                  style={{ background: 'linear-gradient(135deg,#065f46,#059669)', boxShadow: '0 4px 20px rgba(5,150,105,.35)' }}>
                  Continue →
                </button>
              </div>
            </form>
          </>

        ) : (
          /* ── Step 2: Credentials ── */
          <>
            <h2 className="text-xl font-black text-slate-900 mb-0.5">Account Credentials</h2>
            <p className="text-slate-500 text-sm mb-6">Step 2 of 2 — Set up your login</p>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl"
                  style={{ animation: 'shakeX .35s ease' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}

              <div className="flex items-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Institutional email address"
                  className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" required />
              </div>

              <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 focus-within:bg-white transition-all">
                <Lock className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" required />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 focus-within:bg-white transition-all">
                <Lock className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400" required />
                {confirmPassword && (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${password === confirmPassword ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    {password === confirmPassword
                      ? <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      : <svg className="w-3 h-3 text-rose-500" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-2">
                <button type="submit" disabled={loading}
                  className="w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 transition-all"
                  style={{ background: loading ? '#6ee7b7' : 'linear-gradient(135deg,#065f46,#059669)', boxShadow: loading ? 'none' : '0 4px 20px rgba(5,150,105,.35)' }}>
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Submitting…</span></>
                    : <span>Submit Registration</span>}
                </button>
              </div>
            </form>
          </>
        )}

        {!isSuccess && (
          <div className="text-center text-sm text-slate-500 pt-5">
            Already have an account?{' '}
            <button onClick={onNavigateLogin} className="text-emerald-600 font-bold hover:underline">Sign In</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
        @keyframes popIn  { 0%{transform:scale(.6);opacity:0} 70%{transform:scale(1.1);opacity:1} 100%{transform:scale(1)} }
      `}</style>
    </div>
  );
};
