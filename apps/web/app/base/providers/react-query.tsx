import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

function ReactQueryProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000 * 15, // 15 min
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}

export { ReactQueryProvider };
