import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import { CategoryBadge, StatusBadge } from '../common/Badge';
import { ArrowRight, Clock, FolderKanban } from 'lucide-react';

export function RecentProjects({ onOpenProject, onOpenNewProject }) {
  const { projects } = useProjects();

  // Sort by updated_at descending and take top 5
  const recent = [...projects]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 5);

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.round((now - date) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
        <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="font-semibold text-slate-800 text-sm mb-1">No Projects Yet</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Start documenting your engineering designs, formulas, and progress.
        </p>
        <button
          onClick={onOpenNewProject}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
        >
          Create First Project
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-600" />
          <h3 className="font-semibold text-slate-800 text-sm">Recently Updated Projects</h3>
        </div>
        <span className="text-xs text-slate-400">Latest activity</span>
      </div>

      <div className="divide-y divide-slate-100">
        {recent.map((project) => (
          <div
            key={project.id}
            onClick={() => onOpenProject(project.id)}
            className="py-3 px-2 -mx-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg hover:bg-slate-50/80 transition-colors cursor-pointer group"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-slate-900 text-sm truncate group-hover:text-brand-600 transition-colors">
                  {project.title}
                </h4>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-lg">
                {project.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <CategoryBadge category={project.category} />
              <StatusBadge status={project.status} />
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                {formatRelativeTime(project.updated_at || project.created_at)}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

