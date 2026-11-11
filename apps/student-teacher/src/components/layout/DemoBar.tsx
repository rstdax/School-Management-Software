import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { simsStore } from '@sims/shared';
import { Sparkles, RotateCcw, Smartphone, Monitor, Shield } from 'lucide-react';

interface DemoBarProps {
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  onNavigateScreen: (screen: string) => void;
}

export const DemoBar: React.FC<DemoBarProps> = ({
  isMobileFrame,
  setIsMobileFrame,
  onNavigateScreen,
}) => {
  const { currentUser, switchDemoUser } = useAuth();

  const handleReset = () => {
    if (window.confirm('Reset all demo school data to default factory records?')) {
      simsStore.resetAllDemoData();
      alert('Demo data has been reset successfully.');
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-2 px-3 sm:px-6 shadow-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-50">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-semibold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-800/60">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          SIMS Interactive
        </span>
        <span className="hidden md:inline text-slate-400 text-xs">
          Role Switcher:
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              switchDemoUser('student-alex');
              onNavigateScreen('dashboard');
            }}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              currentUser?.uid === 'student-alex'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Alex Rivera (Grade 10-A)"
          >
            Student
          </button>
          <button
            onClick={() => {
              switchDemoUser('parent-maria');
              onNavigateScreen('dashboard');
            }}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              currentUser?.uid === 'parent-maria'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Maria Rivera (Alex & Sophia's parent)"
          >
            Parent
          </button>
          <button
            onClick={() => {
              switchDemoUser('teacher-david');
              onNavigateScreen('dashboard');
            }}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              currentUser?.uid === 'teacher-david'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Prof. David Miller (Head of Mathematics)"
          >
            Teacher
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Admin Website Quick Link */}
        <a
          href="http://localhost:5174"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 px-2.5 py-1 rounded font-medium transition-colors"
          title="Open Admin Management Workspace on Port 5174"
        >
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          Admin Portal ↗
        </a>

        {/* Viewport Frame Toggle for Desktop */}
        <button
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          className="hidden sm:flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors"
          title="Toggle Mobile Simulator Frame"
        >
          {isMobileFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-slate-400" />
              <span>Fluid</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>Mobile Frame</span>
            </>
          )}
        </button>

        {/* Reset seed data button */}
        <button
          onClick={handleReset}
          className="flex items-center gap-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 px-2 py-1 rounded transition-colors"
          title="Reset factory sample records"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset Data</span>
        </button>
      </div>
    </div>
  );
};

