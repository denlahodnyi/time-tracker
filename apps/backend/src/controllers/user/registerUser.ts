import { client } from '../../../db/client.js';
import { User } from '../../models/index.js';
import { ControllerCreator } from '../../core/helpers/index.js';

class RegisterUserController extends ControllerCreator {
  async implement(): Promise<void> {
    const { firstName, email, password } = this.req.body;
    const data = await new User(client.user).signUp({
      firstName,
      email,
      password,
    });

    this.created(data);
  }
}

export default new RegisterUserController();
