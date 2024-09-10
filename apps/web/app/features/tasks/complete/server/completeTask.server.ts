import { taskApi } from '~/entities/task';
import { taskCompleteCounterCookie } from '~/shared/api/server';
import { getCookie, getSetCookie } from '~/shared/lib';
import { COMPLETE_TASK_ACTION } from '../lib';

export interface CompleteMyTaskParsedFormData {
  _action: typeof COMPLETE_TASK_ACTION;
  taskId: number;
  completedAt: Date;
}

export async function completeTask(
  parsedFormData: CompleteMyTaskParsedFormData,
  req: Request,
) {
  const { _action, ...payload } = parsedFormData;
  const cookies = getCookie(req);
  const { result, response } = await taskApi.services.completeTask(payload, {
    fetchOpts: {
      headers: { Cookie: cookies },
    },
  });

  const cookie = await taskCompleteCounterCookie.parse(cookies);
  const _count = typeof cookie === 'number' ? cookie + 1 : 1;

  return {
    data: { ...result, _action, _count },
    setCookie:
      getSetCookie(response) +
      (await taskCompleteCounterCookie.serialize(_count)),
  };
}
