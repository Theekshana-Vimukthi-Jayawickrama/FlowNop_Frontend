import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, User, Eye, Users } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import DueDate from './DueDate';
import type { ITask } from '../../types/task';

interface TaskTableProps {
  tasks: ITask[];
  sort?: string;
  onSortChange: (sort: string) => void;
  showCreatedBy?: boolean;
  showAssignedTo?: boolean;
  hideViewDetails?: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  sort = '-createdAt',
  onSortChange,
  showCreatedBy = false,
  showAssignedTo = false,
  hideViewDetails = false,
}) => {
  const handleSortClick = (field: string) => {
    if (sort === field) {
      onSortChange(`-${field}`);
    } else if (sort === `-${field}`) {
      onSortChange(field);
    } else {
      onSortChange(field);
    }
  };

  const renderSortIcon = (field: string) => {
    if (sort === field) {
      return <ChevronUp className="w-3.5 h-3.5 shrink-0 text-primary" />;
    }
    if (sort === `-${field}`) {
      return <ChevronDown className="w-3.5 h-3.5 shrink-0 text-primary" />;
    }
    return null;
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border-color bg-surface shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border-color bg-background/50 select-none">
            <th
              onClick={() => handleSortClick('title')}
              className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-main transition-colors duration-150"
            >
              <div className="flex items-center gap-1">
                <span>Title</span>
                {renderSortIcon('title')}
              </div>
            </th>
            <th
              onClick={() => handleSortClick('status')}
              className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-main transition-colors duration-150"
            >
              <div className="flex items-center gap-1">
                <span>Status</span>
                {renderSortIcon('status')}
              </div>
            </th>
            <th
              onClick={() => handleSortClick('priority')}
              className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-main transition-colors duration-150"
            >
              <div className="flex items-center gap-1">
                <span>Priority</span>
                {renderSortIcon('priority')}
              </div>
            </th>
            {showCreatedBy && (
              <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                Created By
              </th>
            )}
            {showAssignedTo && (
              <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                Assigned To
              </th>
            )}
            <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">
              Sub-Assigned
            </th>
            <th
              onClick={() => handleSortClick('dueDate')}
              className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-main transition-colors duration-150"
            >
              <div className="flex items-center gap-1">
                <span>Due Date</span>
                {renderSortIcon('dueDate')}
              </div>
            </th>
            {!hideViewDetails && (
              <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-color/60">
          {tasks.map((task) => (
            <tr
              key={task._id}
              className="hover:bg-background/30 transition-colors duration-150 text-sm"
            >
              {/* Title */}
              <td className="p-4 font-bold text-text-main max-w-xs truncate">
                <span title={task.title}>{task.title}</span>
              </td>

              {/* Status */}
              <td className="p-4">
                <StatusBadge status={task.status} />
              </td>

              {/* Priority */}
              <td className="p-4">
                <PriorityBadge priority={task.priority} />
              </td>

              {/* Created By */}
              {showCreatedBy && (
                <td className="p-4 text-text-main font-semibold">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span className="truncate max-w-[150px]" title={task.createdBy ? task.createdBy.name : 'Unknown'}>
                      {task.createdBy ? task.createdBy.name : 'Unknown'}
                    </span>
                  </div>
                </td>
              )}

              {/* Assigned To */}
              {showAssignedTo && (
                <td className="p-4 text-text-main font-semibold">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span className="truncate max-w-[150px]" title={task.assignedTo ? task.assignedTo.name : 'Unassigned'}>
                      {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                    </span>
                  </div>
                </td>
              )}

              {/* Sub-Assigned */}
              <td className="p-4">
                {task.subAssignedTo && task.subAssignedTo.length > 0 ? (
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary" title={task.subAssignedTo.map(u => u.name).join(', ')}>
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>{task.subAssignedTo.length}</span>
                  </div>
                ) : (
                  <span className="text-xs text-text-muted/50">—</span>
                )}
              </td>

              {/* Due Date */}
              <td className="p-4">
                <DueDate date={task.dueDate} status={task.status} />
              </td>

              {/* Actions */}
              {!hideViewDetails && (
                <td className="p-4 text-right">
                  <Link
                    to={`/tasks/${task._id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/10 hover:bg-primary hover:text-white hover:border-transparent transition-all duration-200"
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>View</span>
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
