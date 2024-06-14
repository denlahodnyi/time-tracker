import { excludeObjectKeys } from '../../utils/index.js';
import { client } from '../../../db/client.js';
import { ControllerCreator } from '../../core/helpers/index.js';

class DeleteUserController extends ControllerCreator {
  async implement(): Promise<void> {
    const id = Number(this.req.params.user_id);
    const user = await client.user.delete({ where: { id } });

    this.ok({
      user: excludeObjectKeys(user, ['password']),
    });
  }
}

export default new DeleteUserController();
