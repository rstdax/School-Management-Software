import React, { useState } from 'react';
import { simsStore, Announcement } from '@sims/shared';
import { Search, Pin, Calendar, User, ArrowRight, Megaphone } from 'lucide-react';

interface AnnouncementsProps {
  onSelectAnnouncement: (ann: Announcement) => void;
}

export const StudentAnnouncementsScreen: React.FC<AnnouncementsProps> = ({
  onSelectAnnouncement,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Notices' },
    { id: 'academic', label: 'Academic' },
    { id: 'exam', label: 'Exams' },
    { id: 'events', label: 'Events' },
    { id: 'urgent', label: 'Urgent' },
  ];

  const allAnnouncements = simsStore.getAnnouncements(selectedCategory);
  const filtered = allAnnouncements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'exam':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'events':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="p-4 sm:p-5 max-w-lg mx-auto space-y-4 pb-20">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-xl text-slate-900 tracking-tight">
          School Announcements
        </h1>
        <p className="text-xs text-slate-500">
          Official circulars, academic notices, and institution events
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search circulars, exams, events..."
          className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-2xs"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <span>No notices matching your filter.</span>
          </div>
        ) : (
          filtered.map((ann) => (
            <div
              key={ann.id}
              onClick={() => onSelectAnnouncement(ann)}
              className="p-4 bg-white hover:bg-blue-50/20 border border-slate-200/80 rounded-2xl shadow-xs transition-all cursor-pointer space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryTheme(
                      ann.category
                    )}`}
                  >
                    {ann.category}
                  </span>
                  {ann.isPinned && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Pin className="w-3 h-3 text-amber-600" />
                      Pinned
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(ann.publishedAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="font-heading font-bold text-slate-900 text-sm leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {ann.content}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  By {ann.authorName}
                </span>
                <span className="text-blue-600 font-bold flex items-center gap-1 text-[11px]">
                  <span>Read Notice</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

