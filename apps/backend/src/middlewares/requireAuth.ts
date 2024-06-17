import type { Handler } from 'express';

import { asyncHandler, verifyJwt } from '../utils/index.js';
import { errorFactory } from '../core/helpers/index.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: { id: number };
    }
  }
}

interface Options {
  verifyAccessByParam?: string;
}

const requireAuth = (options?: Options): Handler =>
  asyncHandler(async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split('Bearer ')[1];

    if (!token) throw errorFactory.create('unauthorized');

    const jwtPayload = verifyJwt(token);

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
