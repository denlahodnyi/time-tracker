import { client } from '../../../db/index.js';
import { ControllerCreator } from '../../core/helpers/index.js';

class GetUsersController extends ControllerCreator {
  protected async implement(
    this: ReturnType<ControllerCreator['createHttpCtx']>,
  ): Promise<void> {
    const users = await client.user.findMany({
      select: { firstName: true, lastName: true, email: true, bio: true },
    });

    this.ok({ users });
  }
}

export default new GetUsersController();
