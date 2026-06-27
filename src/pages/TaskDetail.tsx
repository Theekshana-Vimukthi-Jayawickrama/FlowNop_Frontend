import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, User, Clock, Check, Users, History } from 'lucide-react';
import { useTask } from '../features/tasks/useTask';
import useUpdateTask from '../features/tasks/useUpdateTask';
import useDeleteTask from '../features/tasks/useDeleteTask';
import StatusBadge from '../components/tasks/StatusBadge';
import PriorityBadge from '../components/tasks/PriorityBadge';
import DueDate from '../components/tasks/DueDate';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import TaskForm from '../components/tasks/TaskForm';
import Select from '../components/ui/Select';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useQueryClient } from '@tanstack/react-query';
import { approveTask } from '../api/tasks';

// Sub-component: Meta Detail Item Row
interface DetailMetaItemProps {
  label: string;
  icon: React.ReactNode;
  value: React.ReactNode;
}

const DetailMetaItem: React.FC<DetailMetaItemProps> = ({ label, icon, value }) => (
  <div className="flex flex-col gap-1 p-3 rounded-xl bg-background/50 border border-border-color/60">
    <span className="text-[10px] uppercase font-bold text-text-muted select-none flex items-center gap-1.5">
      {icon}
      {label}
    </span>
    <div className="text-sm font-semibold text-text-main mt-0.5">{value}</div>
  </div>
);

// Status History Timeline Item
interface TimelineItemProps {
  status: string;
  changedBy: { name?: string; email?: string } | null;
  changedAt: string;
  isLast: boolean;
}

const statusLabels: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  testing: 'Testing',
  done: 'Done',
};

const statusColors: Record<string, string> = {
  open: 'bg-blue-500',
  in_progress: 'bg-amber-500',
  testing: 'bg-purple-500',
  done: 'bg-emerald-500',
};

