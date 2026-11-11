import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { simsStore, Announcement } from '@sims/shared';
import {
  Megaphone,
  Plus,
  Pin,
  Trash2,
  Calendar,
  X,
  CheckCircle2,
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const announcements = simsStore.getAnnouncements();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'academic' | 'events' | 'exam' | 'administrative' | 'urgent'>('academic');
  const [targetAudience, setTargetAudience] = useState('all');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !currentAdmin) return;

    simsStore.saveAnnouncement({
      id: `ann-${Date.now()}`,
      schoolId: 'school-oakridge-01',
      title: title.trim(),
      content: content.trim(),
      category,
      targetAudience,
      targetName: targetAudience === 'all' ? 'All School' : targetAudience,
      isPinned,
      authorId: currentAdmin.uid,
      authorName: `${currentAdmin.name} (${currentAdmin.adminData?.adminRole || 'Admin'})`,
      publishedAt: new Date().toISOString(),
    });

    setShowModal(false);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setActionSuccess('School announcement published successfully.');
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      simsStore.deleteAnnouncement(id);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Communications
          </span>
          <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
            Institutional Announcements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast official administrative circulars, examination advisories, and campus bulletins.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Circular</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-full border border-blue-200 uppercase">
                  {ann.category}
                </span>
                {ann.isPinned && (
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 font-bold text-[10px] rounded-full border border-amber-200 flex items-center gap-1">
                    <Pin className="w-3 h-3 text-amber-600" />
                    Pinned
                  </span>
                )}
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">Target: {ann.targetName || ann.targetAudience}</span>
              </div>

              <h3 className="font-heading font-black text-slate-900 text-base">
                {ann.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                <span>Published by {ann.authorName}</span>
                <span>•</span>
                <span>{new Date(ann.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleDelete(ann.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Delete Announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-slate-900 text-base">
                Broadcast School Announcement
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for First Term Examinations"
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="academic">Academic</option>
                    <option value="exam">Examination</option>
                    <option value="events">Events & Sports</option>
                    <option value="administrative">Administrative</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Entire Institution</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Teaching Faculty Only</option>
                    <option value="parents">Parents Only</option>
                    <option value="Grade 10">Grade 10 Specific</option>
                    <option value="Grade 12">Grade 12 Specific</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Body / Directives</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Draft the announcement details, schedules, and instructions..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold">Pin notice to the top of student and parent feeds</span>
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

