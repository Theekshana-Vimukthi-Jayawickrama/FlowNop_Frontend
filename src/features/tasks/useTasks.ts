import { useQuery } from '@tanstack/react-query';
import { getTasks } from '../../api/tasks';
import type { IGetTasksParams } from '../../types/task';

export const useTasks = (params: IGetTasksParams) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => getTasks(params),
  });
};

export default useTasks;
