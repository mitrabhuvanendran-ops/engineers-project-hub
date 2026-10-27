import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useProjects } from './context/ProjectContext';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectsView } from './components/projects/ProjectsView';
import { ProjectWorkspace } from './components/workspace/ProjectWorkspace';
import { QuickCalculatorWidget } from './components/workspace/QuickCalculatorWidget';
import { FAQView } from './components/faq/FAQView';
import { ErrorCodesView } from './components/errors/ErrorCodesView';
import { SupportTicketsView } from './components/tickets/SupportTicketsView';
import { HealthCheckView } from './components/health/HealthCheckView';
import { NotFoundPage } from './components/pages/NotFoundPage';
import { ServerErrorPage } from './components/pages/ServerErrorPage';
import { AIAssistantWidget } from './components/assistant/AIAssistantWidget';
import { ProjectFormModal } from './components/projects/ProjectFormModal';
import { Toast } from './components/common/Toast';

export function App() {
  const { user, loading: authLoading } = useAuth();
  const { 
    activeProjectId, 
    setActiveProjectId, 
    createProject, 
    actionLoading,
    toast, 
    closeToast,
    loading: projectsLoading
  } = useProjects();

  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState(null);

  // Synchronize route with window URL pathname or hash (handles custom 404 page for unknown URLs)
  useEffect(() => {
    const handleUrlRoute = () => {
      const pathname = window.location.pathname.replace(/^\/+/g, '');
      const hash = window.location.hash.replace(/^#\/?/g, '');
      const target = hash || pathname;

      if (!target || target === '' || target === 'index.html' || target === 'dashboard') {
        setCurrentView('dashboard');
      } else if (target === 'projects') {
        setCurrentView('projects');
      } else if (target === 'calculator') {
        setCurrentView('calculator');
      } else if (target === 'faqs') {
        setCurrentView('faqs');
      } else if (target === 'error-codes' || target === 'errors') {
        setCurrentView('error-codes');
      } else if (target === 'tickets' || target === 'support') {
        setCurrentView('tickets');
      } else if (target === 'health') {
        setCurrentView('health');
      } else if (target === '500') {
        setCurrentView('500');
      } else if (target === '404') {
        setCurrentView('404');
      } else if (target === 'workspace') {
        // Workspace view remains if project active
      } else {
        // Unknown address -> Show Custom 404 Page!
        setCurrentView('404');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);

    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  const handleOpenProject = (projectId) => {
    setActiveProjectId(projectId);
    setCurrentView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToProjects = () => {
    setCurrentView('projects');
  };

  const handleAskAssistant = (promptText) => {
    setAssistantPrompt(promptText);
  };

  const handleCreateProjectSubmit = async (formData) => {
    const res = await createProject(formData);
    if (res?.success) {
      setIsNewProjectModalOpen(false);
      if (res.data?.id) {
        handleOpenProject(res.data.id);
      }
    }
    return res;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-slate-400">Loading Engineer's Hub...</p>
      </div>
    );
  }

  // REQUIREMENT: Show Login Page Initially when not logged in
  if (!user) {
    return (
      <>
        <Toast toast={toast} onClose={closeToast} />
        {/* Persistent AI Assistant on every page including Login */}
        <AIAssistantWidget
          initialPrompt={assistantPrompt}
          onClearInitialPrompt={() => setAssistantPrompt(null)}
        />
        <LoginPage />
      </>
    );
  }

  // Once authenticated, show main application dashboard and workspace
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Toast Notification Provider */}
      <Toast toast={toast} onClose={closeToast} />

      {/* AI Assistant Chat Widget (Present on EVERY page) */}
      <AIAssistantWidget
        initialPrompt={assistantPrompt}
        onClearInitialPrompt={() => setAssistantPrompt(null)}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.location.hash = view;
        }}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main App Layout */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Sticky Header */}
        <Header
          currentView={currentView}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {projectsLoading && (currentView === 'projects' || currentView === 'dashboard') ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-mono">Loading projects...</p>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  onOpenNewProject={() => setIsNewProjectModalOpen(true)}
                  onOpenProject={handleOpenProject}
                  setCurrentView={(v) => {
                    setCurrentView(v);
                    window.location.hash = v;
                  }}
                />
              )}

              {currentView === 'projects' && (
                <ProjectsView
                  onOpenProject={handleOpenProject}
                  onOpenNewProject={() => setIsNewProjectModalOpen(true)}
                />
              )}

              {currentView === 'workspace' && (
                <ProjectWorkspace onBack={handleBackToProjects} />
              )}

              {currentView === 'calculator' && (
                <QuickCalculatorWidget
                  onOpenProjectSelect={() => setCurrentView('projects')}
                />
              )}

              {currentView === 'faqs' && (
                <FAQView onAskAssistant={handleAskAssistant} />
              )}

              {currentView === 'error-codes' && (
                <ErrorCodesView onAskAssistant={handleAskAssistant} />
              )}

              {currentView === 'tickets' && (
                <SupportTicketsView onAskAssistant={handleAskAssistant} />
              )}

              {currentView === 'health' && (
                <HealthCheckView />
              )}

              {currentView === '404' && (
                <NotFoundPage
                  onGoHome={() => {
                    setCurrentView('dashboard');
                    window.location.hash = '';
                  }}
                  onAskAssistant={handleAskAssistant}
                />
              )}

              {currentView === '500' && (
                <ServerErrorPage
                  onGoHome={() => {
                    setCurrentView('dashboard');
                    window.location.hash = '';
                  }}
                  onAskAssistant={handleAskAssistant}
                  onRetry={() => {
                    setCurrentView('dashboard');
                    window.location.hash = '';
                  }}
                />
              )}
            </>
          )}
        </main>

        {/* Clean Professional Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Engineer's Project Hub</span>
            <span className="text-slate-300">•</span>
            <span>Empowering Engineering Projects & Research</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>© {new Date().getFullYear()} Engineer's Project Hub. All rights reserved.</span>
          </div>
        </footer>
      </div>

      {/* Global Modals */}
      {isNewProjectModalOpen && (
        <ProjectFormModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onSubmit={handleCreateProjectSubmit}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

export default App;
