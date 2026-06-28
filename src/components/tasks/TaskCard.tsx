import React from 'react';
import { Link } from 'react-router-dom';
import { User, Eye, Users } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import Card from '../ui/Card';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import DueDate from './DueDate';
import type { ITask } from '../../types/task';
import { getTask } from '../../api/tasks';

interface TaskCardProps {
  task: ITask;
  hideViewDetails?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, hideViewDetails = false }) => {
  const { _id, title, description, status, priority, dueDate, assignedTo, subAssignedTo } = task;
  const queryClient = useQueryClient();

  const handlePrefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['task', _id],
      queryFn: () => getTask(_id),
      staleTime: 1000 * 30, // 30 seconds
    });
  };

  return (
    <Card 
      className="flex flex-col h-full hover:shadow-md transition-shadow duration-200"
      onMouseEnter={handlePrefetch}
    >
      {/* Badges bar */}
      <div className="flex items-center justify-between mb-3">
        <PriorityBadge priority={priority} />
        <StatusBadge status={status} />
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-text-main line-clamp-1 mb-1.5" title={title}>
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs text-text-muted line-clamp-3 mb-4 flex-grow min-h-[48px]">
        {description || <span className="italic text-text-muted/60">No description provided.</span>}
      </p>

      {/* Divider */}
      <div className="border-t border-border-color/60 my-3" />

      {/* Task Meta Details */}
      <div className="flex flex-col gap-2 mb-4">
        {/* Due Date */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-text-muted select-none">Due Date</span>
          <DueDate date={dueDate} status={status} />
        </div>

        {/* Assignee */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-text-muted select-none">Assignee</span>
          <div className="flex items-center gap-1 text-xs font-semibold text-text-main">
            <User className="w-3.5 h-3.5 text-text-muted/70 shrink-0" />
            <span className="truncate max-w-[120px]">
              {assignedTo ? assignedTo.name : 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Sub-Assigned Users */}
        {subAssignedTo && subAssignedTo.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-text-muted select-none">Sub-Assigned</span>
            <div className="flex items-center gap-1 text-xs font-semibold text-primary">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{subAssignedTo.length} user{subAssignedTo.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      {!hideViewDetails && (
        <Link
          to={`/tasks/${_id}`}
          className="mt-auto w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/15 hover:bg-primary hover:text-white hover:border-transparent transition-all duration-200"
        >
          <Eye className="w-4 h-4 shrink-0" />
          <span>View Details</span>
        </Link>
      )}
    </Card>
  );
};

export default TaskCard;
