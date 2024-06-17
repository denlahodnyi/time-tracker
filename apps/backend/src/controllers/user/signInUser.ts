import { client } from '../../../db/index.js';
import { User } from '../../models/index.js';
import { ControllerCreator } from '../../core/helpers/index.js';

class SignInController extends ControllerCreator {
  async implement(): Promise<void> {
    const { email, password } = this.req.body;
    const data = await new User(client.user).signIn({
      email,
      password,
    });

    this.ok(data);
  }
}

export default new SignInController();
