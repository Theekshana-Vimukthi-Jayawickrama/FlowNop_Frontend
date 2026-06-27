import React from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import type { TaskStatus } from '../../types/task';

interface DueDateProps {
  date?: string;
  status: TaskStatus;
  className?: string;
}

export const DueDate: React.FC<DueDateProps> = ({ date, status, className = '' }) => {
  if (!date) {
    return <span className="text-text-muted text-xs italic select-none">No due date</span>;
  }

  const parsedDate = new Date(date);
  const now = new Date();
  
  // Set time of now to 00:00:00 to compare date only
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
  
  const isOverdue = taskDate < today && status !== 'done';

  const formattedDate = parsedDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (isOverdue) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-danger/10 border border-danger/20 text-danger select-none ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>{formattedDate} (Overdue)</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-text-muted font-medium select-none ${className}`}>
      <Calendar className="w-3.5 h-3.5 shrink-0 text-text-muted/65" />
      <span>{formattedDate}</span>
    </span>
  );
};

export default DueDate;
