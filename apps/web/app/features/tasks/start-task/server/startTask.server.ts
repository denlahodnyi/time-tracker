import { MyTaskStartPayload, taskApi } from '~/entities/task';
import { startTaskCountCookie } from '~/shared/api/server';
import { getCookie, getSetCookie } from '~/shared/lib';
import { START_TASK_ACTION } from '../lib';

export interface StartTaskParsedFormData extends MyTaskStartPayload {
  _action: typeof START_TASK_ACTION;
}

export async function startTask(
  parsedFormData: StartTaskParsedFormData,
  req: Request,
) {
  const { _action, ...payload } = parsedFormData;
  const cookie = getCookie(req);
  const { result, response } = await taskApi.services.startMyTask(payload, {
    fetchOpts: {
      headers: { Cookie: cookie },
    },
  });

  const counterCookie = await startTaskCountCookie.parse(cookie);
  const _count = typeof counterCookie === 'number' ? counterCookie + 1 : 1;

  return {
    data: { ...result, _action, _count },
    setCookie:
      getSetCookie(response) + (await startTaskCountCookie.serialize(_count)),
  };
}
