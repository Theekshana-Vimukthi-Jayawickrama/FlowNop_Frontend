import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../api/users';

export const useUsers = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    ...options,
  });
};

export default useUsers;
