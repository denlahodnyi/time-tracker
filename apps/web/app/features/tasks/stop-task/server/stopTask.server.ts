import { MyTaskStopPayload, taskApi } from '~/entities/task';
import { stopTaskCountCookie } from '~/shared/api/server';
import { getCookie, getSetCookie } from '~/shared/lib';
import { STOP_TASK_ACTION } from '../lib';

export interface StopTaskParsedFormData extends MyTaskStopPayload {
  _action: typeof STOP_TASK_ACTION;
}

export async function stopTask(
  parsedFormData: StopTaskParsedFormData,
  req: Request,
) {
  const { _action, ...payload } = parsedFormData;
  const cookie = getCookie(req);
  const { result, response } = await taskApi.services.stopMyTask(payload, {
    fetchOpts: {
      headers: { Cookie: cookie },
    },
  });

  const counterCookie = await stopTaskCountCookie.parse(cookie);
  const _count = typeof counterCookie === 'number' ? counterCookie + 1 : 1;

  return {
    data: { ...result, _action, _count },
    setCookie:
      getSetCookie(response) + (await stopTaskCountCookie.serialize(_count)),
  };
}
