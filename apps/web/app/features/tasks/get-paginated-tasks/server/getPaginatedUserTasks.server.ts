import { taskApi } from '~/entities/task';
import { tasksLoadCounterCookie } from '~/shared/api/server';
import { getCookie, getSetCookie } from '~/shared/lib';

export async function getPaginatedUserTasks(
  req: Request,
  cursor: number | null,
) {
  const cookies = getCookie(req);
  const { result, response } = await taskApi.services.getMyTasks(
    { cursor: cursor },
    {
      fetchOpts: {
        headers: {
          Cookie: cookies,
        },
      },
    },
  );

  const counterCookie = await tasksLoadCounterCookie.parse(cookies);
  const _count = typeof counterCookie === 'number' ? counterCookie + 1 : 1;

  return {
    data: cursor
      ? {
          isInitial: false as const,
          tasks: result.tasks,
          pagination: result.pagination,
          activeTask: null,
          initialPage: null,
          initialCursors: [] as number[],
          _count,
        }
      : {
          isInitial: true as const,
          tasks: null,
          pagination: null,
          activeTask: result.activeTask,
          initialPage: { tasks: result.tasks, pagination: result.pagination },
          initialCursors: [] as number[],
          _count,
        },
    setCookie:
      getSetCookie(response) + (await tasksLoadCounterCookie.serialize(_count)),
  };
}