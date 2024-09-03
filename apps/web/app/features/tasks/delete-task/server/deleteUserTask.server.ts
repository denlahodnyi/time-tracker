import { taskApi } from '~/entities/task';
import { taskDeleteCounterCookie } from '~/shared/api/server';
import { getCookie, getSetCookie } from '~/shared/lib';
import { DELETE_TASK_ACTION } from '../lib';

export interface DeleteMyTaskParsedFormData {
  _action: typeof DELETE_TASK_ACTION;
  taskId: number;
}

export async function deleteUserTask(
  parsedFormData: DeleteMyTaskParsedFormData,
  req: Request,
) {
  const { _action, ...payload } = parsedFormData;
  const cookies = getCookie(req);
  const { result, response } = await taskApi.services.deleteTask(payload, {
    fetchOpts: {
      headers: { Cookie: cookies },
    },
  });

  const cookie = await taskDeleteCounterCookie.parse(cookies);
  const _count = typeof cookie === 'number' ? cookie + 1 : 1;

  return {
    data: { ...result, _action, _count },
    setCookie:
      getSetCookie(response) +
      (await taskDeleteCounterCookie.serialize(_count)),
  };
}
