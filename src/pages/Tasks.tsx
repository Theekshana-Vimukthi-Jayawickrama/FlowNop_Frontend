import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTasks } from '../features/tasks/useTasks';
import useCreateTask from '../features/tasks/useCreateTask';
import { getTasks } from '../api/tasks';
import TaskCard from '../components/tasks/TaskCard';
import TaskTable from '../components/tasks/TaskTable';
import TaskViewToggle from '../components/tasks/TaskViewToggle';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import TaskForm from '../components/tasks/TaskForm';
import TaskFilters from '../components/tasks/TaskFilters';
import Pagination from '../components/ui/Pagination';
import { Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Local storage cache for view preference
  const [view, setView] = useState<'table' | 'cards'>(() => {
    const saved = localStorage.getItem('task_view_pref');
    return (saved === 'table' || saved === 'cards') ? saved : 'cards';
  });

  const handleViewChange = (newView: 'table' | 'cards') => {
    setView(newView);
    localStorage.setItem('task_view_pref', newView);
  };

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { mutateAsync: createTask, isPending: isCreating } = useCreateTask();

  const handleCreateTask = async (values: any) => {
    try {
      await createTask(values);
      setIsCreateModalOpen(false);
    } catch {
      // toast notification already fired by mutation
    }
  };

  // URL Query Sync Setup
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentPriority = searchParams.get('priority') || '';
  const currentSort = searchParams.get('sort') || '-createdAt';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentAssignedTo = searchParams.get('assignedTo') || '';
  const currentApproved = searchParams.get('approved') || 'false';
  const limit = 10;

  // Local search text input state
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  // Keep local search term in sync with query changes (e.g. on clear/reset)
  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  // Debounce search term to update URL Search Params
  useEffect(() => {
    if (searchTerm === currentSearch) {
      return;
    }

    const handler = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchTerm) {
          next.set('search', searchTerm);
        } else {
          next.delete('search');
        }
        next.set('page', '1'); // Reset to page 1 on search change
        return next;
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, currentSearch, setSearchParams]);

  // Query Hook
  const { data, isLoading, isError, error, refetch } = useTasks({
    search: currentSearch || undefined,
    status: currentApproved === 'true' ? undefined : (currentStatus || undefined),
    priority: currentPriority || undefined,
    assignedTo: isAdmin && currentAssignedTo ? currentAssignedTo : undefined,
    sort: currentSort,
    page: currentPage,
    limit,
    approved: currentApproved,
  });

  const queryClient = useQueryClient();
  const tasks = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 10, pages: 1 };

  // Prefetch next and previous pages for instantaneous page navigation
  useEffect(() => {
    const nextQueryParams = {
      search: currentSearch || undefined,
      status: currentApproved === 'true' ? undefined : (currentStatus || undefined),
      priority: currentPriority || undefined,
      assignedTo: isAdmin && currentAssignedTo ? currentAssignedTo : undefined,
      sort: currentSort,
      limit,
      approved: currentApproved,
    };

    if (currentPage < meta.pages) {
      queryClient.prefetchQuery({
        queryKey: ['tasks', { ...nextQueryParams, page: currentPage + 1 }],
        queryFn: () => getTasks({ ...nextQueryParams, page: currentPage + 1 }),
        staleTime: 1000 * 30,
      });
    }

    if (currentPage > 1) {
      queryClient.prefetchQuery({
        queryKey: ['tasks', { ...nextQueryParams, page: currentPage - 1 }],
        queryFn: () => getTasks({ ...nextQueryParams, page: currentPage - 1 }),
        staleTime: 1000 * 30,
      });
    }
  }, [currentPage, meta.pages, currentSearch, currentStatus, currentPriority, currentSort, currentAssignedTo, currentApproved, isAdmin, limit, queryClient]);

  // Filter handlers
  const handleStatusChange = (statusValue: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (statusValue) {
        next.set('status', statusValue);
      } else {
        next.delete('status');
      }
      next.set('page', '1');
      return next;
    });
  };

  const handlePriorityChange = (priorityValue: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (priorityValue) {
        next.set('priority', priorityValue);
      } else {
        next.delete('priority');
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleAssignedToChange = (assignedToValue: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (assignedToValue) {
        next.set('assignedTo', assignedToValue);
      } else {
        next.delete('assignedTo');
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleSortChange = (sortValue: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('sort', sortValue);
      return next;
    });
  };

  const handlePageChange = (pageValue: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(pageValue));
      return next;
    });
  };

  const handleApprovedToggle = (approvedValue: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('approved', approvedValue);
      next.set('page', '1');
      if (approvedValue === 'true') {
        next.delete('status');
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    const next = new URLSearchParams();
    if (currentApproved === 'true') {
      next.set('approved', 'true');
    }
    setSearchParams(next);
    setSearchTerm('');
  };

  const hasActiveFilters = !!(
    currentSearch ||
    (currentApproved !== 'true' && currentStatus) ||
    currentPriority ||
    (isAdmin && currentAssignedTo) ||
    currentSort !== '-createdAt'
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Upper header action area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-main leading-tight">Tasks Workspace</h1>
          <p className="text-xs text-text-muted mt-1 font-semibold">
            Manage, filter, and track collaborate workloads.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto select-none">
          <TaskViewToggle view={view} onViewChange={handleViewChange} />
          {isAdmin && (
            <Button
              className="flex items-center gap-1.5"
              onClick={() => setIsCreateModalOpen(true)}
              id="create-task-btn"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Create Task</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs for In-Progress vs Approved Tasks */}
      <div className="flex border-b border-border-color/60 select-none">
        <button
          onClick={() => handleApprovedToggle('false')}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all duration-200 cursor-pointer ${
            currentApproved !== 'true'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          In-Progress Tasks
        </button>
        <button
          onClick={() => handleApprovedToggle('true')}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all duration-200 cursor-pointer ${
            currentApproved === 'true'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          Approved Tasks
        </button>
      </div>

      {/* Task Filters component */}
      <TaskFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        status={currentStatus}
        onStatusChange={handleStatusChange}
        priority={currentPriority}
        onPriorityChange={handlePriorityChange}
        sort={currentSort}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        showAssigneeFilter={isAdmin}
        assignedTo={currentAssignedTo}
        onAssignedToChange={handleAssignedToChange}
        hideStatusFilter={currentApproved === 'true'}
      />

      {/* Content Area */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="p-6 bg-danger/10 border border-danger/25 text-danger rounded-2xl flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10 shrink-0" />
          <div>
            <h3 className="font-bold text-base">Failed to load tasks</h3>
            <p className="text-xs mt-1 font-semibold">
              {(error as any)?.response?.data?.message || 'A network error occurred. Please try again.'}
            </p>
          </div>
          <Button variant="danger" onClick={() => refetch()} className="text-xs py-1.5 px-4 font-bold">
            Retry
          </Button>
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description={
            hasActiveFilters
              ? "No tasks match your active filters. Try clearing some criteria."
              : "No tasks have been created or assigned in this workspace yet."
          }
          action={
            hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs font-bold py-2 px-4"
                id="empty-state-reset-btn"
              >
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          sort={currentSort}
          onSortChange={handleSortChange}
          showCreatedBy={isAdmin}
          showAssignedTo={isAdmin}
          showApprovedBy={currentApproved === 'true'}
        />
      )}

      {/* Reusable Pagination component */}
      {!isLoading && !isError && (
        <Pagination
          currentPage={currentPage}
          totalPages={meta.pages}
          totalItems={meta.total}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* Creation Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreateModalOpen(false)}
          isSubmitting={isCreating}
        />
      </Modal>
    </div>
  );
};

export default Tasks;
