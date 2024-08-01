import { excludeObjectKeys } from '../../utils/index.js';
import { client } from '../../../db/client.js';
import { UserControllerCreator } from '../../core/helpers/index.js';

class DeleteUserController extends UserControllerCreator {
  async implement(): Promise<void> {
    const user = await client.user.delete({ where: { id: this.getUserId() } });

    this.ok({
      user: excludeObjectKeys(user, ['password']),
    });
  }
}

export default new DeleteUserController();
