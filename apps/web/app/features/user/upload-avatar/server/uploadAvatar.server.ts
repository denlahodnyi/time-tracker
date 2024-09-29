import { userApi, type AvatarUploadPayload } from '~/entities/user';
import type { ServerActionHandlerReturn } from '~/shared/api';
import { avatarUploadCounterCookie } from '~/shared/api/server';
import { getCookie, getSetCookie } from '~/shared/lib';
import { UPLOAD_AVATAR_ACTION } from '../lib';

export interface UploadAvatarParsedFormData extends AvatarUploadPayload {
  _action: typeof UPLOAD_AVATAR_ACTION;
}

export async function uploadAvatarAction(
  parsedFormData: UploadAvatarParsedFormData,
  req: Request,
) {
  const { _action, ...payload } = parsedFormData;
  const cookie = getCookie(req);
  const { result, response } = await userApi.services.uploadAvatar(payload, {
    fetchOpts: {
      headers: { Cookie: cookie },
    },
  });

  const counterCookie = await avatarUploadCounterCookie.parse(cookie);
  const _count = typeof counterCookie === 'number' ? counterCookie + 1 : 1;

  return {
    data: { ...result, _action, _count },
    setCookie:
      getSetCookie(response) +
      (await avatarUploadCounterCookie.serialize(_count)),
  } satisfies ServerActionHandlerReturn;
}
