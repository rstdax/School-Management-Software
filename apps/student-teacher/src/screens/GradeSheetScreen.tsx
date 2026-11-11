import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { simsStore, ExamResult, PerformanceReport } from '@sims/shared';
import { Award, BookOpen, TrendingUp, Calendar, Hash, Star, User, BarChart3 } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const gradeColor = (grade: string) => {
  switch (grade) {
    case 'A+': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'A':  return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'B+':
    case 'B':  return 'bg-slate-100 text-slate-800 border-slate-200';
    case 'C':  return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'F':  return 'bg-red-100 text-red-800 border-red-200';
    default:   return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const examTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    midterm:   'bg-blue-50 text-blue-700 border-blue-200',
    final:     'bg-purple-50 text-purple-700 border-purple-200',
    unit_test: 'bg-amber-50 text-amber-700 border-amber-200',
    quarterly: 'bg-teal-50 text-teal-700 border-teal-200',
  };
  return map[type] ?? 'bg-slate-50 text-slate-600 border-slate-200';
};

const examTypeLabel = (type: string) =>
  type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

// ── Grade Result Card ─────────────────────────────────────────────────────────
const ResultCard: React.FC<{ result: ExamResult }> = ({ result }) => {
  const pct = result.percentage;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-slate-900 text-base leading-tight truncate">
              {result.examName}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${examTypeBadge(result.examType)}`}>
                {examTypeLabel(result.examType)}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <Calendar className="w-3 h-3" />
                {new Date(result.publishedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-xl border text-sm font-black flex-shrink-0 ${gradeColor(result.grade)}`}>
            {result.grade}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
            <span className="text-xs font-black text-slate-900 block">{result.obtainedMarks}/{result.totalMarks}</span>
            <span className="text-[10px] text-slate-500">Marks</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
            <span className="text-xs font-black text-slate-900 block">{pct.toFixed(1)}%</span>
            <span className="text-[10px] text-slate-500">Percentage</span>
          </div>
          {result.rank ? (
            <div className="bg-amber-50 rounded-xl p-2.5 text-center border border-amber-100">
              <span className="text-xs font-black text-amber-800 flex items-center justify-center gap-0.5">
                <Hash className="w-3 h-3" />{result.rank}
              </span>
              <span className="text-[10px] text-amber-600">Rank</span>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
              <span className="text-xs font-black text-slate-900 block">{result.academicYear}</span>
              <span className="text-[10px] text-slate-500">Year</span>
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Subject table */}
      <div className="p-4">
        <h4 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Subject Breakdown
        </h4>
        <div className="rounded-xl overflow-hidden border border-slate-100">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="text-left px-3 py-2 font-semibold">Subject</th>
                <th className="text-center px-2 py-2 font-semibold">Marks</th>
                <th className="text-center px-2 py-2 font-semibold">Grade</th>
                <th className="text-center px-2 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((subj, idx) => (
                <tr key={subj.subjectId}
                  className={`border-t border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                  <td className="px-3 py-2 font-medium text-slate-800 truncate max-w-[100px]">{subj.subjectName}</td>
                  <td className="px-2 py-2 text-center text-slate-600">{subj.obtainedMarks}/{subj.totalMarks}</td>
                  <td className="px-2 py-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold border ${gradeColor(subj.grade)}`}>
                      {subj.grade}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center">
                    {subj.isPassed
                      ? <span className="text-emerald-700 font-bold text-[10px]">Pass</span>
                      : <span className="text-red-600 font-bold text-[10px]">Fail</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {result.remarks && (
        <div className="px-4 pb-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-slate-700">
            <span className="font-bold text-slate-800 block mb-0.5">Teacher Remarks:</span>
            {result.remarks}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Star Rating ───────────────────────────────────────────────────────────────
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
    ))}
  </div>
);

const ratingLabel = (r: number) => ['', 'Poor', 'Below Avg', 'Average', 'Good', 'Excellent'][r] ?? '';

