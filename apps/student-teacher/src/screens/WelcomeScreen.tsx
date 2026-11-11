import React, { useEffect, useState } from 'react';
import { GraduationCap, Users, UserCheck, ChevronRight } from 'lucide-react';

interface WelcomeProps {
  onStudentSignIn: () => void;
  onTeacherSignIn: () => void;
  onStudentRegister: () => void;
}

export const WelcomeScreen: React.FC<WelcomeProps> = ({
  onStudentSignIn,
  onTeacherSignIn,
  onStudentRegister,
}) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: '100dvh', background: '#F5F0EB' }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-2">
        <GraduationCap className="w-5 h-5 text-slate-700" strokeWidth={1.8} />
        <span className="text-sm font-semibold text-slate-700 tracking-wide">SIMS</span>
      </div>

      {/* ── Hero photo card ── */}
      <div
        className="mx-4 rounded-2xl overflow-hidden relative"
        style={{
          height: 260,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      >
        {/* Real photo — graduation/campus */}
        <img
          src="/image.png"
          alt="Students at Oakridge"
          className="w-full h-full object-cover object-top"
        />
        {/* Subtle bottom gradient overlay for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 40%, rgba(15,15,25,0.65) 100%)',
          }}
        />
        {/* Text on photo */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <h1 className="text-white font-bold text-2xl leading-snug">
            Smart Institution<br />Management.
          </h1>
          <p className="text-white/80 text-sm mt-1">Oakridge International Academy</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div
        className="flex-1 px-5 pt-7 pb-8 flex flex-col"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease 200ms, transform 0.5s ease 200ms',
        }}
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome Back</h2>
        <p className="text-slate-500 text-sm mb-6">Choose your role to continue</p>

        {/* Role buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={onStudentSignIn}
            className="w-full flex items-center gap-4 px-4 py-4 bg-white border border-stone-200 rounded-xl hover:border-stone-400 active:scale-[0.98] transition-all duration-150"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-slate-600" strokeWidth={1.8} />
            </div>
            <div className="text-left flex-1">
              <div className="text-sm font-semibold text-slate-900">Student</div>
              <div className="text-xs text-slate-500 mt-0.5">Attendance, routine &amp; announcements</div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button
            onClick={onTeacherSignIn}
            className="w-full flex items-center gap-4 px-4 py-4 bg-white border border-stone-200 rounded-xl hover:border-stone-400 active:scale-[0.98] transition-all duration-150"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-slate-600" strokeWidth={1.8} />
            </div>
            <div className="text-left flex-1">
              <div className="text-sm font-semibold text-slate-900">Teacher &amp; Faculty</div>
              <div className="text-xs text-slate-500 mt-0.5">Mark attendance &amp; manage classes</div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400">New to Oakridge?</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Register CTA — outlined */}
        <button
          onClick={onStudentRegister}
          className="w-full py-3.5 rounded-xl border-2 border-slate-800 text-slate-800 font-semibold text-sm hover:bg-slate-800 hover:text-white active:scale-[0.98] transition-all duration-150"
        >
          Register as New Student
        </button>

        <p className="text-center text-xs text-stone-400 mt-auto pt-6">
          Oakridge International Academy · Academic Year 2026
        </p>
      </div>
    </div>
  );
};
