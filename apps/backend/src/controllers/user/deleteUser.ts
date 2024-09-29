import { excludeObjectKeys } from '../../utils/index.js';
import { client } from '../../../db/client.js';
import { UserControllerCreator } from '../../core/helpers/index.js';
import { UserModel } from '../../models/index.js';

class DeleteUserController extends UserControllerCreator {
  protected async implement(
    this: this & ReturnType<UserControllerCreator['createHttpCtx']>,
  ): Promise<void> {
    const { user } = await new UserModel(client).deleteById(
      this.getUserId(this.req),
    );

    this.ok({
      user: excludeObjectKeys(user, ['password']),
    });
  }
}

export default new DeleteUserController();
