import React from 'react';
import { Announcement } from '@sims/shared';
import { X, Calendar, Tag, User, Pin } from 'lucide-react';

interface AnnouncementModalProps {
  announcement: Announcement | null;
  onClose: () => void;
}

export const AnnouncementDetailModal: React.FC<AnnouncementModalProps> = ({
  announcement,
  onClose,
}) => {
  if (!announcement) return null;

  const getCategoryColor = (cat: string) => {
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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryColor(
                  announcement.category
                )}`}
              >
                {announcement.category}
              </span>
              {announcement.isPinned && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <Pin className="w-3 h-3 text-amber-600" />
                  Pinned Circular
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="font-heading font-black text-slate-900 text-lg mt-3 leading-snug">
            {announcement.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(announcement.publishedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{announcement.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">{announcement.targetName || announcement.targetAudience}</span>
            </div>
          </div>

          <div className="py-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {announcement.content}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

