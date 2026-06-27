import { useQuery } from '@tanstack/react-query';
import { getAllTasks } from '../../api/tasks';
import type { IGetTasksParams } from '../../types/task';

export const useAllTasks = (params: IGetTasksParams) => {
  return useQuery({
    queryKey: ['allTasks', params],
    queryFn: () => getAllTasks(params),
  });
};

export default useAllTasks;
