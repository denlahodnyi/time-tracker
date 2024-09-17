import type { SerializeFrom } from '@remix-run/node';
import { useFetcher, type FetcherWithComponents } from '@remix-run/react';
import { useEffect, useState } from 'react';

export type FetcherWithComponentsReset<T> = FetcherWithComponents<
  SerializeFrom<T>
> & {
  reset: () => void;
};

type RemixFetcherOpts = Parameters<typeof useFetcher>[0];
type FetcherOptions<T> = RemixFetcherOpts &
  (
    | {
        onSuccess: (fetcherData: NonNullable<SerializeFrom<T>>) => void;
        checkSuccess: (fetcherData: NonNullable<SerializeFrom<T>>) => boolean;
        getSuccessDataCount: (
          fetcherData: NonNullable<SerializeFrom<T>>,
        ) => number | null;
      }
    | {
        // All three must be used or none
        onSuccess?: null;
        checkSuccess?: null;
        getSuccessDataCount?: null;
      }
  );

// TODO: this how to enhance
export function useEnhancedFetcher<T>(
  opts: FetcherOptions<T>,
): FetcherWithComponentsReset<T> {
  const fetcher = useFetcher<T>(opts);
  const [data, setData] = useState(fetcher.data);
  // Counter is used to distinguish fetcher responses
  const [count, setCount] = useState<number>(() =>
    fetcher.data && opts.onSuccess && opts.getSuccessDataCount
      ? opts.getSuccessDataCount(fetcher.data) ?? 0
      : 0,
  );

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setData(fetcher.data);

      if (opts.onSuccess && opts.getSuccessDataCount) {
        const _count = opts.getSuccessDataCount(fetcher.data);

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
    }
  }, [fetcher.state, fetcher.data, count, opts]);

  return {
    ...fetcher,
    data,
    reset: () => setData(undefined),
  };
}
