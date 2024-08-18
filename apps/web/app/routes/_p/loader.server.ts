import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { dehydrate, QueryClient } from '@tanstack/react-query';

import { taskApi } from '~/entities/task';
import { userApi } from '~/entities/user';
import {
  handleCatchResponseError,
  requireAuthRequest,
} from '~/shared/server-side';

export default async function loader({ request }: LoaderFunctionArgs) {
  console.log('_P LOADER');
  requireAuthRequest(request);

  const queryClient = new QueryClient();
  const cookieHeader = request.headers.get('Cookie') || '';

  try {
    await queryClient.fetchQuery({
      staleTime: 60 * 1000 * 30, // 30 min
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: userApi.queries.users.me.queryKey,
      queryFn: async () => {
        return (
          await userApi.services.getCurrentUser({
            fetchOpts: {
              headers: { Cookie: cookieHeader },
            },
          })
        ).user;
      },
    });
    await queryClient.fetchInfiniteQuery({
      staleTime: 60 * 1000 * 10, // 10 min
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: taskApi.queries.tasks.myAll.queryKey,
      queryFn: async ({ pageParam }) => {
        const { activeTask, tasks, pagination } =
          await taskApi.services.getMyTasks(
            {
              cursor: pageParam,
            },
            {
              fetchOpts: {
                headers: { Cookie: cookieHeader },
              },
            },
          );

        console.log(`🚀 -> queryFn: -> activeTask:`, activeTask);
        queryClient.setQueryData(
          taskApi.queries.tasks.myActive.queryKey,
          activeTask,
        );

        return { tasks, pagination };
      },
      initialPageParam: 0,
    });

    return json({ dehydratedState: dehydrate(queryClient) });
  } catch (err) {
    handleCatchResponseError(err, { shouldThrowError: true });
  }
}
