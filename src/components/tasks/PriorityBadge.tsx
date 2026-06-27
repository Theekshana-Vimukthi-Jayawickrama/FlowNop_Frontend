import React from 'react';
import Badge from '../ui/Badge';
import type { TaskPriority } from '../../types/task';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const mapping: Record<TaskPriority, { label: string; variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' }> = {
    low: { label: 'Low', variant: 'secondary' },
    medium: { label: 'Medium', variant: 'warning' },
    high: { label: 'High', variant: 'danger' },
  };

  const { label, variant } = mapping[priority] || { label: priority, variant: 'secondary' };

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

export default PriorityBadge;
