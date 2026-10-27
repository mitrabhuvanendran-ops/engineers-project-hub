import React from 'react';
import { StatCards } from './StatCards';
import { RecentProjects } from './RecentProjects';
import { CategoryBreakdown } from './CategoryBreakdown';
import { Plus, Sparkles, Cpu, BookOpen, Calculator, ArrowRight, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';

export function DashboardView({ onOpenNewProject, onOpenProject, setCurrentView, onOpenAuth }) {
  const { user, isSupabaseConfigured } = useAuth();
  const { setCategoryFilter, setStatusFilter } = useProjects();

  const handleSelectCategory = (cat) => {
    setCategoryFilter(cat);
    setCurrentView('projects');
  };

  const handleSelectStatus = (status) => {
    setStatusFilter(status);
    setCurrentView('projects');
  };

  return (
    <div className="space-y-6">
      {/* Guest Mode Banner when Live Supabase is configured */}
      {!user && isSupabaseConfigured && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-800 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-xs sm:text-sm text-slate-900">
                Live Supabase Backend Connected
              </p>
              <p className="text-xs text-slate-500">
                Sign in or register your account to sync and secure your private engineering projects.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onOpenAuth && onOpenAuth('login')}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth && onOpenAuth('register')}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Engineering Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-mono font-medium border border-brand-500/30 mb-4">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <span>Welcome back, {user?.user_metadata?.full_name || 'Engineer'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Engineer's Project Hub
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Track engineering designs, organize technical notes, calculate structural & circuit formulas, and manage documentation — all unified in one centralized engineering workspace.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewProject}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm rounded-lg shadow-sm transition-all shadow-brand-600/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>

            <button
              onClick={() => setCurrentView('calculator')}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-medium text-sm rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Quick Formula Tool</span>
            </button>
          </div>
        </div>

        {/* Decorative blueprint background grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden sm:block">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <circle cx="50" cy="50" r="40" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx="50" cy="50" r="25" strokeWidth="0.5" />
            <line x1="50" y1="0" x2="50" y2="100" strokeWidth="0.5" strokeDasharray="1 1" />
            <line x1="0" y1="50" x2="100" y2="50" strokeWidth="0.5" strokeDasharray="1 1" />
            <polygon points="50,15 80,75 20,75" strokeWidth="0.5" />
          </svg>
        </div>
      </div>

      {/* Main Stat Cards */}
      <StatCards onSelectStatusFilter={handleSelectStatus} />

      {/* Two Column Section: Recent Projects & Discipline Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentProjects
            onOpenProject={onOpenProject}
            onOpenNewProject={onOpenNewProject}
          />
        </div>

        <div className="lg:col-span-1">
          <CategoryBreakdown onSelectCategory={handleSelectCategory} />
        </div>
      </div>
    </div>
  );
}

