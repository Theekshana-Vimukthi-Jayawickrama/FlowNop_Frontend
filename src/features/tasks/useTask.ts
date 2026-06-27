import { useQuery } from '@tanstack/react-query';
import { getTask } from '../../api/tasks';

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => getTask(id),
    enabled: !!id,
  });
};

export default useTask;
