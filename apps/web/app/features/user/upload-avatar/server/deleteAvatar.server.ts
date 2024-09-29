import { userApi } from '~/entities/user';
import type { ServerActionHandlerReturn } from '~/shared/api';
import { avatarDeleteCounterCookie } from '~/shared/api/server';
import { getCookie, getSetCookie } from '~/shared/lib';
import { type DELETE_AVATAR_ACTION } from '../lib';

export interface DeleteAvatarParsedFormData {
  _action: typeof DELETE_AVATAR_ACTION;
}

export async function deleteAvatarAction(
  parsedFormData: DeleteAvatarParsedFormData,
  req: Request,
) {
  const { _action } = parsedFormData;
  const cookie = getCookie(req);
  const { result, response } = await userApi.services.deleteAvatar({
    fetchOpts: {
      headers: { Cookie: cookie },
    },
  });

  const counterCookie = await avatarDeleteCounterCookie.parse(cookie);
  const _count = typeof counterCookie === 'number' ? counterCookie + 1 : 1;

  return {
    data: { ...result, _action, _count },
    setCookie:
      getSetCookie(response) +
      (await avatarDeleteCounterCookie.serialize(_count)),
  } satisfies ServerActionHandlerReturn;
}
