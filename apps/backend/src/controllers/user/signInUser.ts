import { client } from '../../../db/index.js';
import { User } from '../../models/index.js';
import { ControllerCreator, setAuthCookie } from '../../core/helpers/index.js';

class SignInController extends ControllerCreator {
  async implement(): Promise<void> {
    const { email, password } = this.req.body;
    const { token, ...data } = await new User(client.user).signIn({
      email,
      password,
    });

    setAuthCookie(this.res, token);
    this.ok(data);
  }
}

export default new SignInController();
