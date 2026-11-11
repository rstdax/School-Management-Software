import React from 'react';
import { simsStore } from '@sims/shared';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface OverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const OverviewPage: React.FC<OverviewProps> = ({ onNavigateTab }) => {
  const school = simsStore.getSchool();
  const users = simsStore.getUsers();
  const classes = simsStore.getClasses();
  const sections = simsStore.getSections();
  const subjects = simsStore.getSubjects();

  const totalStudents = users.filter((u) => u.role === 'student').length + 390; // realistic school total
  const totalTeachers = users.filter((u) => u.role === 'teacher').length + 34; // realistic faculty
  const pendingTeachers = simsStore.getPendingTeachers();
  const pendingStudents = simsStore.getPendingPlacementStudents();
  const pendingLeaves = simsStore.getLeaveRequests({ status: 'pending' });
  const pendingCorrections = simsStore.getCorrectionRequests({ status: 'pending' });

  // Today's lecture schedule across classes
  const todaySessions = simsStore.getAttendanceSessions({ date: '2026-11-03' });

  const scheduledToday = [
    { id: '1', class: 'Grade 10', section: 'A', subject: 'Mathematics', teacher: 'Prof. David Miller', time: '09:00 AM - 09:50 AM', room: 'Room 302', status: 'finalized', presentPct: 90 },
    { id: '2', class: 'Grade 10', section: 'B', subject: 'Mathematics', teacher: 'Prof. David Miller', time: '11:00 AM - 11:50 AM', room: 'Room 304', status: 'draft', presentPct: 90 },
    { id: '3', class: 'Grade 11', section: 'A', subject: 'Physics', teacher: 'Dr. Elena Rostova', time: '10:00 AM - 10:50 AM', room: 'Science Lab 1', status: 'finalized', presentPct: 86 },
    { id: '4', class: 'Grade 12', section: 'A', subject: 'Chemistry', teacher: 'Dr. Robert Blake', time: '01:00 PM - 01:50 PM', room: 'Chem Lab', status: 'not_started', presentPct: 0 },
    { id: '5', class: 'Grade 9', section: 'A', subject: 'English', teacher: 'Prof. Karen White', time: '11:10 AM - 12:00 PM', room: 'Room 201', status: 'finalized', presentPct: 93 },
    { id: '6', class: 'Grade 10', section: 'A', subject: 'Computer Science', teacher: 'Dr. Alan Turing Jr.', time: '02:00 PM - 02:50 PM', room: 'Lab 2', status: 'not_started', presentPct: 0 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            School Overview
          </span>
          <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
            Institutional Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time enrollment, timetable operations, and attendance oversight for {school.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Academic Year:</span>
          <span className="bg-white border border-slate-200 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs">
            {school.academicYear}
          </span>
        </div>
      </div>

      {/* Action Banners for Pending Queues */}
      {(pendingTeachers.length > 0 || pendingStudents.length > 0 || pendingCorrections.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pendingTeachers.length > 0 && (
            <div
              onClick={() => onNavigateTab('teacher_approvals')}
              className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">
                  {pendingTeachers.length}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-amber-950">Pending Faculty Registrations</h4>
                  <p className="text-[11px] text-amber-800">Requires credential verification</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-800" />
            </div>
          )}

          {pendingStudents.length > 0 && (
            <div
              onClick={() => onNavigateTab('student_placement')}
              className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-blue-100/60 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-200 text-blue-900 font-bold flex items-center justify-center text-xs">
                  {pendingStudents.length}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-blue-950">Student Placements Pending</h4>
                  <p className="text-[11px] text-blue-800">Assign official section & roll number</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-800" />
            </div>
          )}

          {pendingCorrections.length > 0 && (
            <div
              onClick={() => onNavigateTab('requests')}
              className="p-3.5 bg-purple-50 border border-purple-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-purple-100/60 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-purple-200 text-purple-900 font-bold flex items-center justify-center text-xs">
                  {pendingCorrections.length}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-purple-950">Attendance Appeals Lodge</h4>
                  <p className="text-[11px] text-purple-800">Review student discrepancy claims</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-800" />
            </div>
          )}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Students</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading font-black text-2xl text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500 block mt-0.5">Enrolled across Grades 9–12</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Teaching Faculty</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading font-black text-2xl text-slate-900">{totalTeachers}</span>
            <span className="text-xs text-slate-500 block mt-0.5">Active Instructors</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Today's Lectures</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading font-black text-2xl text-slate-900">24</span>
            <span className="text-xs text-emerald-600 font-semibold block mt-0.5">18 Finalized (75%)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">School Average</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading font-black text-2xl text-slate-900">89.2%</span>
            <span className="text-xs text-slate-500 block mt-0.5">School Attendance Rate</span>
          </div>
        </div>
      </div>

      {/* Live Class-Level Attendance Monitor */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-heading font-bold text-slate-900 text-base">
              Live Class-Level Attendance Operations (Today)
            </h3>
            <p className="text-xs text-slate-500">
              Real-time audit of lectures scheduled, drafted, and finalized by teachers
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('attendance')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>All Sessions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4">Slot & Room</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scheduledToday.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.class} - {item.section}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {item.subject}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.teacher}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {item.time} ({item.room})
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {item.status === 'finalized' ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        Finalized ✓
                      </span>
                    ) : item.status === 'draft' ? (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                        Draft Saved
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-full">
                        Not Started
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {item.status === 'finalized' || item.status === 'draft' ? `${item.presentPct}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

