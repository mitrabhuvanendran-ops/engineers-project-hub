import React from 'react';
import { FolderKanban, Activity, CheckCircle2, Clock } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

export function StatCards({ onSelectStatusFilter }) {
  const { stats, statusFilter, setStatusFilter, setCurrentView } = useProjects();

  const cards = [
    {
      id: 'all',
      title: 'Total Projects',
      value: stats.total,
      subtitle: 'Managed repositories',
      icon: FolderKanban,
      color: 'text-brand-600',
      bgColor: 'bg-brand-50 border-brand-100',
      activeFilter: 'All'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      value: stats.inProgress,
      subtitle: 'Active development',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-100',
      activeFilter: 'In Progress'
    },
    {
      id: 'completed',
      title: 'Completed',
      value: stats.completed,
      subtitle: 'Successfully deployed',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-100',
      activeFilter: 'Completed'
    },
    {
      id: 'not-started',
      title: 'Not Started',
      value: stats.notStarted,
      subtitle: 'Backlog & planning',
      icon: Clock,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100 border-slate-200',
      activeFilter: 'Not Started'
    }
  ];

  const handleCardClick = (filter) => {
    if (onSelectStatusFilter) {
      onSelectStatusFilter(filter);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = statusFilter === card.activeFilter;

        return (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.activeFilter)}
            className={`p-5 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group ${
              isSelected ? 'ring-2 ring-brand-500 border-brand-500' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg border ${card.bgColor} ${card.color} group-hover:scale-105 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
                {card.value}
              </span>
              <span className="text-xs text-slate-400">projects</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}

