import React from 'react';
import { CATEGORY_COLORS, STATUS_COLORS } from '../../constants';

export function CategoryBadge({ category, className = '' }) {
  const config = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {category}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const config = STATUS_COLORS[status] || STATUS_COLORS['Not Started'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.badge} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}
