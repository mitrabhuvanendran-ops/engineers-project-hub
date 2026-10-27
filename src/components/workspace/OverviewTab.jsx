import React from 'react';
import { CategoryBadge, StatusBadge } from '../common/Badge';
import { PROJECT_STATUSES } from '../../constants';
import { 
  FileText, 
  Paperclip, 
  Calculator, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  ArrowRight,
  Plus
} from 'lucide-react';

export function OverviewTab({
  project,
  notesCount,
  filesCount,
  calculationsCount,
  onStatusChange,
  onEditProject,
  onDeleteProject,
  onSwitchTab,
  onOpenNewNote,
  onOpenNewCalc,
  onOpenUpload
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Main Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={project.category} />
              <StatusBadge status={project.status} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {project.title}
            </h2>
          </div>

          {/* Quick Status Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status:
            </label>
            <select
              value={project.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              {PROJECT_STATUSES.map((stat) => (
                <option key={stat} value={stat}>
                  {stat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Project Description */}
        <div className="py-6 border-b border-slate-100">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Project Description & Objectives
          </h4>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {project.description || 'No detailed description provided yet for this project. Click "Edit Details" to add project goals, parameters, or specifications.'}
          </p>
        </div>

        {/* Metadata Timestamps */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Created: {formatDate(project.created_at)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last Modified: {formatDate(project.updated_at || project.created_at)}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEditProject}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-brand-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1.5 border border-slate-200"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={onDeleteProject}
              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors inline-flex items-center gap-1.5 border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Quick Navigation / Workspace Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Notes Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold font-mono text-slate-900">{notesCount}</span>
            </div>
            <h4 className="font-semibold text-slate-800 text-sm mb-1">Engineering Notes</h4>
            <p className="text-xs text-slate-500 mb-4">
              Design specifications, test logs, meeting minutes, and architectural decisions.
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={onOpenNewNote}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
            <button
              onClick={() => onSwitchTab('notes')}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Calculations Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold font-mono text-slate-900">{calculationsCount}</span>
            </div>
            <h4 className="font-semibold text-slate-800 text-sm mb-1">Calculations & Math</h4>
            <p className="text-xs text-slate-500 mb-4">
              Structural formulas, Ohm's law, torque, battery endurance, and live evaluations.
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={onOpenNewCalc}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Calc</span>
            </button>
            <button
              onClick={() => onSwitchTab('calculations')}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Files & Documents Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                <Paperclip className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold font-mono text-slate-900">{filesCount}</span>
            </div>
            <h4 className="font-semibold text-slate-800 text-sm mb-1">Documents & Media</h4>
            <p className="text-xs text-slate-500 mb-4">
              CAD schematics, circuit diagrams, testing photos, component datasheets, and PDFs.
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={onOpenUpload}
              className="text-xs font-medium text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              onClick={() => onSwitchTab('files')}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
            >
              <span>View Files</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
