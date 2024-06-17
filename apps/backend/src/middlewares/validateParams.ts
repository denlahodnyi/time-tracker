import type { Handler } from 'express';

import { errorFactory } from '../core/helpers/index.js';

const validateParams =
  (params: string[]): Handler =>
  (req, res, next) => {
    if (params.includes('user_id')) {
      const userId = parseInt(req.params.user_id);

      if (!userId) {
        next(
          errorFactory.create('bad_request', { message: 'Invalid user id' }),
        );
      }
    }

    next();
  };

export default validateParams;
