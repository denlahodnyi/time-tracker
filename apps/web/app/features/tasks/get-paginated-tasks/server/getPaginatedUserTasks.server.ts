import { taskApi } from '~/entities/task';
import { tasksLoadCounterCookie } from '~/shared/api/server';
import { getCookie, getSetCookie } from '~/shared/lib';

export async function getPaginatedUserTasks(
  req: Request,
  payload: Parameters<typeof taskApi.services.getMyTasks>[0],
) {
  const cookies = getCookie(req);
  const { result, response } = await taskApi.services.getMyTasks(payload, {
    fetchOpts: {
      headers: { Cookie: cookies },
    },
  });

  const counterCookie = await tasksLoadCounterCookie.parse(cookies);
  const _count = typeof counterCookie === 'number' ? counterCookie + 1 : 1;

  return {
    data: {
      data: payload.cursor
        ? {
            isInitial: false as const,
            tasks: result.data.tasks,
            pagination: result.data.pagination,
            activeTask: null,
            initialPage: null,
            initialCursors: [] as number[],
          }
        : {
            isInitial: true as const,
            tasks: null,
            pagination: null,
            activeTask: result.data.activeTask,
            initialPage: {
              tasks: result.data.tasks,
              pagination: result.data.pagination,
            },
            initialCursors: [] as number[],
          },
      _count,
      error: null,
      errors: null,
    },
    setCookie:
      getSetCookie(response) + (await tasksLoadCounterCookie.serialize(_count)),
  };
}
