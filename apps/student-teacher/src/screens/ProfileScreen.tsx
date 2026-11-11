import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { simsStore } from '@sims/shared';
import {
  User,
  LogOut,
  Bell,
  GraduationCap,
  Shield,
  CheckCircle2,
} from 'lucide-react';

interface ProfileProps {
  onLogout: () => void;
  onNavigateScreen: (screen: string) => void;
}

export const ProfileScreen: React.FC<ProfileProps> = ({ onLogout }) => {
  const { currentUser } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!currentUser) return null;

  const school = simsStore.getSchool();
  const isTeacher = currentUser.role === 'teacher';

  return (
    <div className="p-4 sm:p-5 max-w-lg mx-auto space-y-4 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs text-center space-y-3">
        <div className="w-20 h-20 rounded-full mx-auto ring-4 ring-blue-50 overflow-hidden shadow-xs">
          {currentUser.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full font-black text-2xl flex items-center justify-center ${
              isTeacher ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-700'
            }`}>
              {currentUser.name.charAt(0)}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-heading font-black text-xl text-slate-900 tracking-tight">
            {currentUser.name}
          </h2>
          <span className={`inline-block px-3 py-0.5 text-xs font-bold rounded-full border mt-1 capitalize ${
            isTeacher
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {isTeacher ? 'Teaching Faculty' : 'Student & Parent'} • {currentUser.status}
          </span>
          <p className="text-xs text-slate-500 mt-1 font-medium">{currentUser.email}</p>
        </div>

        {/* Details Grid */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-left">
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Institution</span>
            <span className="font-bold text-slate-800 truncate block">{school.name}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Academic Year</span>
            <span className="font-bold text-slate-800">{school.academicYear}</span>
          </div>

          {!isTeacher ? (
            <>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Enrolled Class</span>
                <span className="font-bold text-slate-800">
                  {currentUser.studentData?.className || 'Grade 10'} • {currentUser.studentData?.sectionName || 'Section A'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Roll & Admission</span>
                <span className="font-bold text-slate-800">
                  #{currentUser.studentData?.rollNumber || '14'} ({currentUser.studentData?.admissionNumber || 'ADM-2026-1042'})
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl col-span-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Guardian / Parent Contact</span>
                <span className="font-bold text-slate-800">
                  {currentUser.studentData?.guardianName || 'Maria Rivera'} ({currentUser.studentData?.guardianPhone || '+1 (555) 901-2345'})
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Department</span>
                <span className="font-bold text-slate-800">
                  {currentUser.teacherData?.department || 'Department of Mathematics'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Employee ID</span>
                <span className="font-bold text-slate-800">
                  {currentUser.teacherData?.employeeId || 'EMP-MTH-408'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preferences & Sign Out */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-heading font-bold text-slate-900 text-sm">
          Account Preferences
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
          <span className="text-slate-700 font-medium">Notification Alerts</span>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-10 h-6 rounded-full transition-colors relative ${
              notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                notificationsEnabled ? 'left-5' : 'left-1'
              }`}
            />
          </button>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-rose-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
};
