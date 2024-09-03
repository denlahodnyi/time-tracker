import { client } from '../../../db/index.js';
import { UserModel } from '../../models/index.js';
import { ControllerCreator, setAuthCookie } from '../../core/helpers/index.js';

class SignInController extends ControllerCreator {
  protected async implement(
    this: ReturnType<ControllerCreator['createHttpCtx']>,
  ): Promise<void> {
    const { email, password } = this.req.body;
    const { token, ...data } = await new UserModel(client).signIn({
      email,
      password,
    });

    setAuthCookie(this.res, token);
    this.ok(data);
  }
}

export default new SignInController();
