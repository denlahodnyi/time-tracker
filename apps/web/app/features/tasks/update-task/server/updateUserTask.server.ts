import { MyTaskUpdatePayload, taskApi } from '~/entities/task';
import { taskUpdateCounterCookie } from '~/shared/api/server';
import { getCookie, getSetCookie } from '~/shared/lib';
import { UPDATE_TASK_ACTION } from '../lib';

export interface UpdateMyTaskParsedFormData extends MyTaskUpdatePayload {
  _action: typeof UPDATE_TASK_ACTION;
}

export async function updateUserTask(
  parsedFormData: UpdateMyTaskParsedFormData,
  req: Request,
) {
  const { _action, ...payload } = parsedFormData;
  const cookies = getCookie(req);
  const { result, response } = await taskApi.services.updateMyTask(payload, {
    fetchOpts: {
      headers: { Cookie: cookies },
    },
  });
  const counterCookie = await taskUpdateCounterCookie.parse(cookies);
  const _count = typeof counterCookie === 'number' ? counterCookie + 1 : 1;

  return {
    data: { ...result, _action, _count },
    setCookie:
      getSetCookie(response) +
      (await taskUpdateCounterCookie.serialize(_count)),
  };
}
