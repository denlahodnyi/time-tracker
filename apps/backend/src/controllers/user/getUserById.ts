import { client } from '../../../db/index.js';
import { excludeObjectKeys } from '../../utils/index.js';
import {
  errorFactory,
  UserControllerCreator,
} from '../../core/helpers/index.js';

class GetUserByIdController extends UserControllerCreator {
  async implement(): Promise<void> {
    const user = await client.user.findUnique({
      where: { id: this.getUserId() },
    });

    if (!user) {
      throw errorFactory.create('not_found', { message: 'User not found' });
    }

    this.ok({ user: excludeObjectKeys(user, ['password']) });
  }
}

export default new GetUserByIdController();
