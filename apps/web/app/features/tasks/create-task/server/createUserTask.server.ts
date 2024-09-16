import { MyTaskCreatePayload, taskApi } from '~/entities/task';
import type { ServerActionHandlerReturn } from '~/shared/api';
import { createTaskCountCookie } from '~/shared/api/server';
import { getCookie, getSetCookie } from '~/shared/lib';
import { CREATE_TASK_ACTION, START_NEW_TASK_ACTION } from '../lib';

export interface NewTaskParsedFormData extends MyTaskCreatePayload {
  _action: typeof START_NEW_TASK_ACTION | typeof CREATE_TASK_ACTION;
}

export async function createUserTask(
  parsedFormData: NewTaskParsedFormData,
  req: Request,
) {
  const { _action, ...payload } = parsedFormData;
  const cookie = getCookie(req);
  const { result, response } = await taskApi.services.postMyTask(payload, {
    fetchOpts: {
      headers: { Cookie: cookie },
    },
  });

  const counterCookie = await createTaskCountCookie.parse(cookie);
  const _count = typeof counterCookie === 'number' ? counterCookie + 1 : 1;
  const data = { ...result, _action, _count };

  return {
    data,
    setCookie:
      getSetCookie(response) + (await createTaskCountCookie.serialize(_count)),
  } satisfies ServerActionHandlerReturn;
}
