import type { Request } from 'express';

import ControllerCreator from './ControllerCreator.js';

export default abstract class UserControllerCreator extends ControllerCreator {
  protected getUserId(req: Request) {
    return req.isCurrentUserReq ? req.user.id : Number(req.params.userId);
  }

  protected abstract implement(
    this: this & ReturnType<UserControllerCreator['createHttpCtx']>,
  ): Promise<unknown>;
}
