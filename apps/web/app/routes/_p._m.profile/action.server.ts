import { json, type ActionFunctionArgs } from '@remix-run/node';

import { userApi, type UserPayload } from '~/entities/user';
import type { ServerActionReturn } from '~/shared/api';
import { logout } from '~/shared/api/server';
import { getCookie, getSetCookie, parseRequestFormData } from '~/shared/lib';
import {
  handleRequestError,
  requireAuthRequest,
} from '~/shared/lib/server-only';

type ActionFormData =
  | (UserPayload & { _action: 'updateUser' })
  | { _action: 'deleteUser' };

export default async function action({ request }: ActionFunctionArgs) {
  requireAuthRequest(request);

  try {
    const formData = await parseRequestFormData<ActionFormData>(request);
    const cookie = getCookie(request);

    if (formData._action === 'updateUser') {
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
        { ...result, _action: 'updateUser' },
        {
          headers: {
            'Set-Cookie': getSetCookie(response),
          },
        },
      ) satisfies ServerActionReturn;
    } else if (formData._action === 'deleteUser') {
      const { result, response } = await userApi.services.deleteCurrentUser({
        fetchOpts: {
          headers: { Cookie: cookie },
        },
      });

      if (result.data) {
        logout(request);
      } else {
        return json(
          {
            data: null,
            error: result.error,
            errors: result.errors,
            _action: 'deleteUser',
          },
          {
            headers: {
              'Set-Cookie': getSetCookie(response),
            },
          },
        ) satisfies ServerActionReturn;
      }
    }

    return null;
  } catch (err) {
    return handleRequestError(err, request);
  }
}
