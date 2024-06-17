import type { NextFunction, Request, Response } from 'express';

import { asyncHandler } from '../../utils/index.js';
import { createErrorResponse } from './index.js';

export default abstract class ControllerCreator {
  protected req!: Request;
  protected res!: Response;
  protected next!: NextFunction;

  constructor() {
    this.mount = this.mount.bind(this);
    this.implement = this.implement.bind(this);
  }

  mount(req: Request, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
    this.next = next;
    asyncHandler(this.implement)(req, res, next);
  }

  abstract implement(): Promise<void>;

  protected ok(data?: unknown) {
    this.res.status(200).json({ status: 'success', data });
  }
  protected created(data?: unknown) {
    this.res.status(201).json({ status: 'success', data });
  }
  protected error(errorData: Parameters<typeof createErrorResponse>[0]) {
    this.res.status(errorData.code).json(
      createErrorResponse({
        code: errorData.code,
        message: errorData.message,
        fieldErrors: errorData.fieldErrors,
      }),
    );
  }
}
