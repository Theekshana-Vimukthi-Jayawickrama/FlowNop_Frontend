import React from 'react';
import Badge from '../ui/Badge';
import type { TaskStatus } from '../../types/task';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const mapping: Record<TaskStatus, { label: string; variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' }> = {
    open: { label: 'Open', variant: 'info' },
    in_progress: { label: 'In Progress', variant: 'warning' },
    testing: { label: 'Testing', variant: 'primary' },
    done: { label: 'Done', variant: 'success' },
    'Super Admin Approved': { label: 'Super Admin Approved', variant: 'success' },
  };

  const { label, variant } = mapping[status] || { label: status, variant: 'secondary' };

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
