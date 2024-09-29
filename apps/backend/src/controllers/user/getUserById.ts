import { client } from '../../../db/index.js';
import { excludeObjectKeys } from '../../utils/index.js';
import { UserControllerCreator } from '../../core/helpers/index.js';
import UserModel from '../../models/UserModel.js';

class GetUserByIdController extends UserControllerCreator {
  protected async implement(
    this: this & ReturnType<UserControllerCreator['createHttpCtx']>,
  ): Promise<void> {
    const { user } = await new UserModel(client).getById(
      this.getUserId(this.req),
    );

    this.ok({ user: excludeObjectKeys(user, ['password']) });
  }
}

export default new GetUserByIdController();
