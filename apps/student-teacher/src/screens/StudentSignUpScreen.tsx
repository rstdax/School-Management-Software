import React, { useState, useEffect } from 'react';
import { simsStore, UserProfile, isFirebaseConfigured, getFirebaseAuth, getFirebaseFirestore } from '@sims/shared';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2,
  Mail, Lock, User, Hash, Calendar, GraduationCap, Phone, Building2,
} from 'lucide-react';

interface SignUpProps {
  onBack: () => void;
  onSuccess: () => void;
  onNavigateLogin: () => void;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 10-1.9 13.6-5l-6.3-5.3C29.5 35.6 26.9 36.5 24 36.5c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.6 39.5 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.3 5.3c-.4.4 6.9-5 6.9-15.1 0-1.3-.1-2.7-.4-3.9z"/>
  </svg>
);

export const StudentSignUpScreen: React.FC<SignUpProps> = ({ onBack, onSuccess, onNavigateLogin }) => {
  const { switchDemoUser, loginWithGoogle } = useAuth();

  // step 1 = personal/academic, step 2 = guardian/institution, step 3 = credentials
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 — Academic
  const [fullName, setFullName]               = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [dob, setDob]                         = useState('');
  const [requestedClass, setRequestedClass]   = useState('Grade 10');
  const [requestedSection, setRequestedSection] = useState('Section A');

  // Step 2 — Institution & Guardian
  const [institutionName, setInstitutionName]   = useState('Oakridge International Academy');
  const [phone, setPhone]                       = useState('');
  const [guardianName, setGuardianName]         = useState('');
  const [guardianPhone, setGuardianPhone]       = useState('');
  const [guardianRelation, setGuardianRelation] = useState<'Father' | 'Mother' | 'Guardian'>('Father');

  // Step 3 — Credentials
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [visible, setVisible]     = useState(false);

  // For Google flow — after Google login we still need institution/guardian info
  const [googleProfileUid, setGoogleProfileUid]   = useState<string | null>(null);
  const [googleProfileEmail, setGoogleProfileEmail] = useState('');
  const [googleProfileName, setGoogleProfileName]   = useState('');
  const [showGoogleForm, setShowGoogleForm]           = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  const inputCls = "w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-slate-800 placeholder:text-stone-400 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all";

  const totalSteps = 3;

  // ── Google sign-up → show profile form ──────────────────────────────────
  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    setGoogleLoading(false);

    if (res.success && res.uid) {
      // New Google user — need to collect academic info
      setGoogleProfileUid(res.uid);
      setGoogleProfileEmail(res.email ?? '');
      setGoogleProfileName(res.name ?? '');
      setFullName(res.name ?? '');
      setShowGoogleForm(true);
    } else if (res.success) {
      // Existing user — go to dashboard
      onSuccess();
    } else {
      setError(res.error || 'Google sign-up failed.');
    }
  };

  // ── Save Google profile after form completion ────────────────────────────
  const handleSaveGoogleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleProfileUid) return;
    setLoading(true);

    const newProfile: UserProfile = {
      uid: googleProfileUid,
      name: fullName.trim() || googleProfileName,
      email: googleProfileEmail,
      role: 'student',
      status: 'pending_placement',
      schoolId: 'school-oakridge-01',
      phone: phone || undefined,
      studentData: {
        admissionNumber: admissionNumber.trim() || `ADM-${Date.now().toString().slice(-6)}`,
        className: `${requestedClass} (Provisional)`,
        sectionName: `${requestedSection} (Provisional)`,
        dob,
        guardianName: guardianName.trim() || undefined,
        guardianPhone: guardianPhone.trim() || undefined,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    simsStore.saveUser(newProfile);

    if (isFirebaseConfigured()) {
      try {
        const db = getFirebaseFirestore();
        if (db) await setDoc(doc(db, 'schools', 'school-oakridge-01', 'users', googleProfileUid), newProfile);
      } catch (e) { console.error(e); }
    }

    simsStore.addNotification({
      title: 'New Google Student',
      message: `${newProfile.name} completed profile. Pending admin placement.`,
      type: 'system', targetRoles: ['admin'],
    });

    setIsSuccess(true);
    setTimeout(() => { switchDemoUser(googleProfileUid); onSuccess(); }, 1400);
  };

  // ── Email/Pass step navigation ───────────────────────────────────────────
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dob) { setError('Please fill in all required fields.'); return; }
    setError(''); setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardianName.trim()) { setError('Guardian name is required.'); return; }
    setError(''); setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);

    try {
      let uid = `student-${Date.now()}`;

      const newProfile: UserProfile = {
        uid,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role: 'student',
        status: 'pending_placement',
        schoolId: 'school-oakridge-01',
        phone: phone || undefined,
        studentData: {
          admissionNumber: admissionNumber.trim() || `ADM-${Date.now().toString().slice(-6)}`,
          className: `${requestedClass} (Provisional)`,
          sectionName: `${requestedSection} (Provisional)`,
          dob,
          guardianName: guardianName.trim() || undefined,
          guardianPhone: guardianPhone.trim() || undefined,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isFirebaseConfigured()) {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error('Auth not initialized');
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        uid = cred.user.uid;
        newProfile.uid = uid;

        const db = getFirebaseFirestore();
        if (db) await setDoc(doc(db, 'schools', 'school-oakridge-01', 'users', uid), newProfile);
      } else {
        const existing = simsStore.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) { setError('An account with this email is already registered.'); setLoading(false); return; }
      }

      simsStore.saveUser(newProfile);
      simsStore.addNotification({
        title: 'New Student Registration',
        message: `${fullName} registered. Pending admin placement.`,
        type: 'system', targetRoles: ['admin'],
      });

      setIsSuccess(true);
      setTimeout(() => { switchDemoUser(uid); onSuccess(); }, 1400);
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err?.message || 'Registration failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const goBack = () => {
    if (showGoogleForm) { setShowGoogleForm(false); return; }
    if (step > 1) { setStep((step - 1) as 1 | 2 | 3); setError(''); return; }
    onBack();
  };

  const stepLabel = showGoogleForm
    ? 'Complete Your Profile'
    : step === 1 ? 'Academic Information'
    : step === 2 ? 'Guardian & Contact'
    : 'Account Credentials';

  const stepSub = showGoogleForm
    ? 'Tell us about yourself'
    : step === 1 ? `Step 1 of ${totalSteps} — Your academic details`
    : step === 2 ? `Step 2 of ${totalSteps} — Guardian & institution info`
    : `Step 3 of ${totalSteps} — Set up your login`;

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: '#F5F0EB' }}>

      <button onClick={goBack}
        className="flex items-center gap-1.5 px-5 pt-5 pb-2 text-slate-600 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Photo */}
      <div className="mx-4 rounded-2xl overflow-hidden relative"
        style={{ height: 160, opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        <img src="/image.png" alt="Students" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(10,10,20,0.65) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 flex items-end justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-0.5">New Student</p>
            <h1 className="text-white font-bold text-lg leading-tight">Create Your Account</h1>
          </div>
          {/* Step dots */}
          {!showGoogleForm && (
            <div className="flex items-center gap-1.5 pb-0.5">
              {[1,2,3].map(s => (
                <div key={s} className={`rounded-full transition-all ${step >= s ? 'bg-white w-2 h-2' : 'bg-white/40 w-1.5 h-1.5'}`} />
              ))}
            </div>
          )}
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

        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-0.5">{stepLabel}</h2>
            <p className="text-stone-500 text-sm mb-5">{stepSub}</p>

            {error && (
              <div className="flex items-center gap-2 px-3.5 py-3 mb-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
                style={{ animation: 'shakeX .3s ease' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            {/* ── Google Sign-up option — only on step 1 ── */}
            {step === 1 && !showGoogleForm && (
              <>
                <button type="button" onClick={handleGoogleSignUp} disabled={googleLoading}
                  className="w-full py-3 mb-4 bg-white border border-stone-200 rounded-xl text-sm font-medium text-slate-700 hover:border-stone-400 active:scale-[0.97] transition-all flex items-center justify-center gap-2.5 disabled:opacity-60"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  {googleLoading
                    ? <div className="w-4 h-4 border-2 border-stone-300 border-t-slate-600 rounded-full animate-spin" />
                    : <GoogleIcon />}
                  Sign up with Google
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-xs text-stone-400">or fill in manually</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>
              </>
            )}

            {/* ── STEP 1 — Academic ── */}
            {step === 1 && !showGoogleForm && (
              <form onSubmit={handleStep1} className="space-y-3 flex-1 flex flex-col">
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Full legal name" className={inputCls + ' pl-10'} required />
                </div>
                <div className="relative">
                  <Hash className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="text" value={admissionNumber} onChange={e => setAdmissionNumber(e.target.value)}
                    placeholder="Admission number (optional)" className={inputCls + ' pl-10'} />
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
            )}

            {/* ── STEP 2 — Guardian & Institution ── */}
            {step === 2 && !showGoogleForm && (
              <form onSubmit={handleStep2} className="space-y-3 flex-1 flex flex-col">
                <div className="relative">
                  <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="text" value={institutionName} onChange={e => setInstitutionName(e.target.value)}
                    placeholder="Institution / School name" className={inputCls + ' pl-10'} />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="Your phone number (optional)" className={inputCls + ' pl-10'} />
                </div>
                <div className="pt-2 pb-1">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Guardian / Parent</p>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="text" value={guardianName} onChange={e => setGuardianName(e.target.value)}
                    placeholder="Guardian full name" className={inputCls + ' pl-10'} required />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="tel" value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)}
                    placeholder="Guardian contact number" className={inputCls + ' pl-10'} />
                </div>
                <select value={guardianRelation} onChange={e => setGuardianRelation(e.target.value as any)}
                  className={inputCls}>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
                <div className="mt-auto pt-3">
                  <button type="submit" className="w-full py-3.5 rounded-xl bg-slate-800 text-white text-sm font-semibold active:scale-[0.98] transition-all">
                    Continue →
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 3 — Credentials ── */}
            {step === 3 && !showGoogleForm && (
              <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
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
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                <p className="text-xs text-stone-500 px-1">
                  ℹ️ Provisional access immediately. Official placement confirmed by admin.
                </p>
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
            )}

            {/* ── Google profile completion form ── */}
            {showGoogleForm && (
              <form onSubmit={handleSaveGoogleProfile} className="space-y-3 flex-1 flex flex-col">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 mb-1">
                  Signed in as <strong>{googleProfileEmail}</strong> via Google. Please complete your profile.
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Full legal name" className={inputCls + ' pl-10'} required />
                </div>
                <div className="relative">
                  <Hash className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="text" value={admissionNumber} onChange={e => setAdmissionNumber(e.target.value)}
                    placeholder="Admission number (optional)" className={inputCls + ' pl-10'} />
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                    className={inputCls + ' pl-10'} required />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3 top-3.5 pointer-events-none" />
                    <select value={requestedClass} onChange={e => setRequestedClass(e.target.value)} className={inputCls + ' pl-9'}>
                      {['Grade 9','Grade 10','Grade 11','Grade 12'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <select value={requestedSection} onChange={e => setRequestedSection(e.target.value)} className={inputCls}>
                    <option>Section A</option><option>Section B</option>
                  </select>
                </div>
                <div className="pt-2 pb-1">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Guardian / Parent</p>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="text" value={guardianName} onChange={e => setGuardianName(e.target.value)}
                    placeholder="Guardian full name" className={inputCls + ' pl-10'} required />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="tel" value={guardianPhone} onChange={e => setGuardianPhone(e.target.value)}
                    placeholder="Guardian contact number" className={inputCls + ' pl-10'} />
                </div>
                <div className="mt-auto pt-3">
                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
                    style={{ background: '#1e293b' }}>
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save & Continue'}
                  </button>
                </div>
              </form>
            )}

            {!isSuccess && !showGoogleForm && (
              <p className="text-center text-sm text-stone-500 pt-5">
                Already have an account?{' '}
                <button onClick={onNavigateLogin} className="text-slate-800 font-semibold hover:underline">Sign In</button>
              </p>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
        @keyframes popIn  { 0%{transform:scale(.7);opacity:0} 70%{transform:scale(1.08);opacity:1} 100%{transform:scale(1)} }
      `}</style>
    </div>
  );
};
