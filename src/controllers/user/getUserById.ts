import { client } from '../../../db/index.js';
import { excludeObjectKeys } from '../../utils/index.js';
import { ControllerCreator, errorFactory } from '../../core/helpers/index.js';

class GetUserByIdController extends ControllerCreator {
  async implement(): Promise<void> {
    const id = Number(this.req.params.user_id);
    const user = await client.user.findUnique({ where: { id } });

    if (!user) {
      throw errorFactory.create('not_found', { message: 'User not found' });
    }

    this.ok({ user: excludeObjectKeys(user, ['password']) });
  }
}

export default new GetUserByIdController();
