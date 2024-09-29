import { json, type ActionFunctionArgs } from '@remix-run/node';

import { userApi, type UserPayload } from '~/entities/user';
import {
  DELETE_AVATAR_ACTION,
  UPLOAD_AVATAR_ACTION,
} from '~/features/user/upload-avatar';
import {
  uploadAvatarAction,
  deleteAvatarAction,
  type UploadAvatarParsedFormData,
  type DeleteAvatarParsedFormData,
} from '~/features/user/upload-avatar/server';
import type { ServerActionReturn } from '~/shared/api';
import { logout } from '~/shared/api/server';
import { getCookie, getSetCookie, parseRequestFormData } from '~/shared/lib';
import {
  handleRequestError,
  requireAuthRequest,
} from '~/shared/lib/server-only';

type ActionFormData =
  | (UserPayload & { _action: 'updateUser' })
  | { _action: 'deleteUser' }
  | UploadAvatarParsedFormData
  | DeleteAvatarParsedFormData;

export default async function action({ request }: ActionFunctionArgs) {
  requireAuthRequest(request);

  try {
    const formData = await parseRequestFormData<ActionFormData>(request);
    const cookie = getCookie(request);

    switch (formData._action) {
      case 'updateUser': {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _action, ...payload } = formData;
        const { result, response } = await userApi.services.updateCurrentUser(
          payload,
          {
            fetchOpts: {
              headers: { Cookie: cookie },
            },
          },
        );

        return json(
          { ...result, _action: 'updateUser', _count: null },
          {
            headers: {
              'Set-Cookie': getSetCookie(response),
            },
          },
        ) satisfies ServerActionReturn;
      }
      case 'deleteUser': {
        const { result, response } = await userApi.services.deleteCurrentUser({
          fetchOpts: {
            headers: { Cookie: cookie },
          },
        });

        if (result.data) {
          logout(request);

          break;
        } else {
          return json(
            {
              data: null,
              error: result.error,
              errors: result.errors,
              _action: 'deleteUser',
              _count: null,
            },
            {
              headers: {
                'Set-Cookie': getSetCookie(response),
              },
            },
          ) satisfies ServerActionReturn;
        }
      }
      case UPLOAD_AVATAR_ACTION: {
        const { data, setCookie } = await uploadAvatarAction(formData, request);

        return json(data, {
          headers: {
            'Set-Cookie': setCookie,
          },
        }) satisfies ServerActionReturn;
      }
      case DELETE_AVATAR_ACTION: {
        const { data, setCookie } = await deleteAvatarAction(formData, request);

        return json(data, {
          headers: {
            'Set-Cookie': setCookie,
          },
        }) satisfies ServerActionReturn;
      }
      default:
        throw new Error('Undefined action');
    }
  } catch (err) {
    return handleRequestError(err, request);
  }
}
