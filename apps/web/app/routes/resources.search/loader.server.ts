import { json, type LoaderFunctionArgs } from '@remix-run/node';

import { searchTasks } from '~/features/tasks/search/server';
import type { ServerActionReturn } from '~/shared/api';
import {
  handleRequestError,
  requireAuthRequest,
} from '~/shared/lib/server-only';

export default async function loader({ request }: LoaderFunctionArgs) {
  try {
    requireAuthRequest(request);

    const { data, setCookie } = await searchTasks(request);

    return json(data, {
      headers: { 'Set-Cookie': setCookie },
    }) satisfies ServerActionReturn;
  } catch (error) {
    return handleRequestError(error, request);
  }
}
