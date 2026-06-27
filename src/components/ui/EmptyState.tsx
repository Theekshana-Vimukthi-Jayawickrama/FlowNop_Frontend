import React from 'react';
import { ClipboardList } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No tasks found',
  description = 'Get started by creating a new task to organize your workspace.',
  action,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface border border-dashed border-border-color rounded-2xl min-h-[300px]">
      <div className="p-4 rounded-full bg-muted border border-border-color text-text-muted mb-4 flex items-center justify-center">
        {icon || <ClipboardList className="w-10 h-10" />}
      </div>
      <h3 className="text-lg font-bold text-text-main mb-1.5">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
