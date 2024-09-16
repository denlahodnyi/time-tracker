import { taskApi } from '~/entities/task';
import type { ServerLoaderHandlerReturn } from '~/shared/api';
import { getCookie, getSetCookie } from '~/shared/lib';

export async function getAnalytics(req: Request) {
  const { result, response } = await taskApi.services.getMyAnalytics({
    fetchOpts: {
      headers: {
        Cookie: getCookie(req),
      },
    },
  });

  return {
    data: result,
    setCookie: getSetCookie(response),
  } satisfies ServerLoaderHandlerReturn;
}