const TimelineItem: React.FC<TimelineItemProps> = ({ status, changedBy, changedAt, isLast }) => {
  const formattedDate = new Date(changedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex gap-3">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-400'} shrink-0 mt-1 ring-4 ring-surface`} />
        {!isLast && (
          <div className="w-0.5 flex-1 bg-border-color/60 mt-1" />
        )}
      </div>

      {/* Content */}
      <div className={`pb-5 ${isLast ? 'pb-0' : ''}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-text-main">
            {statusLabels[status] || status}
          </span>
          <span className="text-[10px] text-text-muted font-semibold bg-background/50 border border-border-color/60 px-2 py-0.5 rounded-full">
            {formattedDate}
          </span>
        </div>
        <p className="text-xs text-text-muted mt-0.5 font-semibold">
          Changed by <span className="text-text-main">{changedBy?.name || 'Unknown'}</span>
        </p>
      </div>
    </div>
  );
};

// Sub-component: Status Update Form for Assignees
interface StatusUpdateFormProps {
  initialStatus: string;
  onSubmit: (status: string) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const StatusUpdateForm: React.FC<StatusUpdateFormProps> = ({
  initialStatus,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [status, setStatus] = useState(initialStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(status);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={[
          { value: 'open', label: 'Open' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'testing', label: 'Testing' },
          { value: 'done', label: 'Done' },
        ]}
        disabled={isSubmitting}
      />

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-color/60">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
        >
          Update Status
        </Button>
      </div>
    </form>
  );
};

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useTask(id || '');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const { mutateAsync: updateTask, isPending: isUpdating } = useUpdateTask();
  const { mutateAsync: deleteTask, isPending: isDeleting } = useDeleteTask();

  const handleUpdateTask = async (values: any) => {
    try {
      if (id) {
        await updateTask({ id, data: values });
        setIsEditModalOpen(false);
      }
    } catch {
      // toast notification already fired by mutation
    }
  };

  const handleUpdateStatus = async (status: any) => {
    try {
      if (id) {
        await updateTask({ id, data: { status } });
        setIsStatusModalOpen(false);
      }
    } catch {
      // toast notification already fired by mutation
    }
  };

  const handleDeleteTask = async () => {
    try {
      if (id) {
        await deleteTask(id);
        setIsDeleteDialogOpen(false);
        navigate('/tasks');
      }
    } catch {
      // toast notification already fired by mutation
    }
  };

  const handleApproveTask = async () => {
    if (!id) return;
    setIsApproving(true);
    try {
      await approveTask(id);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      toastSuccess('Task approved successfully');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to approve task';
      toastError(msg);
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data?.success) {
    const errorMsg = (error as any)?.response?.data?.message || 'Failed to retrieve task details.';
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 bg-surface border border-border-color rounded-2xl max-w-md mx-auto shadow-sm">
        <h2 className="text-lg font-bold text-danger mb-2">Error Loading Task</h2>
        <p className="text-sm text-text-muted mb-6">{errorMsg}</p>
        <Button onClick={() => navigate('/tasks')} variant="outline">
          Back to Tasks
        </Button>
      </div>
    );
  }

  const task = data.data;

  const createdDate = new Date(task.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isAdmin = user?.role === 'admin';
  const isCreator = task.createdBy?._id === user?._id;
  const isAssignee = task.assignedTo?._id === user?._id;
  const isSubAssignee = task.subAssignedTo?.some((u) => u._id === user?._id);

  // Only the admin/super admin who created the task can approve it
  const showApproveButton = isAdmin && isCreator && task.status === 'done' && !task.approved;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Back Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text-main transition-colors duration-200 select-none"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to Dashboard</span>
        </Link>

        <span className="text-xs text-text-muted font-semibold bg-surface border border-border-color/80 px-3 py-1 rounded-full">
          Task ID: {task._id}
        </span>
      </div>

      {/* Complete/Approval Status Alert Banners */}
      {task.status === 'done' && !task.approved && (
        <div className="p-4 bg-warning/10 border border-warning/25 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-warning">Task Completed & Awaiting Approval</h4>
            <p className="text-xs text-text-muted mt-0.5">
              {isAdmin && isCreator
                ? 'Review the task outcomes below and approve it to finalize the task cycle.'
                : 'Your work has been submitted. The administrator who created this task will review and approve it.'}
            </p>
          </div>
          {showApproveButton && (
            <Button
              onClick={handleApproveTask}
              isLoading={isApproving}
              className="flex items-center gap-1.5 self-start sm:self-auto bg-warning hover:bg-warning-dark border-transparent font-bold text-xs shrink-0"
              id="approve-task-btn"
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>Approve Task</span>
            </Button>
          )}
        </div>
      )}

      {task.approved && (
        <div className="p-4 bg-success/10 border border-success/25 rounded-2xl">
          <h4 className="text-sm font-bold text-success">Task Reviewed & Approved</h4>
          <p className="text-xs text-text-muted mt-0.5">
            This task was approved by admin <span className="font-bold text-text-main">{task.approvedByAdmin || 'System'}</span>. It is marked as final.
          </p>
        </div>
      )}

      {/* Main Detail Card */}
      <Card className="shadow-lg border-border-color p-6 md:p-8">
        {/* Badges and date */}
        <div className="flex flex-wrap items-center gap-3 mb-6 select-none">
          <StatusBadge status={task.status} className="px-3 py-1 text-xs" />
          <PriorityBadge priority={task.priority} className="px-3 py-1 text-xs" />
          <DueDate date={task.dueDate} status={task.status} className="px-3 py-1 text-xs font-bold bg-background/50 border border-border-color/60 rounded-xl" />
          {task.approved && (
            <span className="px-3 py-1 text-xs font-bold bg-success/15 border border-success/25 text-success rounded-full uppercase tracking-wider">
              Approved
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-black text-text-main mb-4 leading-tight">
          {task.title}
        </h1>

        {/* Info Grid (Assignee, Sub-Assignees, Creator, Dates) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <DetailMetaItem
            label="Assigned To"
            icon={<User className="w-3.5 h-3.5" />}
            value={task.assignedTo ? task.assignedTo.name : 'Unassigned'}
          />
          <DetailMetaItem
            label="Created By"
            icon={<User className="w-3.5 h-3.5" />}
            value={task.createdBy ? task.createdBy.name : 'System'}
          />
          <DetailMetaItem
            label="Created At"
            icon={<Clock className="w-3.5 h-3.5" />}
            value={createdDate}
          />
          {task.approved && (
            <DetailMetaItem
              label="Approved By"
              icon={<User className="w-3.5 h-3.5" />}
              value={task.approvedByAdmin || 'System'}
            />
          )}
        </div>

        {/* Sub-Assigned Users */}
        {task.subAssignedTo && task.subAssignedTo.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted select-none mb-3 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Sub-Assigned Users
            </h3>
            <div className="flex flex-wrap gap-2">
              {task.subAssignedTo.map((u) => (
                <span
                  key={u._id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/15 rounded-full text-xs font-semibold"
                >
                  <User className="w-3 h-3 shrink-0" />
                  <span>{u.name}</span>
                  <span className="text-primary/60">({u.email})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted select-none mb-3">
            Description
          </h3>
          <div className="p-4 rounded-2xl bg-background/40 border border-border-color/50 text-text-main text-sm leading-relaxed whitespace-pre-wrap min-h-[120px]">
            {task.description || (
              <span className="italic text-text-muted/60">No details or description provided for this task.</span>
            )}
          </div>
        </div>

        {/* Status History Timeline */}
        {task.statusHistory && task.statusHistory.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted select-none mb-4 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Status History
            </h3>
            <div className="p-4 rounded-2xl bg-background/40 border border-border-color/50">
              {task.statusHistory.map((entry, index) => (
                <TimelineItem
                  key={index}
                  status={entry.status}
                  changedBy={entry.changedBy}
                  changedAt={entry.changedAt}
                  isLast={index === task.statusHistory.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions bar */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-border-color/70">
          {isAdmin && isCreator && (
            <Button
              variant="outline"
              className="flex items-center gap-1.5"
              onClick={() => setIsEditModalOpen(true)}
              id="edit-task-btn"
            >
              <Edit2 className="w-4 h-4 shrink-0" />
              <span>Edit Task</span>
            </Button>
          )}
          {!isCreator && (isAssignee || isSubAssignee) && (
            <Button
              variant="outline"
              className="flex items-center gap-1.5"
              onClick={() => setIsStatusModalOpen(true)}
              id="update-status-btn"
            >
              <Edit2 className="w-4 h-4 shrink-0" />
              <span>Update Status</span>
            </Button>
          )}
          {(isAdmin || isCreator) && (
            <Button
              variant="danger"
              className="flex items-center gap-1.5"
              onClick={() => setIsDeleteDialogOpen(true)}
              id="delete-task-btn"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Delete Task</span>
            </Button>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task"
      >
        <TaskForm
          initialData={task}
          onSubmit={handleUpdateTask}
          onCancel={() => setIsEditModalOpen(false)}
          isSubmitting={isUpdating}
        />
      </Modal>

      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Status"
      >
        <StatusUpdateForm
          initialStatus={task.status}
          onSubmit={handleUpdateStatus}
          onCancel={() => setIsStatusModalOpen(false)}
          isSubmitting={isUpdating}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete task "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isConfirming={isDeleting}
      />
    </div>
  );
};

export default TaskDetail;
