import React from 'react';
import { StatCards } from './StatCards';
import { RecentProjects } from './RecentProjects';
import { CategoryBreakdown } from './CategoryBreakdown';
import { Plus, Cpu, Calculator } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';

export function DashboardView({ onOpenNewProject, onOpenProject, setCurrentView }) {
  const { user } = useAuth();
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
      {/* Engineering Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-mono font-medium border border-brand-500/30 mb-4">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <span>Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Engineer'}</span>
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
