import { client } from '../../../db/index.js';
import { ControllerCreator } from '../../core/helpers/index.js';
import { User } from '../../models/index.js';

class UpdateUserController extends ControllerCreator {
  async implement(): Promise<void> {
    const id = Number(this.req.params.user_id);
    const data = this.req.body;
    const user = await new User(client.user).updateById({ id, ...data });

    this.ok({ user });
  }
}

export default new UpdateUserController();
