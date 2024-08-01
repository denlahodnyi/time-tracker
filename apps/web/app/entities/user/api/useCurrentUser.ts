import { useQuery } from '@tanstack/react-query';

import queries from './queries';
import { services } from './services';
import useLogout from './useLogout';

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
