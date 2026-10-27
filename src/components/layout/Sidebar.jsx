import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Calculator, 
  LogOut, 
  Cpu, 
  Plus, 
  Layers,
  HelpCircle,
  AlertTriangle,
  Ticket,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { PROJECT_CATEGORIES } from '../../constants';

export function Sidebar({ currentView, setCurrentView, onOpenNewProject, isOpen, setIsOpen }) {
  const { user, signOut } = useAuth();
  const { stats, categoryFilter, setCategoryFilter } = useProjects();

  const handleNav = (view) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleCategoryClick = (cat) => {
    setCurrentView('projects');
    setCategoryFilter(categoryFilter === cat ? 'All' : cat);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo & Name */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950/60">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight text-sm flex items-center gap-1.5">
              Engineer's Hub
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-brand-500/20 text-brand-300 rounded border border-brand-500/30">v1.0</span>
            </h1>
            <p className="text-xs text-slate-400">Engineering Workspace</p>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="p-4 border-b border-slate-800/80">
          <button
            onClick={() => {
              onOpenNewProject();
              if (window.innerWidth < 1024) setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm rounded-lg shadow-sm transition-all shadow-brand-600/30 hover:shadow-brand-600/50 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Main Menu
            </div>
            
            {/* Dashboard */}
            <button
              onClick={() => handleNav('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-brand-600/20 text-white border-l-4 border-brand-500 pl-2'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-brand-400" />
                <span>Dashboard</span>
              </div>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                {stats.total}
              </span>
            </button>

            {/* My Projects */}
            <button
              onClick={() => handleNav('projects')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'projects' || currentView === 'workspace'
                  ? 'bg-brand-600/20 text-white border-l-4 border-brand-500 pl-2'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="w-4 h-4 text-cyan-400" />
                <span>My Projects</span>
              </div>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                {stats.inProgress}
              </span>
            </button>

            {/* Engineering Formula Calculator */}
            <button
              onClick={() => handleNav('calculator')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'calculator'
                  ? 'bg-brand-600/20 text-white border-l-4 border-brand-500 pl-2'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Quick Calc Tool</span>
              </div>
            </button>
          </div>

          {/* Project Disciplines Quick Filters */}
          <div className="space-y-1">
            <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              <span>Disciplines</span>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="space-y-0.5">
              {PROJECT_CATEGORIES.slice(0, 6).map((cat) => {
                const count = stats.categoryCounts[cat] || 0;
                const isSelected = categoryFilter === cat && currentView === 'projects';
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors ${
                      isSelected
                        ? 'bg-slate-800 text-brand-400 font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="font-mono text-[10px] text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Support and System */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Support & System
            </div>

            {/* FAQs */}
            <button
              onClick={() => handleNav('faqs')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'faqs'
                  ? 'bg-brand-600/20 text-white border-l-4 border-brand-500 pl-2'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Frequently Asked Questions</span>
              </div>
            </button>

            {/* Error Codes */}
            <button
              onClick={() => handleNav('error-codes')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'error-codes'
                  ? 'bg-brand-600/20 text-white border-l-4 border-brand-500 pl-2'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Error Code Directory</span>
              </div>
            </button>

            {/* Support Tickets */}
            <button
              onClick={() => handleNav('tickets')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'tickets'
                  ? 'bg-brand-600/20 text-white border-l-4 border-brand-500 pl-2'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Ticket className="w-4 h-4 text-indigo-400" />
                <span>Support Tickets</span>
              </div>
            </button>

            {/* Health Check Page */}
            <button
              onClick={() => handleNav('health')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'health'
                  ? 'bg-brand-600/20 text-white border-l-4 border-brand-500 pl-2'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>System Health</span>
              </div>
            </button>
          </div>
        </div>

        {/* User Account / Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user?.user_metadata?.full_name
                  ? user.user_metadata.full_name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || 'E'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {user?.user_metadata?.full_name || 'Engineer'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'Logged In'}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
