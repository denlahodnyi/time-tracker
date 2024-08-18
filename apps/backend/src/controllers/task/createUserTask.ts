import { ControllerCreator } from '../../core/helpers/index.js';
import { TaskModel } from '../../models/index.js';
import { client } from '../../../db/index.js';

class CreateUserTask extends ControllerCreator {
  async implement(): Promise<void> {
    const { task } = await new TaskModel(client).create(
      this.req.user.id,
      this.req.body,
    );

    this.created({ task });
  }
}

export default new CreateUserTask();
