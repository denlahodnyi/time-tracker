import { ActionFunctionArgs, json } from '@remix-run/node';

import {
  taskApi,
  type MyTaskCreatePayload,
  type MyTaskStartPayload,
  type MyTaskStopPayload,
  type MyTaskUpdatePayload,
} from '~/entities/task';
import {
  handleCatchResponseError,
  parseRequestFormData,
  requireAuthRequest,
} from '~/shared/server-side';

const START_NEW_TASK_ACTION = 'createAndStartTask';
const CREATE_TASK_ACTION = 'createTask';
const UPDATE_TASK_ACTION = 'updateTask';
const DELETE_TASK_ACTION = 'deleteTask';
const STOP_TASK_ACTION = 'stopTask';
const START_TASK_ACTION = 'startTask';

type NewTaskFormData = {
  _action: typeof START_NEW_TASK_ACTION | typeof CREATE_TASK_ACTION;
} & MyTaskCreatePayload;

type UpdateTaskFormData = {
  _action: typeof UPDATE_TASK_ACTION;
} & MyTaskUpdatePayload;

type StopTaskFormData = {
  _action: typeof STOP_TASK_ACTION;
} & MyTaskStopPayload;

type StartTaskFormData = {
  _action: typeof START_TASK_ACTION;
} & MyTaskStartPayload;

interface DeleteTaskFormData {
  _action: typeof DELETE_TASK_ACTION;
  taskId: number;
}

export type ActionFormData =
  | NewTaskFormData
  | StopTaskFormData
  | StartTaskFormData
  | DeleteTaskFormData
  | UpdateTaskFormData;

export default async function action({ request }: ActionFunctionArgs) {
  try {
    requireAuthRequest(request);

    const formData = (await parseRequestFormData(
      request,
    )) as unknown as ActionFormData;

    console.log(`🚀 -> _INDEX ACTION`, formData);

    if (
      formData._action === START_NEW_TASK_ACTION ||
      formData._action === CREATE_TASK_ACTION
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _action, ...payload } = formData;
      const { result, response } = await taskApi.services.postMyTask(
        {
          ...payload,
          // isStarted: true,
        },
        {
          fetchOpts: {
            // TODO: create util fn?
            headers: { Cookie: request.headers.get('Cookie') || '' },
          },
        },
      );

      return json(
        { ...result, _action: formData._action },
        {
          headers: {
            // TODO: create util fn?
            'Set-Cookie': response.headers.get('Set-Cookie') || '',
          },
        },
      );
      // return null;
    } else if (formData._action === START_TASK_ACTION) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _action, ...payload } = formData;
      const { result, response } = await taskApi.services.startMyTask(payload, {
        fetchOpts: {
          headers: { Cookie: request.headers.get('Cookie') || '' },
        },
      });

      return json(
        { ...result, _action: START_TASK_ACTION },
        {
          headers: {
            'Set-Cookie': response.headers.get('Set-Cookie') || '',
          },
        },
      );
    } else if (formData._action === STOP_TASK_ACTION) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _action, ...payload } = formData;
      const { result, response } = await taskApi.services.stopMyTask(payload, {
        fetchOpts: {
          headers: { Cookie: request.headers.get('Cookie') || '' },
        },
      });

      return json(
        { ...result, _action: STOP_TASK_ACTION },
        {
          headers: {
            'Set-Cookie': response.headers.get('Set-Cookie') || '',
          },
        },
      );
    } else if (formData._action === DELETE_TASK_ACTION) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _action, ...payload } = formData;
      const { result, response } = await taskApi.services.deleteTask(payload, {
        fetchOpts: {
          // TODO: create util fn?
          headers: { Cookie: request.headers.get('Cookie') || '' },
        },
      });

      return json(
        { ...result, _action: DELETE_TASK_ACTION },
        {
          headers: {
            // TODO: create util fn?
            'Set-Cookie': response.headers.get('Set-Cookie') || '',
          },
        },
      );
    } else if (formData._action === UPDATE_TASK_ACTION) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _action, ...payload } = formData;
      const { result, response } = await taskApi.services.updateMyTask(
        payload,
        {
          fetchOpts: {
            // TODO: create util fn?
            headers: { Cookie: request.headers.get('Cookie') || '' },
          },
        },
      );

      return json(
        { ...result, _action: formData._action },
        {
          headers: {
            'Set-Cookie': response.headers.get('Set-Cookie') || '',
          },
        },
      );
    }

    return null;
  } catch (err) {
    return handleCatchResponseError(err);
  }
}
