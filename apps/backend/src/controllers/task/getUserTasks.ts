import type { Request } from 'express';

import { TaskModel } from '../../models/index.js';
import { client } from '../../../db/index.js';
import { ControllerCreator } from '../../core/helpers/index.js';

type ReqWithQuery = Request<
  object,
  object,
  object,
  {
    task_id?: string;
    filter_by?: 'completed';
    limit?: string;
    cursor?: string;
  }
>;

const LIMIT = 10;

class GetUserTasks extends ControllerCreator {
  protected async implement(
    this: ReturnType<ControllerCreator['createHttpCtx']>,
  ): Promise<void> {
    const { cursor, limit, task_id, filter_by } = (this.req as ReqWithQuery)
      .query;
    const { tasks, pagination, activeTask } = await new TaskModel(
      client,
    ).getAll(this.req.user.id, {
      includeActiveTask: true,
      pagination: {
        limit: Number(limit) || LIMIT,
        cursor: Number(cursor) || null,
      },
      query: {
        taskId: Number(task_id) || undefined,
        filterBy: filter_by,
      },
    });

    this.ok({ activeTask, tasks, pagination });
  }
}

export default new GetUserTasks();
