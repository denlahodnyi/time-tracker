import { useRouteLoaderData } from '@remix-run/react';

import type loader from '~/routes/_p/loader.server';

export default function useProtectedLayerData() {
  const protectedLoaderData = useRouteLoaderData<typeof loader>('routes/_p');
  const { firstName = '', lastName = '' } =
    protectedLoaderData?.data?.user || {};
  const avatarFallback = `${firstName.at(0)}${lastName?.at(0) || ''}`;

  return {
    ...(protectedLoaderData?.data || {}),
    avatarFallback,
  };
}
