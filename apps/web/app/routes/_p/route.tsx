import { Outlet, useLoaderData } from '@remix-run/react';
import { HydrationBoundary } from '@tanstack/react-query';
import { useMemo } from 'react';

import loader from './loader.server';
import shouldRevalidate from './shouldRevalidate';

export { loader, shouldRevalidate };

export default function ProtectedLayout() {
  const loaderData = useLoaderData<typeof loader>();
  const dehydratedState = useMemo(
    () => loaderData.dehydratedState,
    [loaderData.dehydratedState],
  );

  return (
    <HydrationBoundary state={dehydratedState}>
      <Outlet />
    </HydrationBoundary>
  );
}
