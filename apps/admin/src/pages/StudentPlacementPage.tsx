import React, { useState } from 'react';
import { simsStore, UserProfile } from '@sims/shared';
import { UserPlus, CheckCircle2, AlertCircle, Calendar, GraduationCap, X } from 'lucide-react';

export const StudentPlacementPage: React.FC = () => {
  const pendingStudents = simsStore.getPendingPlacementStudents();
  const classes = simsStore.getClasses();
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  const [officialClassId, setOfficialClassId] = useState('class-g10');
  const [officialSectionId, setOfficialSectionId] = useState('sec-g10-a');
  const [rollNumber, setRollNumber] = useState('31');
  const [actionSuccess, setActionSuccess] = useState('');

  const sections = simsStore.getSections(officialClassId);
  const currentClass = classes.find((c) => c.id === officialClassId);
  const currentSection = sections.find((s) => s.id === officialSectionId);

  const handleOpenPlacementModal = (st: UserProfile) => {
    setSelectedStudent(st);
    setOfficialClassId('class-g10');
    setOfficialSectionId('sec-g10-a');
    setRollNumber(String(Math.floor(15 + Math.random() * 20)));
  };

  const handleConfirmPlacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !currentClass || !currentSection) return;

    simsStore.assignOfficialPlacement(
      selectedStudent.uid,
      officialClassId,
      currentClass.name,
      officialSectionId,
      currentSection.name,
      rollNumber.trim()
    );

    setActionSuccess(`Official enrollment confirmed for ${selectedStudent.name} into ${currentClass.name} - ${currentSection.name} (Roll #${rollNumber}).`);
    setSelectedStudent(null);
    setTimeout(() => setActionSuccess(''), 4500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
          Admissions & Enrollment
        </span>
        <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
          Student Placement Review
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Assign official class cohort, classroom section, and academic roll number to registered applicants.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Pending Placements Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="font-heading font-bold text-slate-900 text-sm">
            Provisional Registrations Awaiting Official Assignment ({pendingStudents.length})
          </h3>
          <span className="text-xs text-slate-400">
            Pending academic placement
          </span>
        </div>

        {pendingStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-600" />
            <h4 className="font-heading font-bold text-slate-700 text-sm">
              All Students Placed
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Every self-registered student has been assigned an official class and roll number.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingStudents.map((st) => (
              <div key={st.uid} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-black text-lg flex items-center justify-center flex-shrink-0 border border-blue-100">
                    {st.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-slate-900 text-base">
                        {st.name}
                      </h4>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200">
                        Provisional Status
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                      <span>Admission: <strong className="text-slate-900">{st.studentData?.admissionNumber}</strong></span>
                      <span>•</span>
                      <span>Requested: <strong className="text-slate-900">{st.studentData?.className}</strong></span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>Email: {st.email}</span>
                      <span>•</span>
                      <span>DOB: {st.studentData?.dob || '2010-01-01'}</span>
                      <span>•</span>
                      <span>Applied: {new Date(st.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleOpenPlacementModal(st)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign Official Placement</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Placement Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="font-heading font-black text-slate-900 text-base">
                  Assign Official Enrollment
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 space-y-1">
              <div>Student: <strong className="text-slate-900">{selectedStudent.name}</strong></div>
              <div>Admission #: <strong className="text-slate-900">{selectedStudent.studentData?.admissionNumber}</strong></div>
              <div>Requested: {selectedStudent.studentData?.className}</div>
            </div>

            <form onSubmit={handleConfirmPlacement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Class
                </label>
                <select
                  value={officialClassId}
                  onChange={(e) => setOfficialClassId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Section
                </label>
                <select
                  value={officialSectionId}
                  onChange={(e) => setOfficialSectionId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.room})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Roll Number
                </label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Confirm Official Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

