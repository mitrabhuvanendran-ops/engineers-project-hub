import React from 'react';
import { useProjects } from '../../context/ProjectContext';
import { CATEGORY_COLORS } from '../../constants';
import { Layers } from 'lucide-react';

export function CategoryBreakdown({ onSelectCategory }) {
  const { stats } = useProjects();
  const total = stats.total || 1;

  const entries = Object.entries(stats.categoryCounts).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400">
        <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">No project categories to display yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600" />
          <h3 className="font-semibold text-slate-800 text-sm">Discipline Distribution</h3>
        </div>
        <span className="text-xs text-slate-400">{entries.length} Disciplines</span>
      </div>

      <div className="space-y-3">
        {entries.map(([category, count]) => {
          const percentage = Math.round((count / total) * 100);
          const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

          return (
            <div
              key={category}
              onClick={() => onSelectCategory && onSelectCategory(category)}
              className="cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                  {category}
                </span>
                <span className="text-slate-400 font-mono">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color.dot} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

