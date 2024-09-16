import type { SerializeFrom } from '@remix-run/node';
import { useEffect } from 'react';

import { useEnhancedFetcher } from '~/shared/lib';
import type loader from './loader.server';

export interface PageFetcherSuccess
  extends Extract<SerializeFrom<typeof loader>['data'], { isInitial: true }> {}

export default function PageFetcher({
  cursor,
  onSuccess,
}: {
  cursor: number;
  onSuccess: (d: PageFetcherSuccess) => void;
}) {
  const fetcher = useEnhancedFetcher<typeof loader>({
    key: cursor.toString(),
    checkSuccess: (data) => Boolean(data.data.tasks),
    onSuccess: (data) => {
      onSuccess(data.data as PageFetcherSuccess);
    },
  });

  const fetcherLoad = fetcher.load;

  useEffect(() => {
    fetcherLoad(`/?index&cursor=${cursor}`);
  }, [cursor, fetcherLoad]);

  return null;
}
