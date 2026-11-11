import React, { useState } from 'react';
import { UserRole } from '@sims/shared';
import { BookOpen, UserCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface RoleSelectProps {
  onSelectRole: (role: UserRole, isSignUp: boolean) => void;
  onBack: () => void;
}

export const RoleSelectScreen: React.FC<RoleSelectProps> = ({ onSelectRole, onBack }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const roles = [
    {
      id: 'student' as UserRole,
      title: 'Student',
      description: 'Access daily routine, monitor lecture attendance, view announcements, and request leaves.',
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      badge: 'Self-Registration Enabled',
      accent: 'border-blue-500 bg-blue-50/30',
      iconBg: 'bg-blue-50',
    },
    {
      id: 'teacher' as UserRole,
      title: 'Teacher / Faculty',
      description: 'Conduct classroom attendance, save drafts, finalize lectures, and manage class reports.',
      icon: <UserCheck className="w-6 h-6 text-emerald-600" />,
      badge: 'Admin Approval Required',
      accent: 'border-emerald-500 bg-emerald-50/30',
      iconBg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="min-h-[85vh] flex flex-col justify-between p-6 max-w-md mx-auto">
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
          Choose Your Role
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Select your relationship with Oakridge International Academy to continue
        </p>

        {/* Roles List */}
        <div className="mt-6 space-y-3.5">
          {roles.map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? `${r.accent} shadow-sm`
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-xl ${r.iconBg} flex-shrink-0`}>
                    {r.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-slate-900 text-sm">
                        {r.title}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {r.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3 pt-6">
        <button
          onClick={() => onSelectRole(selectedRole, selectedRole === 'student')}
          className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-heading font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <span>Continue as {roles.find((r) => r.id === selectedRole)?.title.split('/')[0]}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-center text-xs text-slate-500">
          Already have verified credentials?{' '}
          <button
            onClick={() => onSelectRole(selectedRole, false)}
            className="text-blue-600 font-bold hover:underline"
          >
            Direct Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

