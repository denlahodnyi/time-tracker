import {
  constructEndpoint,
  type ApiClient,
  type ClientRequestOptions,
  type ResponseData,
  type UserCreateTaskDTO,
  type UserStartTaskDTO,
  type UserStopTaskDTO,
  type UserTaskDTO,
  type UserTasksAnalyticsDTO,
  type UserUpdateTaskDTO,
} from '~/shared/api';
import {
  userNewTaskToDto,
  userTaskFromDto,
  userTasksAnalyticsFromDto,
  userTasksFromDto,
  userTaskToDto,
} from './dto';
import type {
  MyTaskCreatePayload,
  MyTaskEventSuccessReturn,
  MyTaskStartPayload,
  MyTaskStopPayload,
  MyTaskSuccessCreateReturn,
  MyTaskSuccessUpdateReturn,
  MyTaskUpdatePayload,
  MyTasksSuccessGetReturn,
} from '../model';

class TaskService {
  constructor(private client: ApiClient) {}

  async getMyTasks(
    payload: { cursor: number | null },
    requestOptions?: ClientRequestOptions,
  ) {
    const { data, response } = await this.client.get<
      ResponseData<MyTasksSuccessGetReturn>
    >(
      constructEndpoint('/tasks', { query: { cursor: payload.cursor } }),
      requestOptions,
    );

    if (!data) throw new Error('Cannot fetch tasks');
    if (data.status === 'error') throw new Error(data.error);

    return {
      result: {
        tasks: userTasksFromDto(data.data.tasks),
        activeTask: data.data.activeTask
          ? userTaskFromDto(data.data.activeTask)
          : null,
        pagination: data.data.pagination,
      },
      response,
    };
  }

  async postMyTask(
    payload: MyTaskCreatePayload,
    requestOptions?: ClientRequestOptions,
  ) {
    const { data, response } = await this.client.post<
      ResponseData<MyTaskSuccessCreateReturn>,
      UserCreateTaskDTO
    >(constructEndpoint('/tasks'), userNewTaskToDto(payload), requestOptions);

    if (!data) throw new Error('Cannot create tasks');

    return {
      result: {
        error: data.status === 'error' ? data.error : null,
        errors: data.status === 'error' ? data.errors : null,
        data:
          data.status === 'success'
            ? { task: userTaskFromDto(data.data.task) }
            : null,
      },
      response,
    };
  }

  async updateMyTask(
    payload: MyTaskUpdatePayload,
    requestOptions?: ClientRequestOptions,
  ) {
    const { data, response } = await this.client.post<
      ResponseData<MyTaskSuccessUpdateReturn>,
      UserUpdateTaskDTO
    >(
      constructEndpoint('/tasks/:taskId', {
        params: { taskId: payload.taskId },
      }),
      userTaskToDto(payload),
      {
        ...requestOptions,
        fetchOpts: {
          ...(requestOptions?.fetchOpts || {}),
          method: 'PATCH',
        },
      },
    );

    if (!data) throw new Error('Cannot update task');

    return {
      result: {
        error: data.status === 'error' ? data.error : null,
        errors: data.status === 'error' ? data.errors : null,
        data:
          data.status === 'success'
            ? { task: userTaskFromDto(data.data.task) }
            : null,
      },
      response,
    };
  }

  async startMyTask(
    payload: MyTaskStartPayload,
    requestOptions?: ClientRequestOptions,
  ) {
    const { taskId, startedAt } = payload;
    const { data, response } = await this.client.post<
      ResponseData<MyTaskEventSuccessReturn>,
      UserStartTaskDTO
    >(
      constructEndpoint('/tasks/:taskId/event', { params: { taskId } }),
      { event: 'start', startedAt },
      {
        ...requestOptions,
        fetchOpts: {
          method: 'PATCH',
          ...requestOptions?.fetchOpts,
        },
      },
    );

    if (!data) throw new Error('Cannot start tasks');

    return {
      result: {
        error: data.status === 'error' ? data.error : null,
        errors: data.status === 'error' ? data.errors : null,
        data:
          data.status === 'success'
            ? { task: userTaskFromDto(data.data.task) }
            : null,
      },
      response,
    };
  }

  async stopMyTask(
    payload: MyTaskStopPayload,
    requestOptions?: ClientRequestOptions,
  ) {
    const { taskId, ...restPayload } = payload;
    const { data, response } = await this.client.post<
      ResponseData<MyTaskEventSuccessReturn>,
      UserStopTaskDTO
    >(
      constructEndpoint('/tasks/:taskId/event', { params: { taskId } }),
      { ...restPayload, event: 'stop' },
      {
        ...requestOptions,
        fetchOpts: {
          method: 'PATCH',
          ...requestOptions?.fetchOpts,
        },
      },
    );

    if (!data) throw new Error('Cannot stop tasks');

    return {
      result: {
        error: data.status === 'error' ? data.error : null,
        errors: data.status === 'error' ? data.errors : null,
        data:
          data.status === 'success'
            ? { task: userTaskFromDto(data.data.task) }
            : null,
      },
      response,
    };
  }

  async deleteTask(
    payload: { taskId: number },
    requestOptions?: ClientRequestOptions,
  ) {
    const { data, response } = await this.client.delete<
      ResponseData<{ task: UserTaskDTO }>
    >(
      constructEndpoint('/tasks/:taskId', {
        params: { taskId: payload.taskId },
      }),
      {
        ...(requestOptions || {}),
      },
    );

    if (!data) throw new Error('Cannot delete tasks');

    return {
      result: {
        error: data.status === 'error' ? data.error : null,
        errors: data.status === 'error' ? data.errors : null,
        data:
          data.status === 'success'
            ? { task: userTaskFromDto(data.data.task) }
            : null,
      },
      response,
    };
  }

  async getMyAnalytics(requestOptions?: ClientRequestOptions) {
    const { data, response } = await this.client.get<
      ResponseData<UserTasksAnalyticsDTO>
    >(constructEndpoint('/analytics'), requestOptions);

    if (!data) throw new Error('Cannot fetch analytics');
    if (data.status === 'error') throw new Error(data.error);

    return {
      result: userTasksAnalyticsFromDto(data.data),
      response,
    };
  }
}

export { TaskService };
