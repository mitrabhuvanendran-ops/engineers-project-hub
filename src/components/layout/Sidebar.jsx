import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Calculator, 
  Database, 
  LogOut, 
  User, 
  Cpu, 
  Plus, 
  Layers,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Ticket,
  Activity,
  FileQuestion
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { PROJECT_CATEGORIES } from '../../constants';

export function Sidebar({ currentView, setCurrentView, onOpenNewProject, onOpenAuth, onOpenSetup, isOpen, setIsOpen }) {
  const { user, signOut, isSupabaseConfigured } = useAuth();
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
            <p className="text-xs text-slate-400">Project & Calc Cockpit</p>
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

          {/* Assessment Knowledgebase & Diagnostics */}
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
                <span>FAQs (SQL DB)</span>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/20">
                10+
              </span>
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
                <span>Error Codes</span>
              </div>
              <span className="text-[10px] font-mono bg-rose-500/10 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/20">
                8 Codes
              </span>
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
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/20">
                SQL
              </span>
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
                <span>Health Check</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">
                200 OK
              </span>
            </button>

            {/* Test 404 & 500 Custom Pages */}
            <div className="pt-2 px-3 text-[10px] text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Test Error Pages</span>
              <FileQuestion className="w-3 h-3 text-slate-500" />
            </div>
            <div className="flex items-center gap-1.5 px-3 pt-1">
              <button
                onClick={() => handleNav('404')}
                className="flex-1 py-1 px-2 rounded bg-slate-800/60 hover:bg-slate-800 text-[11px] text-slate-300 text-center font-mono hover:text-amber-300 transition-colors"
                title="Preview Custom 404 page"
              >
                Custom 404
              </button>
              <button
                onClick={() => handleNav('500')}
                className="flex-1 py-1 px-2 rounded bg-slate-800/60 hover:bg-slate-800 text-[11px] text-slate-300 text-center font-mono hover:text-rose-300 transition-colors"
                title="Preview Custom 500 page"
              >
                Custom 500
              </button>
            </div>
          </div>

          {/* Database Setup Card */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-semibold text-slate-200">Supabase Backend</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
              {isSupabaseConfigured
                ? 'Connected to live PostgreSQL database & RLS.'
                : 'Running in Local Demo mode. Connect Supabase anytime.'}
            </p>
            <button
              onClick={() => {
                onOpenSetup();
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className="w-full text-center py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors border border-slate-700/60 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-brand-400" />
              {isSupabaseConfigured ? 'View DB Status' : 'Connect Supabase'}
            </button>
          </div>
        </div>

        {/* User Account / Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          {user ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {user.user_metadata?.full_name
                    ? user.user_metadata.full_name.charAt(0).toUpperCase()
                    : user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {user.user_metadata?.full_name || 'Engineer'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
