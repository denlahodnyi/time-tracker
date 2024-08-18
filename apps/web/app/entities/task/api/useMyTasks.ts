import { useInfiniteQuery } from '@tanstack/react-query';

import { useLogout } from '~/entities/user/api';
import { apiClient } from '~/shared/api';
import queries from './queries';
import { TaskService } from './services';

const services = new TaskService(apiClient);

function useMyTasks() {
  const { logout, isProcessing: isLogoutInProcess } = useLogout();

  return useInfiniteQuery({
    enabled: !isLogoutInProcess,
    queryKey: queries.tasks.myAll.queryKey,
    queryFn: async ({ pageParam }) => {
      const { tasks, pagination } = await services.getMyTasks(
        {
          cursor: pageParam,
        },
        {
          onAuthError: () => logout(),
        },
      );

      return { tasks, pagination };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
  });
}

export default useMyTasks;
