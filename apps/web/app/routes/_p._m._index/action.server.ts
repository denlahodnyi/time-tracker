import { ActionFunctionArgs, json } from '@remix-run/node';

import { COMPLETE_TASK_ACTION } from '~/features/tasks/complete';
import {
  completeTask,
  type CompleteMyTaskParsedFormData,
} from '~/features/tasks/complete/server';
import {
  CREATE_TASK_ACTION,
  START_NEW_TASK_ACTION,
} from '~/features/tasks/create-task';
import {
  createUserTask,
  NewTaskParsedFormData,
} from '~/features/tasks/create-task/server';
import { DELETE_TASK_ACTION } from '~/features/tasks/delete-task';
import {
  DeleteMyTaskParsedFormData,
  deleteUserTask,
} from '~/features/tasks/delete-task/server';
import { START_TASK_ACTION } from '~/features/tasks/start-task';
import {
  startTask,
  StartTaskParsedFormData,
} from '~/features/tasks/start-task/server';
import { STOP_TASK_ACTION } from '~/features/tasks/stop-task';
import {
  stopTask,
  StopTaskParsedFormData,
} from '~/features/tasks/stop-task/server';
import { UPDATE_TASK_ACTION } from '~/features/tasks/update-task';
import {
  type UpdateMyTaskParsedFormData,
  updateUserTask,
} from '~/features/tasks/update-task/server';
import type { ServerActionReturn } from '~/shared/api';
import { parseRequestFormData } from '~/shared/lib';
import {
  handleRequestError,
  requireAuthRequest,
} from '~/shared/lib/server-only';

export type ActionFormData =
  | NewTaskParsedFormData
  | StopTaskParsedFormData
  | StartTaskParsedFormData
  | DeleteMyTaskParsedFormData
  | UpdateMyTaskParsedFormData
  | CompleteMyTaskParsedFormData;

export default async function action({ request }: ActionFunctionArgs) {
  try {
    requireAuthRequest(request);

    const formData = await parseRequestFormData<ActionFormData>(request);

    switch (formData._action) {
      case START_NEW_TASK_ACTION:
      case CREATE_TASK_ACTION: {
        const { data, setCookie } = await createUserTask(formData, request);

        return json(data, {
          headers: { 'Set-Cookie': setCookie },
        }) satisfies ServerActionReturn;
      }
      case UPDATE_TASK_ACTION: {
        const { data, setCookie } = await updateUserTask(formData, request);

        return json(data, {
          headers: { 'Set-Cookie': setCookie },
        }) satisfies ServerActionReturn;
      }
      case DELETE_TASK_ACTION: {
        const { data, setCookie } = await deleteUserTask(formData, request);

        return json(data, {
          headers: { 'Set-Cookie': setCookie },
        }) satisfies ServerActionReturn;
      }
      case START_TASK_ACTION: {
        const { data, setCookie } = await startTask(formData, request);

        return json(data, {
          headers: { 'Set-Cookie': setCookie },
        }) satisfies ServerActionReturn;
      }
      case STOP_TASK_ACTION: {
        const { data, setCookie } = await stopTask(formData, request);

        return json(data, {
          headers: { 'Set-Cookie': setCookie },
        }) satisfies ServerActionReturn;
      }
      case COMPLETE_TASK_ACTION: {
        const { data, setCookie } = await completeTask(formData, request);

        return json(data, {
          headers: { 'Set-Cookie': setCookie },
        }) satisfies ServerActionReturn;
      }
      default: {
        throw new Error('Undefined action');
      }
    }
  } catch (err) {
    return handleRequestError(err, request);
  }
}
