import React from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  FolderKanban,
  Calculator,
  LayoutDashboard
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

export function Header({ 
  currentView, 
  onToggleSidebar, 
  onOpenNewProject, 
  onOpenSetup, 
  onOpenAuth 
}) {
  const { searchTerm, setSearchTerm, activeProject, setCurrentView } = useProjects();
  const { user, isSupabaseConfigured } = useAuth();

  const getViewTitle = () => {
    if (currentView === 'workspace' && activeProject) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => setCurrentView('projects')}>
            Projects
          </span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {activeProject.title}
          </span>
        </div>
      );
    }
    if (currentView === 'dashboard') {
      return (
        <div className="flex items-center gap-2 text-slate-800 font-semibold">
          <LayoutDashboard className="w-5 h-5 text-brand-600 hidden sm:inline" />
          <span>Engineering Dashboard</span>
        </div>
      );
    }
    if (currentView === 'calculator') {
      return (
        <div className="flex items-center gap-2 text-slate-800 font-semibold">
          <Calculator className="w-5 h-5 text-emerald-600 hidden sm:inline" />
          <span>Engineering Calculations Tool</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-slate-800 font-semibold">
        <FolderKanban className="w-5 h-5 text-brand-600 hidden sm:inline" />
        <span>Project Directory</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left side: Hamburger + View Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-sm">{getViewTitle()}</div>
      </div>

      {/* Center Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by title or description..."
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right side: Database Badge, Actions */}
      <div className="flex items-center gap-2.5">
        {/* Supabase status indicator pill */}
        <button
          onClick={onOpenSetup}
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            isSupabaseConfigured
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          }`}
          title="Supabase connection status"
        >
          {isSupabaseConfigured ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Supabase</span>
            </>
          ) : (
            <>
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Local Demo Mode</span>
            </>
          )}
        </button>

        {/* Primary New Project Action */}
        <button
          onClick={onOpenNewProject}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-all shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Project</span>
        </button>

        {/* Auth prompt if not signed in */}
        {!user && (
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
