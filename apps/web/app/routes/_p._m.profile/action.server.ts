import { json, redirect, type ActionFunctionArgs } from '@remix-run/node';

import { userApi, type UserPayload } from '~/entities/user';
import {
  getNullifiedAuthCookie,
  handleCatchResponseError,
  parseRequestFormData,
} from '~/shared/server-side';

type ActionFormData =
  | (UserPayload & { _action: 'updateUser' })
  | { _action: 'deleteUser' };

export default async function action({ request }: ActionFunctionArgs) {
  // TODO: missed auth check

  try {
    const formData = (await parseRequestFormData(
      request,
    )) as unknown as ActionFormData;

    if (formData._action === 'updateUser') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _action, ...payload } = formData;
      const { result, response } = await userApi.services.updateCurrentUser(
        payload,
        {
          fetchOpts: {
            headers: { Cookie: request.headers.get('Cookie') || '' },
          },
        },
      );

      return json(result, {
        headers: {
          'Set-Cookie': response.headers.get('Set-Cookie') || '',
        },
      });
    } else if (formData._action === 'deleteUser') {
      const { result, response } = await userApi.services.deleteCurrentUser({
        fetchOpts: {
          headers: { Cookie: request.headers.get('Cookie') || '' },
        },
      });

      if (result.data) {
        return redirect('/login', {
          headers: {
            'Set-Cookie': getNullifiedAuthCookie(),
          },
        });
      } else {
        return json(
          { data: null, error: result.error, errors: result.errors },
          {
            headers: {
              'Set-Cookie': response.headers.get('Set-Cookie') || '',
            },
          },
        );
      }
    }

    return null;
  } catch (err) {
    return handleCatchResponseError(err);
  }
}
