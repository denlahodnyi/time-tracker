import { client } from '../../../db/index.js';
import { ControllerCreator } from '../../core/helpers/index.js';
import { TaskModel } from '../../models/index.js';

class UpdateUserTask extends ControllerCreator {
  protected async implement(
    this: ReturnType<ControllerCreator['createHttpCtx']>,
  ): Promise<void> {
    const { task } = await new TaskModel(client).updateById(
      this.req.user.id,
      Number(this.req.params.taskId),
      this.req.body,
    );

    this.ok({ task });
  }
}

export default new UpdateUserTask();
