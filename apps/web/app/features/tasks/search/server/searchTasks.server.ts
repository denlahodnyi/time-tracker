import { taskApi, type TasksFilterByUrlParam } from '~/entities/task';
import type { ServerActionHandlerReturn } from '~/shared/api';
import { TASKS_FILTER_URL_PARAM } from '~/shared/constants';
import { getCookie, getSetCookie } from '~/shared/lib';

export async function searchTasks(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskName = searchParams.get('name') ?? '';
  const filterBy =
    (searchParams.get(TASKS_FILTER_URL_PARAM) as TasksFilterByUrlParam) ||
    undefined;

  const { result, response } = await taskApi.services.searchByName(
    { name: encodeURIComponent(taskName), filterBy },
    {
      fetchOpts: {
        headers: { Cookie: getCookie(req) },
      },
    },
  );

  return {
    data: { ...result, _action: 'searchTasks' },
    setCookie: getSetCookie(response),
  } satisfies ServerActionHandlerReturn;
}
