import { client } from '../../../db/index.js';
import { UserControllerCreator } from '../../core/helpers/index.js';
import { UserModel } from '../../models/index.js';

class UpdateUserController extends UserControllerCreator {
  protected async implement(
    this: this & ReturnType<UserControllerCreator['createHttpCtx']>,
  ): Promise<void> {
    const user = await new UserModel(client).updateById({
      id: this.getUserId(this.req),
      ...this.req.body,
    });

    this.ok({ user });
  }
}

export default new UpdateUserController();
