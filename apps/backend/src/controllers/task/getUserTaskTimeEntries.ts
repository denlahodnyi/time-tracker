import { client } from '../../../db/index.js';
import { ControllerCreator } from '../../core/helpers/index.js';
import { TaskModel } from '../../models/index.js';

class GetUserTaskTimeEntries extends ControllerCreator {
  async implement(): Promise<void> {
    const { timeEntries } = await new TaskModel(client).getEntries(
      this.req.user.id,
      Number(this.req.params.taskId),
    );

    this.ok({ timeEntries });
  }
}

export default new GetUserTaskTimeEntries();
