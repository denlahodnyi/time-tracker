import { useFetcher, useNavigation } from '@remix-run/react';
import { useCallback } from 'react';

const FETCHER_KEY = 'logout-fetcher';

export default function useLogout() {
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
    },
    [logoutFetcher],
  );

  return {
    logout,
    fetcherKey: FETCHER_KEY,
    fetcher: logoutFetcher,
    isProcessing,
  };
}
