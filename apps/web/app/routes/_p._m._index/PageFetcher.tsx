import type { SerializeFrom } from '@remix-run/node';
import { useEffect } from 'react';

import { useEnhancedFetcher } from '~/shared/lib';
import type loader from './loader.server';
import type { clientLoader } from './route';

type Loader = typeof loader & typeof clientLoader;

export interface PageFetcherSuccess
  extends Extract<SerializeFrom<Loader>['data'], { isInitial: true }> {}

export default function PageFetcher({
  cursor,
  onSuccess,
}: {
  cursor: number;
  onSuccess: (d: PageFetcherSuccess) => void;
}) {
  const fetcher = useEnhancedFetcher<Loader>({
    key: cursor.toString(),
    checkSuccess: (data) => Boolean(data.data?.tasks),
    getSuccessDataCount: (data) => data._count,
    onSuccess: (data) => onSuccess(data.data as PageFetcherSuccess),
  });

  const fetcherLoad = fetcher.load;

  useEffect(() => {
    fetcherLoad(`/?index&cursor=${cursor}`);
  }, [cursor, fetcherLoad]);

  return null;
}
