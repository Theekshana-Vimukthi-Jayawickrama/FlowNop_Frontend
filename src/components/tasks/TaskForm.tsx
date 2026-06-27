import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import AssigneeSelect from './AssigneeSelect';
import SubAssigneeSelect from './SubAssigneeSelect';
import type { ITask } from '../../types/task';
import { useAuth } from '../../context/AuthContext';

const taskSchema = z.object({
  title: z.string()
    .min(3, 'Title must be between 3 and 120 characters')
    .max(120, 'Title must be between 3 and 120 characters'),
  description: z.string().max(2000, 'Description must not exceed 2000 characters').optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['open', 'in_progress', 'testing', 'done']),
  dueDate: z.string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val) return true;
        const parts = val.split('-');
        if (parts.length !== 3) return false;
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const inputDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return inputDate >= today;
      },
      { message: 'Due date must not be in the past' }
    ),
  assignedTo: z.string().optional().or(z.literal('')),
  subAssignedTo: z.array(z.string()).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  initialData?: ITask;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { user } = useAuth();
  
  // Format ISO date (YYYY-MM-DDTHH:mm:ss.sssZ) to YYYY-MM-DD for HTML input
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const defaultValues: TaskFormValues = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    status: initialData?.status || 'open',
    dueDate: formatDate(initialData?.dueDate),
    assignedTo: initialData?.assignedTo?._id || (!user?.role || user.role !== 'admin' ? user?._id : '') || '',
    subAssignedTo: initialData?.subAssignedTo?.map((u) => u._id) || [],
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  const isFormDisabled = isSubmitting;
  const watchedAssignedTo = watch('assignedTo');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-left">
      <Input
        label="Title"
        placeholder="Enter task title"
        error={errors.title?.message}
        disabled={isFormDisabled}
        {...register('title')}
      />

      <Textarea
        label="Description (Optional)"
        placeholder="Provide a detailed description of the task..."
        error={errors.description?.message}
        disabled={isFormDisabled}
        {...register('description')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Priority"
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          error={errors.priority?.message}
          disabled={isFormDisabled}
          {...register('priority')}
        />

        <Select
          label="Status"
          options={[
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'testing', label: 'Testing' },
            { value: 'done', label: 'Done' },
          ]}
          error={errors.status?.message}
          disabled={isFormDisabled}
          {...register('status')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Due Date (Optional)"
          type="date"
          error={errors.dueDate?.message}
          disabled={isFormDisabled}
          {...register('dueDate')}
        />

        <Controller
          name="assignedTo"
          control={control}
          render={({ field }) => (
            <AssigneeSelect
              value={field.value || ''}
              onChange={field.onChange}
              error={errors.assignedTo?.message}
              disabled={isFormDisabled}
            />
          )}
        />
      </div>

      {/* Sub-Assigned Users — only visible to admins */}
      <Controller
        name="subAssignedTo"
        control={control}
        render={({ field }) => (
          <SubAssigneeSelect
            value={field.value || []}
            onChange={field.onChange}
            error={errors.subAssignedTo?.message}
            disabled={isFormDisabled}
            excludeId={watchedAssignedTo || undefined}
          />
        )}
      />

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-color/60">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isFormDisabled}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
