import type { Handler } from 'express';

import { asyncHandler, verifyJwt } from '../utils/index.js';
import { errorFactory } from '../core/helpers/index.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: { id: number };
      isCurrentUserReq: boolean;
    }
  }
}

interface Options {
  verifyAccessByParam?: string;
}
// @TODO: clear on 404 when user is not found

const requireAuth = (options?: Options): Handler =>
  asyncHandler(async (req, res, next) => {
    if (!req.cookies.auth) throw errorFactory.create('unauthorized');

    const jwtPayload = verifyJwt(req.cookies.auth);

    if (
      !jwtPayload.userId ||
      (options?.verifyAccessByParam &&
        Number(req.params[options.verifyAccessByParam]) !== jwtPayload.userId)
    ) {
      throw errorFactory.create('forbidden');
    }

    req.user = { id: jwtPayload.userId };

    next();
  });

export default requireAuth;
