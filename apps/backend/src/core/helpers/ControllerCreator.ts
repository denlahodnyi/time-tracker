import type { NextFunction, Request, Response } from 'express';

import { asyncHandler } from '../../utils/index.js';
import createErrorResponse from './createErrorResponse.js';
import createSuccessResponse from './createSuccessResponse.js';

interface HttpCtx {
  req: Request;
  res: Response;
  next: NextFunction;
}

type CreatedHttpCtx<T> = HttpCtx & T;

export default abstract class ControllerCreator {
  constructor() {
    this.mount = this.mount.bind(this);
  }

  public mount(req: Request, res: Response, next: NextFunction) {
    // Every time mount is called, implement() must be bounded to its own req,
    // res, next. All methods in ControllerCreator and its inherited classes
    // must use only this req, res, next.
    const httpCtx = this.createHttpCtx({ req, res, next });
    const boundedImplementation = this.implement.bind(httpCtx);

    asyncHandler(boundedImplementation)(req, res, next);
  }

  protected abstract implement(
    this: ReturnType<ControllerCreator['createHttpCtx']>,
  ): Promise<unknown>;

  protected createHttpCtx({ req, res, next }: HttpCtx) {
    const methodsWithCtx = {
      ok: this.ok.bind(null, { req, res, next }),
      created: this.created.bind(null, { req, res, next }),
      error: this.error.bind(null, { req, res, next }),
    };
    const ctx: CreatedHttpCtx<typeof methodsWithCtx & Record<string, unknown>> =
      {
        req,
        res,
        next,
        ...methodsWithCtx,
      };

    // Add methods from derived classes to the ctx
    Object.setPrototypeOf(ctx, this);

    return ctx;
  }

  protected ok({ res }: HttpCtx, data: null | object = null) {
    return res.status(200).json(createSuccessResponse({ data }));
  }
  protected created({ res }: HttpCtx, data: null | object = null) {
    return res.status(201).json(createSuccessResponse({ data }));
  }
  protected error(
    { res }: HttpCtx,
    errorData: Parameters<typeof createErrorResponse>[0],
  ) {
    return res.status(errorData.code).json(
      createErrorResponse({
        code: errorData.code,
        message: errorData.message,
        fieldErrors: errorData.fieldErrors,
      }),
    );
  }
}
