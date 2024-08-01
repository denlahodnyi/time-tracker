import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { dehydrate, QueryClient } from '@tanstack/react-query';

import { userApi } from '~/entities/user';
import {
  handleCatchResponseError,
  requireAuthRequest,
} from '~/shared/server-side';

export default async function loader({ request }: LoaderFunctionArgs) {
  requireAuthRequest(request);

  const queryClient = new QueryClient();

  try {
    await queryClient.fetchQuery({
      staleTime: 60 * 1000 * 15, // 15 min
      queryKey: userApi.queries.users.me.queryKey,
      queryFn: async () => {
        return (
          await userApi.services.getCurrentUser({
            fetchOpts: {
              headers: { Cookie: request.headers.get('Cookie') || '' },
            },
          })
        ).user;
      },
    });

    return json({ dehydratedState: dehydrate(queryClient) });
  } catch (err) {
    handleCatchResponseError(err, { shouldThrowError: true });
  }
}
