import { client } from '../../../db/index.js';
import { ControllerCreator, errorFactory } from '../../core/helpers/index.js';
import { TaskModel } from '../../models/index.js';

type EventBody =
  | {
      event: 'start';
      startedAt: string;
    }
  | {
      event: 'stop';
      entryId: string;
      finishedAt: string;
    }
  | {
      event: 'done';
    };

class UserTaskEvent extends ControllerCreator {
  async implement(): Promise<void> {
    const body = this.req.body as EventBody;

    if (body.event === 'start') {
      const { task } = await new TaskModel(client).start(
        this.req.user.id,
        Number(this.req.params.taskId),
        { startedAt: body.startedAt as unknown as Date },
      );

      this.ok({ task });
    } else if (body.event === 'stop') {
      const { task } = await new TaskModel(client).stop(
        this.req.user.id,
        Number(this.req.params.taskId),
        {
          finishedAt: body.finishedAt as unknown as Date,
          entryId: Number(body.entryId),
        },
      );

      this.ok({ task });
    } else {
      throw errorFactory.create('bad_request', { message: 'Unknown event' });
    }
  }
}

export default new UserTaskEvent();
