import type { RequestHandler, Response, Request, NextFunction } from 'express';

type AsyncHandlerFn = (
  ...params: Parameters<RequestHandler>
) => Promise<unknown>;

const asyncHandler =
  (controller: AsyncHandlerFn) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default asyncHandler;
