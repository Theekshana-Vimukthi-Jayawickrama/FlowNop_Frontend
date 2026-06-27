import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTask } from '../../api/tasks';
import { useToast } from '../../context/ToastContext';

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      success('Task deleted successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete task';
      error(msg);
    },
  });
};

export default useDeleteTask;
