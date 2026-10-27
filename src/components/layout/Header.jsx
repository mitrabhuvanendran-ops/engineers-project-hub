import React from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  FolderKanban,
  Calculator,
  LayoutDashboard
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

export function Header({ 
  currentView, 
  onToggleSidebar, 
  onOpenNewProject
}) {
  const { searchTerm, setSearchTerm, activeProject, setCurrentView } = useProjects();

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
    if (currentView === 'faqs') {
      return <span className="font-semibold text-slate-800">Frequently Asked Questions</span>;
    }
    if (currentView === 'error-codes') {
      return <span className="font-semibold text-slate-800">Error Code Directory</span>;
    }
    if (currentView === 'tickets') {
      return <span className="font-semibold text-slate-800">Support Tickets</span>;
    }
    if (currentView === 'health') {
      return <span className="font-semibold text-slate-800">System Health Diagnostics</span>;
    }
    if (currentView === '404') {
      return <span className="font-semibold text-amber-700">Error 404: Page Not Found</span>;
    }
    if (currentView === '500') {
      return <span className="font-semibold text-red-700">Error 500: Server Error</span>;
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

      {/* Right side: New Project Action */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenNewProject}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-all shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Project</span>
        </button>
      </div>
    </header>
  );
}
