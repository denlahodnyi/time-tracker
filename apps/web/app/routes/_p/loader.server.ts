import { json, type LoaderFunctionArgs } from '@remix-run/node';

import { userApi } from '~/entities/user';
import type { ServerLoaderReturn } from '~/shared/api';
import { getCookie, getSetCookie } from '~/shared/lib';
import {
  handleRequestError,
  requireAuthRequest,
} from '~/shared/lib/server-only';

export default async function loader({ request }: LoaderFunctionArgs) {
  requireAuthRequest(request);

  try {
    const { result, response } = await userApi.services.getCurrentUser({
      fetchOpts: {
        headers: { Cookie: getCookie(request) },
      },
    });

    return json(result, {
      headers: {
        'Set-Cookie': getSetCookie(response),
      },
    }) satisfies ServerLoaderReturn;
  } catch (err) {
    handleRequestError(err, request, { shouldThrowError: true });
  }
}
