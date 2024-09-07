import { client } from '../../../db/index.js';
import { ControllerCreator } from '../../core/helpers/index.js';
import { TaskModel } from '../../models/index.js';

class GetUserTasksAnalytics extends ControllerCreator {
  protected async implement(
    this: ReturnType<ControllerCreator['createHttpCtx']>,
  ): Promise<void> {
    const userDateHeader = this.req.headers['x-client-date'];
    let userIsoDate = '';

    if (userDateHeader) {
      userIsoDate = Array.isArray(userDateHeader)
        ? userDateHeader[0]
        : userDateHeader;
    }

    const data = await new TaskModel(client).getAnalytics(
      this.req.user.id,
      userIsoDate,
    );

    this.ok(data);
  }
}

export default new GetUserTasksAnalytics();
