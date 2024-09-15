import { json, type LoaderFunctionArgs } from '@remix-run/node';

import type { TasksFilterByUrlParam } from '~/entities/task';
import { getPaginatedUserTasks } from '~/features/tasks/get-paginated-tasks/server';
import {
  TASK_SEARCH_URL_PARAM,
  TASKS_FILTER_URL_PARAM,
} from '~/shared/constants';
import {
  handleRequestError,
  requireAuthRequest,
} from '~/shared/lib/server-only';

export default async function loader({ request }: LoaderFunctionArgs) {
  try {
    requireAuthRequest(request);

    const { searchParams } = new URL(request.url);
    const cursor = Number(searchParams.get('cursor')) || null;
    const taskId = Number(searchParams.get(TASK_SEARCH_URL_PARAM));
    const filterBy =
      (searchParams.get(TASKS_FILTER_URL_PARAM) as TasksFilterByUrlParam) ||
      undefined;

    const { data, setCookie } = await getPaginatedUserTasks(request, {
      cursor,
      taskId,
      filterBy,
    });

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
