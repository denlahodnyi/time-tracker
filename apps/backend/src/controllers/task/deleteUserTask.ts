import { client } from '../../../db/index.js';
import { ControllerCreator } from '../../core/helpers/index.js';
import { TaskModel } from '../../models/index.js';

class DeleteUserTask extends ControllerCreator {
  async implement(): Promise<void> {
    const { task } = await new TaskModel(client).deleteById(
      Number(this.req.user.id),
      Number(this.req.params.taskId),
    );

    this.ok({ task });
  }
}

export default new DeleteUserTask();
