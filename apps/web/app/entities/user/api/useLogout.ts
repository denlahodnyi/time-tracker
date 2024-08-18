import { useFetcher, useNavigation } from '@remix-run/react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

const FETCHER_KEY = 'logout-fetcher';

// TODO: seems like it should go to shared

export default function useLogout() {
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const nextPathname = navigation.location?.pathname;
  const logoutFetcher = useFetcher({ key: FETCHER_KEY });
  const idle = logoutFetcher.state === 'idle';
  const isProcessing = !idle || nextPathname === '/login';

  const logout = useCallback(
    function logoutCallback() {
      logoutFetcher.submit(
        { _action: 'logout' },
        { action: '/', method: 'POST' },
      );

      setTimeout(function logoutQueryClear() {
        queryClient.clear();
      }, 200);
    },
    [logoutFetcher, queryClient],
  );

  return {
    logout,
    fetcherKey: FETCHER_KEY,
    fetcher: logoutFetcher,
    isProcessing,
  };
}
