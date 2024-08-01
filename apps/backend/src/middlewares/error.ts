import { type ErrorRequestHandler } from 'express';
import { fromError } from 'zod-validation-error';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import { Prisma } from '@libs/prisma';

import { transformFieldErrors } from '../utils/index.js';
import {
  type CustomFormErrors,
  type ResponseFormErrors,
} from '../core/types.js';
import { createErrorResponse } from '../core/helpers/index.js';

interface GeneralError extends Error {
  code?: number;
  formFields?: CustomFormErrors;
}

const errorHandler: ErrorRequestHandler = (
  error: GeneralError,
  req,
  res,
  next,
) => {
  console.error(`💩 errorHandler -> ${error.name}`, error.message);

  if (res.headersSent) {
    // Delegate to the default Express error handler, when the headers have already been sent to the client
    return next(error);
  }

  let code = error.code || 500;
  let message = error.message || 'Something went wrong';
  let fieldErrors: ResponseFormErrors = error.formFields
    ? transformFieldErrors(error.formFields)
    : null;

  if (error instanceof ZodError) {
    const validationError = fromError(error);

    code = 400;
    message = validationError.message;
    fieldErrors = error.format();
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 - Unique constraint failed
    if (error.code === 'P2002') {
      code = 400;
      message = 'Invalid request';

      if (error.meta) {
        const field = (error.meta.target as string[])[0];

        fieldErrors = transformFieldErrors({
          [field]: ['Has already been taken. Please, choose another one'],
        });
      }
    }
  }
  if (error instanceof jwt.JsonWebTokenError) {
    code = 401;
    message = 'Invalid token';
  }
  if (error instanceof jwt.TokenExpiredError) {
    code = 401;
    message = 'Please, login again to continue';
  }
  if (code === 401 || code === 403) {
    res.clearCookie('auth');
  }

  res.status(code).json(
    createErrorResponse({
      code,
      message,
      fieldErrors,
    }),
  );
};

export default errorHandler;
