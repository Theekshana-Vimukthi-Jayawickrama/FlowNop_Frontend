import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import useUsers from '../../features/users/useUsers';

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  showAssigneeFilter?: boolean;
  assignedTo?: string;
  onAssignedToChange?: (value: string) => void;
  hideStatusFilter?: boolean;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  sort,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  showAssigneeFilter = false,
  assignedTo = '',
  onAssignedToChange,
  hideStatusFilter = false,
}) => {
  const { data: users = [], isLoading: loadingUsers } = useUsers({
    enabled: showAssigneeFilter,
  });

  return (
    <div className="p-4 rounded-2xl bg-surface border border-border-color shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
      {/* Search Filter */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/60" />
          <Input
            placeholder="Search tasks by title..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            id="task-search-input"
          />
        </div>
      </div>

      <div className={`grid grid-cols-1 ${
        (showAssigneeFilter && !hideStatusFilter)
          ? 'sm:grid-cols-2 md:grid-cols-4'
          : ((showAssigneeFilter || !hideStatusFilter) ? 'sm:grid-cols-3' : 'sm:grid-cols-2')
      } gap-4 shrink-0 lg:w-auto`}>
        {/* Status Filter */}
        {!hideStatusFilter && (
          <div className="w-full sm:w-40 select-none">
            <Select
              label="Status"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'testing', label: 'Testing' },
                { value: 'done', label: 'Done' },
              ]}
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              id="task-status-filter"
            />
          </div>
        )}

        {/* Priority Filter */}
        <div className="w-full sm:w-40 select-none">
          <Select
            label="Priority"
            options={[
              { value: '', label: 'All Priorities' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            id="task-priority-filter"
          />
        </div>

        {/* Assignee Filter */}
        {showAssigneeFilter && (
          <div className="w-full sm:w-44 select-none">
            <Select
              label="Assignee"
              options={[
                { value: '', label: 'All Assignees' },
                ...users.map((u) => ({
                  value: u._id,
                  label: u.name,
                })),
              ]}
              value={assignedTo}
              onChange={(e) => onAssignedToChange?.(e.target.value)}
              disabled={loadingUsers}
              id="task-assignee-filter"
            />
          </div>
        )}

        {/* Sort Select */}
        <div className="w-full sm:w-44 select-none">
          <Select
            label="Sort By"
            options={[
              { value: '-createdAt', label: 'Newest First' },
              { value: 'createdAt', label: 'Oldest First' },
              { value: 'title', label: 'Title (A-Z)' },
              { value: '-title', label: 'Title (Z-A)' },
              { value: 'dueDate', label: 'Due Date (Soonest)' },
              { value: '-dueDate', label: 'Due Date (Latest)' },
            ]}
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            id="task-sort-select"
          />
        </div>
      </div>

      {/* Reset Action */}
      {hasActiveFilters && (
        <div className="flex items-end justify-start select-none">
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-1.5 py-2 px-3 font-bold text-text-muted hover:text-danger hover:border-danger/30 hover:bg-danger/5 transition-all text-xs h-[38px]"
            id="task-reset-filters-btn"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Reset</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
