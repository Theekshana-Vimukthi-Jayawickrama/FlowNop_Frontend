import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask } from '../../api/tasks';
import { useToast } from '../../context/ToastContext';
import type { ICreateTaskInput } from '../../types/task';

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: ICreateTaskInput) => createTask(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      success(response.message || 'Task created successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create task';
      error(msg);
    },
  });
};

export default useCreateTask;
