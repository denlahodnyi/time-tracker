import { client } from '../../../db/client.js';
import { UserModel } from '../../models/index.js';
import { ControllerCreator, setAuthCookie } from '../../core/helpers/index.js';

class RegisterUserController extends ControllerCreator {
  protected async implement(
    this: ReturnType<ControllerCreator['createHttpCtx']>,
  ): Promise<void> {
    const { firstName, email, password } = this.req.body;
    const { token, ...data } = await new UserModel(client).signUp({
      firstName,
      email,
      password,
    });

    setAuthCookie(this.res, token);
    this.created(data);
  }
}

export default new RegisterUserController();
