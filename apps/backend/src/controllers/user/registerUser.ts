import { client } from '../../../db/client.js';
import { User } from '../../models/index.js';
import { ControllerCreator, setAuthCookie } from '../../core/helpers/index.js';

class RegisterUserController extends ControllerCreator {
  async implement(): Promise<void> {
    const { firstName, email, password } = this.req.body;
    const { token, ...data } = await new User(client.user).signUp({
      firstName,
      email,
      password,
    });

    setAuthCookie(this.res, token);
    this.created(data);
  }
}

export default new RegisterUserController();
