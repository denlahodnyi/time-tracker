import { TaskModel } from '../../models/index.js';
import { client } from '../../../db/index.js';
import { ControllerCreator } from '../../core/helpers/index.js';

const LIMIT = 10;

class GetUserTasks extends ControllerCreator {
  async implement(): Promise<void> {
    const { cursor, limit } = this.req.query;
    const { tasks, pagination, activeTask } = await new TaskModel(
      client,
    ).getAll(this.req.user.id, {
      includeActiveTask: true,
      pagination: {
        limit: Number(limit) || LIMIT,
        cursor: Number(cursor) || null,
      },
    });

    this.ok({ activeTask, tasks, pagination });
  }
}

export default new GetUserTasks();
