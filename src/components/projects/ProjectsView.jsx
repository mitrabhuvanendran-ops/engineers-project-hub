import React, { useState } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { FilterBar } from './FilterBar';
import { ProjectCard } from './ProjectCard';
import { ProjectFormModal } from './ProjectFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Plus, FolderKanban, SearchX } from 'lucide-react';

export function ProjectsView({ onOpenProject, onOpenNewProject }) {
  const {
    filteredProjects,
    projects,
    updateProject,
    deleteProject,
    actionLoading,
    setSearchTerm,
    setCategoryFilter,
    setStatusFilter
  } = useProjects();

  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  const handleEditSubmit = async (formData) => {
    if (!editingProject) return;
    const res = await updateProject(editingProject.id, formData);
    if (res.success) {
      setEditingProject(null);
    }
    return res;
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    await deleteProject(deletingProject.id);
    setDeletingProject(null);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Project Directory</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse, search, and manage all your active engineering projects.
          </p>
        </div>

        <button
          onClick={onOpenNewProject}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-medium text-xs sm:text-sm rounded-lg shadow-sm transition-all shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar />

      {/* Project Cards Grid / Empty States */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={onOpenProject}
              onEdit={setEditingProject}
              onDelete={setDeletingProject}
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        // Entirely empty state (no projects in DB)
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm my-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Projects Found</h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
            Get started by creating your first engineering project to document your hardware designs, circuit schematics, notes, and calculations.
          </p>
          <button
            onClick={onOpenNewProject}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Project</span>
          </button>
        </div>
      ) : (
        // Filter result empty state
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm my-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Matching Projects</h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
            No projects matched your specified search query, category, or status filter. Try clearing your filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <ProjectFormModal
          isOpen={Boolean(editingProject)}
          onClose={() => setEditingProject(null)}
          onSubmit={handleEditSubmit}
          initialData={editingProject}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <ConfirmDialog
          isOpen={Boolean(deletingProject)}
          onClose={() => setDeletingProject(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Project?"
          message={`Are you sure you want to permanently delete "${deletingProject.title}"? All associated notes, calculations, and files will also be removed.`}
          confirmText="Yes, Delete Project"
          danger={true}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

