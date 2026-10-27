import React, { useState } from 'react';
import { 
  FileText, 
  Paperclip, 
  Calculator, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { CategoryBadge, StatusBadge } from '../common/Badge';

export function ProjectCard({
  project,
  onOpen,
  onEdit,
  onDelete
}) {
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:border-slate-300 relative overflow-hidden">
      {/* Top Card Body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={project.category} />
            <StatusBadge status={project.status} />
          </div>

          {/* Context Options Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Project actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-30 text-xs animate-in fade-in duration-150">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit(project);
                    }}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Details</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete(project);
                    }}
                    className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Project Title */}
        <h3
          onClick={() => onOpen(project.id)}
          className="font-bold text-slate-900 text-base mb-2 group-hover:text-brand-600 transition-colors cursor-pointer line-clamp-1"
        >
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {project.description || 'No project description provided yet.'}
        </p>

        {/* Last updated timestamp */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>Updated {formatRelativeTime(project.updated_at || project.created_at)}</span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1" title="Engineering Workspace Ready">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Notes</span>
          </span>
          <span className="flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5 text-slate-400" />
            <span>Calcs</span>
          </span>
          <span className="flex items-center gap-1">
            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
            <span>Files</span>
          </span>
        </div>

        <button
          onClick={() => onOpen(project.id)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          <span>Open</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
