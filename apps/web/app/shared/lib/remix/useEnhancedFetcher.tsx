import type { SerializeFrom } from '@remix-run/node';
import { useFetcher, type FetcherWithComponents } from '@remix-run/react';
import { useEffect, useState } from 'react';

export type FetcherWithComponentsReset<T> = FetcherWithComponents<
  SerializeFrom<T>
> & {
  reset: () => void;
};

type FetcherOptions<T> = Parameters<typeof useFetcher>[0] & {
  checkSuccess?: (fetcherData: NonNullable<SerializeFrom<T>>) => boolean;
  onSuccess?: (fetcherData: NonNullable<SerializeFrom<T>>) => void;
};

const getSuccessDataCount = (data?: object | null) => {
  if (data && '_count' in data) {
    return data._count as undefined | null | number;
  }

  return null;
};

export function useEnhancedFetcher<T>(
  opts: FetcherOptions<T>,
): FetcherWithComponentsReset<T> {
  const fetcher = useFetcher<T>(opts);
  const [data, setData] = useState(fetcher.data);
  // Counter is used to distinguish fetcher responses
  const [count, setCount] = useState<number>(() =>
    fetcher.data ? getSuccessDataCount(fetcher.data) ?? 0 : 0,
  );

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setData(fetcher.data);

      const _count = getSuccessDataCount(fetcher.data);

      if (_count != null && _count !== count) {
        setCount(_count);

        if (
          opts &&
          opts.checkSuccess &&
          opts.onSuccess &&
          opts.checkSuccess(fetcher.data)
        ) {
          opts.onSuccess(fetcher.data);
        }
      }
    }
  }, [fetcher.state, fetcher.data, count, opts]);

  return {
    ...fetcher,
    data,
    reset: () => setData(undefined),
  };
}
