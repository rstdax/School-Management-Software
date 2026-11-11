import React, { useState } from 'react';
import { simsStore, ClassItem, SectionItem, SubjectItem } from '@sims/shared';
import {
  BookOpen, Plus, Users, GraduationCap, Layers,
  Search, CheckCircle2, X, Trash2, Edit2,
  Building2, Hash, Clock, Mail, Phone,
} from 'lucide-react';

// ── Reusable inline toast ─────────────────────────────────────────────────────
const SuccessBanner: React.FC<{ msg: string }> = ({ msg }) => (
  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5">
    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
    <span className="font-semibold">{msg}</span>
  </div>
);

// ── Status badge helper ───────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    active:            'bg-emerald-100 text-emerald-800',
    pending:           'bg-amber-100 text-amber-800',
    pending_placement: 'bg-blue-100 text-blue-800',
    rejected:          'bg-rose-100 text-rose-800',
  };
  const label: Record<string, string> = {
    active:            'Active',
    pending:           'Pending',
    pending_placement: 'Awaiting Placement',
    rejected:          'Rejected',
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {label[status] ?? status}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export const AcademicManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects' | 'students' | 'teachers'>('classes');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };

  // ── Live data ──────────────────────────────────────────────────────────────
  const classes  = simsStore.getClasses();
  const sections = simsStore.getSections();
  const subjects = simsStore.getSubjects();
  const users    = simsStore.getUsers();

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');

  // Classes sorted by gradeLevel ascending (used for rendering, dropdowns & defaults)
  const sortedClasses = [...classes].sort((a, b) => a.gradeLevel - b.gradeLevel);

  // ─── Add Class modal ──────────────────────────────────────────────────────
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClassName, setNewClassName]     = useState('');
  const [newGradeLevel, setNewGradeLevel]   = useState(9);

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    simsStore.saveClass({
      id: `class-${newClassName.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: newClassName.trim(),
      gradeLevel: newGradeLevel,
      schoolId: 'school-oakridge-01',
    });
    setShowClassModal(false);
    setNewClassName('');
    showSuccess(`Class "${newClassName.trim()}" added successfully.`);
  };

  // ─── Edit Class modal ─────────────────────────────────────────────────────
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [editingClass, setEditingClass]             = useState<ClassItem | null>(null);
  const [editClassName, setEditClassName]             = useState('');
  const [editGradeLevel, setEditGradeLevel]           = useState(9);

  const openEditClass = (cls: ClassItem) => {
    setEditingClass(cls);
    setEditClassName(cls.name);
    setEditGradeLevel(cls.gradeLevel);
    setShowEditClassModal(true);
  };

  const handleSaveEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editClassName.trim()) return;
    const name = editClassName.trim();
    simsStore.saveClass({
      id: editingClass.id,
      name,
      gradeLevel: editGradeLevel,
      schoolId: editingClass.schoolId,
    });
    setShowEditClassModal(false);
    setEditingClass(null);
    showSuccess(`Class "${name}" updated.`);
  };

  // ─── Add Section modal ────────────────────────────────────────────────────
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionClassId, setSectionClassId]     = useState('class-g10');
  const [secName, setSecName]                   = useState('');
  const [secRoom, setSecRoom]                   = useState('');
  const [secCapacity, setSecCapacity]           = useState(35);

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    simsStore.saveSection({
      id: `sec-${Date.now()}`,
      classId: sectionClassId,
      name: secName.trim(),
      room: secRoom.trim(),
      capacity: secCapacity,
    });
    setShowSectionModal(false);
    setSecName(''); setSecRoom('');
    showSuccess(`Section "${secName}" added successfully.`);
  };

  // ─── Edit Section modal ──────────────────────────────────────────────────
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [editingSection, setEditingSection]             = useState<SectionItem | null>(null);
  const [editSecName, setEditSecName]                     = useState('');
  const [editSecRoom, setEditSecRoom]                     = useState('');
  const [editSecCapacity, setEditSecCapacity]             = useState(35);

  const openEditSection = (sec: SectionItem) => {
    setEditingSection(sec);
    setEditSecName(sec.name);
    setEditSecRoom(sec.room);
    setEditSecCapacity(sec.capacity);
    setShowEditSectionModal(true);
  };

  const handleSaveEditSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editSecName.trim()) return;
    const name = editSecName.trim();
    simsStore.saveSection({
      id: editingSection.id,
      classId: editingSection.classId,
      name,
      room: editSecRoom.trim(),
      capacity: editSecCapacity,
    });
    setShowEditSectionModal(false);
    setEditingSection(null);
    showSuccess(`Section "${name}" updated.`);
  };

  // ─── Subjects modal ───────────────────────────────────────────────────────
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editSubject, setEditSubject]           = useState<SubjectItem | null>(null);
  const [subCode, setSubCode]   = useState('');
  const [subName, setSubName]   = useState('');
  const [subDept, setSubDept]   = useState('Science');
  const [subHours, setSubHours] = useState(4);

  const openAddSubject = () => {
    setEditSubject(null);
    setSubCode(''); setSubName(''); setSubDept('Science'); setSubHours(4);
    setShowSubjectModal(true);
  };
  const openEditSubject = (sub: SubjectItem) => {
    setEditSubject(sub);
    setSubCode(sub.code); setSubName(sub.name); setSubDept(sub.department); setSubHours(sub.weeklyHours);
    setShowSubjectModal(true);
  };
  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    simsStore.saveSubject({
      id: editSubject?.id ?? `sub-${Date.now()}`,
      code: subCode.toUpperCase().trim(),
      name: subName.trim(),
      department: subDept,
      weeklyHours: Number(subHours),
    });
    setShowSubjectModal(false);
    showSuccess(editSubject ? `Subject "${subName}" updated.` : `Subject "${subName}" created.`);
  };

  // ─── Filtered lists ───────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.studentData?.admissionNumber ?? '').toLowerCase().includes(q) ||
    (s.studentData?.className ?? '').toLowerCase().includes(q)
  );
  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(q) ||
    (t.teacherData?.department ?? '').toLowerCase().includes(q) ||
    (t.teacherData?.employeeId ?? '').toLowerCase().includes(q)
  );
  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.code.toLowerCase().includes(q) ||
    s.department.toLowerCase().includes(q)
  );

  const DEPARTMENTS = ['Science','Mathematics','Physics','Chemistry','Biology','English Literature','Humanities','Social Sciences','Technology','Computer Science'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── Title Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Academic Infrastructure</span>
          <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">Academic Master Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure classes, sections, subjects, and view student & faculty directories.</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'classes' && (
            <>
              <button onClick={() => { setNewClassName(''); setNewGradeLevel(9); setShowClassModal(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors">
                <Plus className="w-4 h-4" /><span>Add Class</span>
              </button>
              <button onClick={() => { setSectionClassId(sortedClasses[0]?.id ?? ''); setSecName(''); setSecRoom(''); setSecCapacity(35); setShowSectionModal(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors">
                <Plus className="w-4 h-4" /><span>Add Section</span>
              </button>
            </>
          )}
          {activeTab === 'subjects' && (
            <button onClick={openAddSubject}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors">
              <Plus className="w-4 h-4" /><span>Add Subject</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && <SuccessBanner msg={successMsg} />}

      {/* ── Tabs ── */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl max-w-lg">
        {([
          { key: 'classes',  label: 'Classes', count: classes.length },
          { key: 'subjects', label: 'Subjects', count: subjects.length },
          { key: 'students', label: 'Students', count: students.length },
          { key: 'teachers', label: 'Faculty', count: teachers.length },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearch(''); }}
            className={`flex-1 py-2 text-xs font-heading font-bold rounded-xl transition-all ${
              activeTab === tab.key ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}>
            {tab.label}
            <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-300/60 text-slate-500'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1 — Classes & Sections
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedClasses.map(cls => {
            const classSections = [...sections.filter(s => s.classId === cls.id)]
              .sort((a, b) => a.name.localeCompare(b.name));
            const studentCount  = students.filter(s => s.studentData?.classId === cls.id && s.status === 'active').length;
            return (
              <div key={cls.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                {/* Class Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-black text-base flex items-center justify-center">
                      G{cls.gradeLevel}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-slate-900 text-base">{cls.name}</h3>
                      <span className="text-xs text-slate-400">Grade Level {cls.gradeLevel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="block text-xs font-bold text-slate-500">{classSections.length} sections</span>
                      <span className="text-[11px] text-slate-400">{studentCount} active students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditClass(cls)}
                        className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit class"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${cls.name}" and all its sections? This cannot be undone.`)) {
                            simsStore.deleteClass(cls.id);
                            showSuccess(`"${cls.name}" deleted.`);
                          }
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sections</span>
                    <button
                      onClick={() => { setSectionClassId(cls.id); setSecName(''); setSecRoom(''); setSecCapacity(35); setShowSectionModal(true); }}
                      className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                      <Plus className="w-3 h-3" /> Add Section
                    </button>
                  </div>
                  {classSections.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-2">No sections yet — click "Add Section" above.</p>
                  )}
                  {classSections.map(sec => {
                    const enrolled = students.filter(s =>
                      s.studentData?.sectionId === sec.id && s.status === 'active'
                    ).length;
                    return (
                      <div key={sec.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block">{sec.name}</span>
                          <div className="flex items-center gap-2 mt-0.5 text-slate-500">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{sec.room}</span>
                            <span>·</span>
                            <span>{enrolled} / {sec.capacity} students</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* capacity bar */}
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${Math.min((enrolled / sec.capacity) * 100, 100)}%` }} />
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">
                            Active
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditSection(sec)}
                              className="p-1 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit section"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete section "${sec.name}" (${sec.room})?`)) {
                                  simsStore.deleteSection(sec.id);
                                  showSuccess(`Section "${sec.name}" deleted.`);
                                }
                              }}
                              className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — Subjects
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <h3 className="font-heading font-bold text-slate-900 text-sm">
              Curriculum Subjects ({filteredSubjects.length})
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search subjects…"
                className="text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none w-48" />
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Hrs/wk</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-indigo-700 font-mono">{sub.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{sub.name}</td>
                  <td className="py-3 px-4 text-slate-600">{sub.department}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">{sub.weeklyHours}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">Active</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditSubject(sub)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete subject "${sub.name}" (${sub.code})?`)) {
                            simsStore.deleteSubject(sub.id);
                            showSuccess(`Subject "${sub.name}" deleted.`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSubjects.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">No subjects match your search.</div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3 — Students Directory
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-heading font-bold text-slate-900 text-sm">Student Directory ({filteredStudents.length})</h3>
              {/* Status counts */}
              <span className="text-[10px] text-slate-500">
                {students.filter(s => s.status === 'active').length} active ·{' '}
                {students.filter(s => s.status === 'pending_placement').length} awaiting placement
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, admission #, class…"
                className="text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none w-56" />
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4 text-center">Roll #</th>
                <th className="py-3 px-4 text-center">DOB</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(st => (
                <tr key={st.uid} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">{st.name}</span>
                        <span className="text-[10px] text-slate-400">{st.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                    {st.studentData?.admissionNumber ?? 'ADM-000'}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-semibold">
                    {st.studentData?.className ?? '—'} · {st.studentData?.sectionName ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    {st.studentData?.rollNumber ? `#${st.studentData.rollNumber}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">
                    {st.studentData?.dob ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={st.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">No students match your search.</div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4 — Teachers Directory
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-heading font-bold text-slate-900 text-sm">Faculty Directory ({filteredTeachers.length})</h3>
              <span className="text-[10px] text-slate-500">
                {teachers.filter(t => t.status === 'active').length} active ·{' '}
                {teachers.filter(t => t.status === 'pending').length} pending approval
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, department, ID…"
                className="text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none w-56" />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTeachers.map(t => (
              <div key={t.uid} className="p-4 hover:bg-slate-50/50 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                    {t.avatarUrl
                      ? <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">{t.name.charAt(0)}</div>
                    }
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{t.teacherData?.designation ?? 'Faculty'}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />{t.teacherData?.employeeId ?? 'EMP-000'}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />{t.teacherData?.department ?? '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />{t.email}
                      </span>
                      {t.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />{t.phone}
                        </span>
                      )}
                    </div>
                    {(t.teacherData?.assignedClassIds?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {t.teacherData!.assignedClassIds.map(id => (
                          <span key={id} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100">
                            {id.replace('sec-', '').replace('-', ' ').toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
          {filteredTeachers.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">No faculty match your search.</div>
          )}
        </div>
      )}

      {/* ══ Add Class Modal ════════════════════════════════════════════════ */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-slate-900 text-base">Add New Class</h3>
              <button onClick={() => setShowClassModal(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddClass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class Name</label>
                <input type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)}
                  placeholder="e.g. Grade 8, Class XI, O Level"
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                  required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Grade Level (number)</label>
                <input type="number" value={newGradeLevel} onChange={e => setNewGradeLevel(Number(e.target.value))}
                  min={1} max={16}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required />
                <p className="text-[10px] text-slate-400 mt-1">Used for sorting. e.g. Grade 8 → enter 8</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs">
                  Add Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Edit Class Modal ══════════════════════════════════════════════ */}
      {showEditClassModal && editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-slate-900 text-base">Edit Class</h3>
              <button onClick={() => { setShowEditClassModal(false); setEditingClass(null); }} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEditClass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class Name</label>
                <input type="text" value={editClassName} onChange={e => setEditClassName(e.target.value)}
                  placeholder="e.g. Grade 8, Class XI, O Level"
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                  required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Grade Level (number)</label>
                <input type="number" value={editGradeLevel} onChange={e => setEditGradeLevel(Number(e.target.value))}
                  min={1} max={16}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required />
                <p className="text-[10px] text-slate-400 mt-1">Used for sorting. e.g. Grade 8 → enter 8</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowEditClassModal(false); setEditingClass(null); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Add Section Modal ══════════════════════════════════════════════ */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-slate-900 text-base">Add Classroom Section</h3>
              <button onClick={() => setShowSectionModal(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddSection} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign to Class</label>
                <select value={sectionClassId} onChange={e => setSectionClassId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold">
                  {sortedClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Name</label>
                <input type="text" value={secName} onChange={e => setSecName(e.target.value)}
                  placeholder="e.g. Section C"
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Location</label>
                  <input type="text" value={secRoom} onChange={e => setSecRoom(e.target.value)}
                    placeholder="e.g. Room 305"
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity</label>
                  <input type="number" value={secCapacity} onChange={e => setSecCapacity(Number(e.target.value))}
                    min={10} max={60}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSectionModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs">
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Edit Section Modal ═════════════════════════════════════════════ */}
      {showEditSectionModal && editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-slate-900 text-base">Edit Section</h3>
              <button onClick={() => { setShowEditSectionModal(false); setEditingSection(null); }} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEditSection} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Class</label>
                <input type="text" value={sortedClasses.find(c => c.id === editingSection.classId)?.name ?? '—'} disabled
                  className="w-full text-xs px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold cursor-not-allowed" />
                <p className="text-[10px] text-slate-400 mt-1">Class assignment cannot be changed after creation.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Name</label>
                <input type="text" value={editSecName} onChange={e => setEditSecName(e.target.value)}
                  placeholder="e.g. Section C"
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Location</label>
                  <input type="text" value={editSecRoom} onChange={e => setEditSecRoom(e.target.value)}
                    placeholder="e.g. Room 305"
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity</label>
                  <input type="number" value={editSecCapacity} onChange={e => setEditSecCapacity(Number(e.target.value))}
                    min={10} max={60}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowEditSectionModal(false); setEditingSection(null); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Add / Edit Subject Modal ═══════════════════════════════════════ */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-slate-900 text-base">
                {editSubject ? 'Edit Subject' : 'Create New Subject'}
              </h3>
              <button onClick={() => setShowSubjectModal(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveSubject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code</label>
                <input type="text" value={subCode} onChange={e => setSubCode(e.target.value)}
                  placeholder="e.g. BIO-107"
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
                <input type="text" value={subName} onChange={e => setSubName(e.target.value)}
                  placeholder="e.g. Molecular Biology"
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select value={subDept} onChange={e => setSubDept(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Weekly Hours</label>
                  <input type="number" value={subHours} onChange={e => setSubHours(Number(e.target.value))}
                    min={1} max={10}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs">
                  {editSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
