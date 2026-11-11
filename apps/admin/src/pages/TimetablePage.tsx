import React, { useState } from 'react';
import { simsStore, TimetableSlot } from '@sims/shared';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  X,
  Edit2,
} from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const classes = simsStore.getClasses();
  const [selectedClassId, setSelectedClassId] = useState('class-g10');
  const sections = simsStore.getSections(selectedClassId);
  const [selectedSectionId, setSelectedSectionId] = useState('sec-g10-a');

  const subjects = simsStore.getSubjects();
  const teachers = simsStore.getUsers().filter((u) => u.role === 'teacher');

  const days = [
    { num: 1, name: 'Monday', short: 'Mon' },
    { num: 2, name: 'Tuesday', short: 'Tue' },
    { num: 3, name: 'Wednesday', short: 'Wed' },
    { num: 4, name: 'Thursday', short: 'Thu' },
    { num: 5, name: 'Friday', short: 'Fri' },
    { num: 6, name: 'Saturday', short: 'Sat' },
  ];

  const timetableSlots = simsStore.getTimetable(selectedClassId, selectedSectionId);

  // Slot modal
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotId, setSlotId] = useState<string | undefined>(undefined);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [subjectId, setSubjectId] = useState('sub-math');
  const [teacherId, setTeacherId] = useState('teacher-david');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('09:50 AM');
  const [roomNumber, setRoomNumber] = useState('Room 302');
  const [conflictError, setConflictError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleOpenAddModal = (day = 1, period = 1) => {
    setSlotId(undefined);
    setDayOfWeek(day);
    setPeriodNumber(period);
    setConflictError('');
    setShowSlotModal(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError('');

    const newSlot: TimetableSlot = {
      id: slotId || `tt-${Date.now()}`,
      schoolId: 'school-oakridge-01',
      classId: selectedClassId,
      sectionId: selectedSectionId,
      subjectId,
      teacherId,
      dayOfWeek: dayOfWeek as any,
      periodNumber,
      startTime,
      endTime,
      roomNumber,
    };

    const res = simsStore.saveTimetableSlot(newSlot);
    if (!res.success) {
      setConflictError(res.conflictError || 'Timetable scheduling conflict detected.');
      return;
    }

    setShowSlotModal(false);
    setSuccessMsg('Lecture slot scheduled and timetable published.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDeleteSlot = (id: string) => {
    if (window.confirm('Delete this lecture slot from official timetable?')) {
      simsStore.deleteTimetableSlot(id);
    }
  };

  const getSubject = (id: string) => subjects.find((s) => s.id === id);
  const getTeacher = (id: string) => teachers.find((t) => t.uid === id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Academic Scheduling
          </span>
          <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
            Timetable & Routine Editor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish weekly lecture rosters with automated teacher & room collision prevention.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal(1, 1)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lecture Slot</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Cohort Selectors Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              const nextSecs = simsStore.getSections(e.target.value);
              if (nextSecs.length > 0) setSelectedSectionId(nextSecs[0].id);
            }}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Section:</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.room})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <div className="min-w-[720px] p-4">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3 w-28">Weekday</th>
                {[1, 2, 3, 4, 5].map((p) => (
                  <th key={p} className="py-2.5 px-3">
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {days.map((d) => {
                const daySlots = timetableSlots.filter((s) => s.dayOfWeek === d.num);
                return (
                  <tr key={d.num} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-heading font-bold text-slate-900">
                      {d.name}
                    </td>

                    {[1, 2, 3, 4, 5].map((periodNum) => {
                      const slot = daySlots.find((s) => s.periodNumber === periodNum);
                      const subject = slot ? getSubject(slot.subjectId) : null;
                      const teacher = slot ? getTeacher(slot.teacherId) : null;

                      return (
                        <td key={periodNum} className="py-2.5 px-2">
                          {slot ? (
                            <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1 hover:border-indigo-300 transition-all group relative">
                              <div className="flex items-center justify-between">
                                <span className="font-heading font-bold text-xs text-indigo-950 truncate block">
                                  {subject?.name || 'Class'}
                                </span>
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 text-rose-500 hover:text-rose-700 transition-opacity"
                                  title="Remove slot"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="text-[10px] text-slate-600 block truncate font-medium">
                                {teacher?.name || 'Assigned Faculty'}
                              </span>

                              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5 border-t border-indigo-100/60">
                                <span>{slot.startTime}</span>
                                <span className="font-semibold text-indigo-700">{slot.roomNumber}</span>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenAddModal(d.num, periodNum)}
                              className="w-full h-16 border border-dashed border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-300 flex items-center justify-center text-slate-300 hover:text-indigo-600 transition-colors"
                              title="Assign Period Slot"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
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

      {/* Add Slot Modal with Collision Alert */}
      {showSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-slate-900 text-base">
                Schedule Lecture Slot
              </h3>
              <button onClick={() => setShowSlotModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {conflictError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2 shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Scheduling Collision Warning</strong>
                  <span>{conflictError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveSlot} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Weekday</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    {days.map((d) => (
                      <option key={d.num} value={d.num}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Period Number</label>
                  <select
                    value={periodNumber}
                    onChange={(e) => setPeriodNumber(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    {[1, 2, 3, 4, 5, 6].map((p) => (
                      <option key={p} value={p}>
                        Period {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Curriculum Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Teacher</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {teachers.map((t) => (
                    <option key={t.uid} value={t.uid}>
                      {t.name} ({t.teacherData?.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="09:50 AM"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Classroom / Lab</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Room 302, Science Wing"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSlotModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

