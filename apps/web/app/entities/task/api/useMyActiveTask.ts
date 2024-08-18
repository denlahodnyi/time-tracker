import { useQuery } from '@tanstack/react-query';

import { useLogout } from '~/entities/user/api';
import queries from './queries';
import { services } from './services';

function useMyActiveTask() {
  const { logout } = useLogout();

  return useQuery({
    queryKey: queries.tasks.myActive.queryKey,
    queryFn: async () => {
      // const {} = await services
    },
  });
}

export default useMyActiveTask;