// ── Performance Report Card ───────────────────────────────────────────────────
const ReportCard: React.FC<{ report: PerformanceReport }> = ({ report }) => {
  const avg = ((report.academicRating + report.behaviorRating + report.participationRating + report.homeworkRating) / 4).toFixed(1);
  const ratings = [
    { label: 'Academic',      value: report.academicRating      },
    { label: 'Behavior',      value: report.behaviorRating      },
    { label: 'Participation', value: report.participationRating },
    { label: 'Homework',      value: report.homeworkRating      },
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-heading font-bold text-slate-900 text-base">{report.monthLabel}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <User className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">{report.teacherName}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-slate-800">{avg}</span>
          <span className="text-xs text-slate-400 block">/ 5.0</span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-2.5">
        {ratings.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-700 w-24 flex-shrink-0">{label}</span>
            <div className="flex items-center gap-2 flex-1">
              <StarRating rating={value} />
              <span className="text-[10px] text-slate-400">{ratingLabel(value)}</span>
            </div>
            <span className="text-xs font-black text-slate-700 w-4 text-right">{value}</span>
          </div>
        ))}
      </div>

      {report.strengths && (
        <div className="px-4 pb-2">
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block mb-0.5">Strengths</span>
            <p className="text-xs text-emerald-900 leading-relaxed">{report.strengths}</p>
          </div>
        </div>
      )}

      {report.improvements && (
        <div className="px-4 pb-2">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide block mb-0.5">Areas for Improvement</span>
            <p className="text-xs text-amber-900 leading-relaxed">{report.improvements}</p>
          </div>
        </div>
      )}

      {report.teacherRemarks && (
        <div className="px-4 pb-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block mb-0.5">Teacher Remarks</span>
            <p className="text-xs text-slate-700 leading-relaxed">{report.teacherRemarks}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export const GradeSheetScreen: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const [activeTab, setActiveTab] = useState<'grades' | 'performance'>('grades');

  const results  = simsStore.getExamResults(currentUser.uid);
  const reports  = simsStore.getPerformanceReports(currentUser.uid);

  const avgPct = results.length > 0
    ? results.reduce((s, r) => s + r.percentage, 0) / results.length
    : null;
  const overallGrade = avgPct === null ? null
    : avgPct >= 90 ? 'A+' : avgPct >= 80 ? 'A' : avgPct >= 70 ? 'B+' : avgPct >= 60 ? 'B' : avgPct >= 50 ? 'C' : 'F';

  return (
    <div className="p-4 sm:p-5 max-w-lg mx-auto space-y-4 pb-20">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-xl text-slate-900 tracking-tight">
            {activeTab === 'grades' ? 'Grade Sheet' : 'Performance'}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-slate-500">{currentUser.name}</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {currentUser.studentData?.className ?? 'Grade 10'} · {currentUser.studentData?.sectionName ?? 'Section A'}
            </span>
          </div>
        </div>
        <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
          {activeTab === 'grades'
            ? <Award className="w-5 h-5 text-amber-500" />
            : <BarChart3 className="w-5 h-5 text-blue-500" />}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        {([
          { key: 'grades',      label: '🎓 Grade Sheet' },
          { key: 'performance', label: '⭐ Performance'  },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-xs font-heading font-bold rounded-xl transition-all ${
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Grades Tab ── */}
      {activeTab === 'grades' && (
        <>
          {/* Overall summary */}
          {results.length >= 2 && avgPct !== null && overallGrade && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h2 className="font-heading font-bold text-slate-900 text-sm">Overall Summary</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-lg font-black text-blue-700 leading-none">{overallGrade}</span>
                  <span className="text-[10px] font-bold text-blue-500 mt-0.5">Grade</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1.5">
                    Avg: <strong className="text-slate-900">{avgPct.toFixed(1)}%</strong> across {results.length} exams
                  </p>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(avgPct, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {results.length === 0 && (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center text-slate-400">
              <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">No results published yet</p>
              <p className="text-xs mt-1">Exam results will appear here once published by administration.</p>
            </div>
          )}

          {results.map(r => <ResultCard key={r.id} result={r} />)}
        </>
      )}

      {/* ── Performance Tab ── */}
      {activeTab === 'performance' && (
        <>
          {reports.length === 0 && (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center text-slate-400">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">No performance reports yet</p>
              <p className="text-xs mt-1">Reports will appear once your class teacher submits them.</p>
            </div>
          )}
          {reports.map(r => <ReportCard key={r.id} report={r} />)}
        </>
      )}
    </div>
  );
};
