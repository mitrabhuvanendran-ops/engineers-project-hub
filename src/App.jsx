import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useProjects } from './context/ProjectContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectsView } from './components/projects/ProjectsView';
import { ProjectWorkspace } from './components/workspace/ProjectWorkspace';
import { QuickCalculatorWidget } from './components/workspace/QuickCalculatorWidget';
import { ProjectFormModal } from './components/projects/ProjectFormModal';
import { AuthModal } from './components/auth/AuthModal';
import { SetupGuideModal } from './components/setup/SetupGuideModal';
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

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'projects' | 'workspace' | 'calculator'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Navigate to project workspace
  const handleOpenProject = (projectId) => {
    setActiveProjectId(projectId);
    setCurrentView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back from workspace to project list
  const handleBackToProjects = () => {
    setCurrentView('projects');
  };

  // Create Project handler
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification Provider */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSetup={() => setIsSetupModalOpen(true)}
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
          onOpenSetup={() => setIsSetupModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {projectsLoading && currentView !== 'workspace' ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-mono">Synchronizing projects...</p>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  onOpenNewProject={() => setIsNewProjectModalOpen(true)}
                  onOpenProject={handleOpenProject}
                  setCurrentView={setCurrentView}
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
            </>
          )}
        </main>

        {/* Clean Engineering Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Engineer's Project Hub</span>
            <span className="text-slate-300">•</span>
            <span>Clean Full-Stack Engineering Cockpit</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>React + Vite</span>
            <span>Tailwind CSS</span>
            <span>Supabase PostgreSQL & Auth</span>
          </div>
        </footer>
      </div>

      {/* Global Modals */}
      {/* 1. New Project Modal */}
      {isNewProjectModalOpen && (
        <ProjectFormModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onSubmit={handleCreateProjectSubmit}
          loading={actionLoading}
        />
      )}

      {/* 2. Authentication Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* 3. Setup Guide Modal */}
      {isSetupModalOpen && (
        <SetupGuideModal
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
