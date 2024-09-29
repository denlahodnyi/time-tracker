import { client } from '../../../db/index.js';
import { UserControllerCreator } from '../../core/helpers/index.js';
import { UserModel } from '../../models/index.js';

class UploadAvatarController extends UserControllerCreator {
  protected async implement(
    this: this & ReturnType<UserControllerCreator['createHttpCtx']>,
  ): Promise<void> {
    const { user } = await new UserModel(client).uploadAvatar(
      this.req,
      this.getUserId(this.req),
    );

    this.ok({ user });
  }
}

export default new UploadAvatarController();
