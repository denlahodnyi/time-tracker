import { useQuery } from '@tanstack/react-query';

import { apiClient } from '~/shared/api';
import queries from './queries';
import { UserService } from './services';
import useLogout from '../../../shared/api/useLogout';

const services = new UserService(apiClient);

export default function useCurrentUser() {
  const { logout, isProcessing: isLogoutInProcess } = useLogout();

  return useQuery({
    enabled: !isLogoutInProcess,
    queryKey: queries.users.me.queryKey,
    queryFn: async () => {
      return (await services.getCurrentUser({ onAuthError: () => logout() }))
        .user;
    },
  });
}
