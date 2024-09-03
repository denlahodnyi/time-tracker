import { json, type LoaderFunctionArgs } from '@remix-run/node';

import { getPaginatedUserTasks } from '~/features/tasks/get-paginated-tasks/server';
import {
  handleRequestError,
  requireAuthRequest,
} from '~/shared/lib/server-only';

export default async function loader({ request }: LoaderFunctionArgs) {
  try {
    requireAuthRequest(request);

    const searchParams = new URL(request.url).searchParams;
    const cursor = Number(searchParams.get('cursor')) || null;
    const { data, setCookie } = await getPaginatedUserTasks(request, cursor);

    return json(
      { ...data, initialCursors: [] }, // initialCursors will be filled in clientLoader
      {
        headers: { 'Set-Cookie': setCookie },
      },
    );
  } catch (err) {
    handleRequestError(err, request, { shouldThrowError: true });
  }
}
