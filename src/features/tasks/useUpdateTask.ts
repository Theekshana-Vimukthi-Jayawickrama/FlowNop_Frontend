import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask } from '../../api/tasks';
import { useToast } from '../../context/ToastContext';
import type { IUpdateTaskInput } from '../../types/task';

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateTaskInput }) => updateTask(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      success(response.message || 'Task updated successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update task';
      error(msg);
    },
  });
};

export default useUpdateTask;
