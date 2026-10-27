import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Layout, 
  FileText, 
  Paperclip, 
  Calculator, 
  Edit3, 
  Trash2, 
  Plus
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { CategoryBadge, StatusBadge } from '../common/Badge';
import { PROJECT_STATUSES } from '../../constants';
import { OverviewTab } from './OverviewTab';
import { NotesTab } from './NotesTab';
import { FilesTab } from './FilesTab';
import { CalculationsTab } from './CalculationsTab';
import { ProjectFormModal } from '../projects/ProjectFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { NoteModal } from './NoteModal';
import { CalculationModal } from './CalculationModal';
import { FileUploadModal } from './FileUploadModal';

export function ProjectWorkspace({ onBack }) {
  const {
    activeProject,
    notes,
    calculations,
    files,
    updateProject,
    deleteProject,
    createNote,
    createCalculation,
    uploadFile,
    actionLoading
  } = useProjects();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'notes', 'files', 'calculations'
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // Quick modals triggered from overview
  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);
  const [isQuickCalcOpen, setIsQuickCalcOpen] = useState(false);
  const [isQuickUploadOpen, setIsQuickUploadOpen] = useState(false);

  if (!activeProject) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500 text-sm mb-4">No project selected.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium"
        >
          Return to Projects
        </button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus) => {
    await updateProject(activeProject.id, { status: newStatus });
  };

  const handleEditSubmit = async (formData) => {
    const res = await updateProject(activeProject.id, formData);
    if (res?.success) setIsEditingProject(false);
    return res;
  };

  const handleDeleteConfirm = async () => {
    await deleteProject(activeProject.id);
    setIsDeletingProject(false);
    onBack();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layout, count: null },
    { id: 'notes', label: 'Notes', icon: FileText, count: notes.length },
    { id: 'files', label: 'Files', icon: Paperclip, count: files.length },
    { id: 'calculations', label: 'Calculations', icon: Calculator, count: calculations.length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Workspace Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Back button & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              title="Back to Project Directory"
              aria-label="Back to projects"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <CategoryBadge category={activeProject.category} />
                <StatusBadge status={activeProject.status} />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                {activeProject.title}
              </h1>
            </div>
          </div>

          {/* Actions: Status Dropdown & Edit / Delete */}
          <div className="flex items-center gap-2 flex-wrap ml-auto md:ml-0">
            <select
              value={activeProject.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              {PROJECT_STATUSES.map((stat) => (
                <option key={stat} value={stat}>
                  Status: {stat}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsEditingProject(true)}
              className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
              title="Edit project details"
              aria-label="Edit project details"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsDeletingProject(true)}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
              title="Delete project"
              aria-label="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                      isActive
                        ? 'bg-brand-200/60 text-brand-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Renderer */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab
            project={activeProject}
            notesCount={notes.length}
            filesCount={files.length}
            calculationsCount={calculations.length}
            onStatusChange={handleStatusChange}
            onEditProject={() => setIsEditingProject(true)}
            onDeleteProject={() => setIsDeletingProject(true)}
            onSwitchTab={setActiveTab}
            onOpenNewNote={() => setIsQuickNoteOpen(true)}
            onOpenNewCalc={() => setIsQuickCalcOpen(true)}
            onOpenUpload={() => setIsQuickUploadOpen(true)}
          />
        )}

        {activeTab === 'notes' && (
          <NotesTab notes={notes} projectId={activeProject.id} />
        )}

        {activeTab === 'files' && (
          <FilesTab files={files} projectId={activeProject.id} />
        )}

        {activeTab === 'calculations' && (
          <CalculationsTab calculations={calculations} projectId={activeProject.id} />
        )}
      </div>

      {/* Edit Project Modal */}
      {isEditingProject && (
        <ProjectFormModal
          isOpen={isEditingProject}
          onClose={() => setIsEditingProject(false)}
          onSubmit={handleEditSubmit}
          initialData={activeProject}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation */}
      {isDeletingProject && (
        <ConfirmDialog
          isOpen={isDeletingProject}
          onClose={() => setIsDeletingProject(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Project?"
          message={`Are you sure you want to delete "${activeProject.title}"? All notes, files, and calculations will be permanently erased.`}
          confirmText="Delete Project"
          danger={true}
          loading={actionLoading}
        />
      )}

      {/* Quick Note Modal */}
      {isQuickNoteOpen && (
        <NoteModal
          isOpen={isQuickNoteOpen}
          onClose={() => setIsQuickNoteOpen(false)}
          onSubmit={async (data) => {
            const res = await createNote({ projectId: activeProject.id, ...data });
            if (res?.success) setIsQuickNoteOpen(false);
            return res;
          }}
          loading={actionLoading}
        />
      )}

      {/* Quick Calculation Modal */}
      {isQuickCalcOpen && (
        <CalculationModal
          isOpen={isQuickCalcOpen}
          onClose={() => setIsQuickCalcOpen(false)}
          onSubmit={async (data) => {
            const res = await createCalculation({ projectId: activeProject.id, ...data });
            if (res?.success) setIsQuickCalcOpen(false);
            return res;
          }}
          loading={actionLoading}
        />
      )}

      {/* Quick Upload Modal */}
      {isQuickUploadOpen && (
        <FileUploadModal
          isOpen={isQuickUploadOpen}
          onClose={() => setIsQuickUploadOpen(false)}
          onUpload={async (file) => {
            const res = await uploadFile(activeProject.id, file);
            if (res?.success) setIsQuickUploadOpen(false);
            return res;
          }}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
