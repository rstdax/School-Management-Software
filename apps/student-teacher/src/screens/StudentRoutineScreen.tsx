import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { simsStore } from '@sims/shared';
import { Clock, MapPin, User, Calendar, BookOpen, Layers } from 'lucide-react';

export const StudentRoutineScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedDay, setSelectedDay] = useState<number>(2); // 1 = Mon ... 6 = Sat (default Tue)
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const days = [
    { num: 1, name: 'Monday', short: 'Mon' },
    { num: 2, name: 'Tuesday', short: 'Tue' },
    { num: 3, name: 'Wednesday', short: 'Wed' },
    { num: 4, name: 'Thursday', short: 'Thu' },
    { num: 5, name: 'Friday', short: 'Fri' },
    { num: 6, name: 'Saturday', short: 'Sat' },
  ];

  const subjects = simsStore.getSubjects();
  const users = simsStore.getUsers();

  const getSubjectName = (subId: string) => subjects.find((s) => s.id === subId)?.name || 'Subject';
  const getTeacherName = (tId: string) => users.find((u) => u.uid === tId)?.name || 'Faculty Member';

  const dailySlots = simsStore.getTimetable('class-g10', 'sec-g10-a', selectedDay);
  const allWeeklySlots = simsStore.getTimetable('class-g10', 'sec-g10-a');

  return (
    <div className="p-4 sm:p-5 max-w-lg mx-auto space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-xl text-slate-900 tracking-tight">
            Academic Routine
          </h1>
          <p className="text-xs text-slate-500">
            {currentUser?.studentData?.className || 'Grade 10'} • {currentUser?.studentData?.sectionName || 'Section A'}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'daily'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'weekly'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Weekly Grid
          </button>
        </div>
      </div>

      {viewMode === 'daily' ? (
        <>
          {/* Day Selector Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {days.map((d) => {
              const isActive = selectedDay === d.num;
              return (
                <button
                  key={d.num}
                  onClick={() => setSelectedDay(d.num)}
                  className={`flex-1 min-w-[54px] py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider opacity-80">
                    {d.short}
                  </span>
                  <span className="text-xs font-heading font-black mt-0.5">
                    {d.num === 2 ? 'Today' : `D${d.num}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Daily Schedule List */}
          <div className="space-y-3">
            {dailySlots.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span>No lectures scheduled on this day.</span>
              </div>
            ) : (
              dailySlots.map((slot) => {
                const subject = subjects.find((s) => s.id === slot.subjectId);
                const teacherName = getTeacherName(slot.teacherId);
                return (
                  <div
                    key={slot.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex flex-col items-center justify-center font-heading font-black text-xs flex-shrink-0 border border-blue-100">
                        <span>P{slot.periodNumber}</span>
                        <span className="text-[9px] font-semibold text-blue-500">Period</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-bold text-slate-900 text-sm">
                            {subject?.name || 'Class Subject'}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {subject?.code || 'CRS-00'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-1.5 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{teacherName}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {slot.roomNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Full Weekly Grid Mode */
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs overflow-x-auto">
          <div className="min-w-[480px]">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2 px-2">Day</th>
                  <th className="py-2 px-2">P1 (09:00)</th>
                  <th className="py-2 px-2">P2 (10:00)</th>
                  <th className="py-2 px-2">P3 (11:10)</th>
                  <th className="py-2 px-2">P4 (13:00)</th>
                  <th className="py-2 px-2">P5 (14:00)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {days.map((d) => {
                  const daySlots = allWeeklySlots.filter((s) => s.dayOfWeek === d.num);
                  return (
                    <tr key={d.num} className="hover:bg-slate-50/50">
                      <td className="py-3 px-2 font-bold text-slate-900">
                        {d.short}
                      </td>
                      {[1, 2, 3, 4, 5].map((pNum) => {
                        const slot = daySlots.find((s) => s.periodNumber === pNum);
                        return (
                          <td key={pNum} className="py-3 px-2">
                            {slot ? (
                              <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-lg">
                                <span className="font-bold text-blue-900 block leading-tight truncate">
                                  {getSubjectName(slot.subjectId)}
                                </span>
                                <span className="text-[10px] text-blue-600 block mt-0.5 truncate">
                                  {slot.roomNumber}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
