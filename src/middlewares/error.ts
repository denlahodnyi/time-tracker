import { type ErrorRequestHandler } from 'express';
import { fromError } from 'zod-validation-error';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';

import { transformFieldErrors } from '../utils/index.js';
import { type RecursiveFormFields } from '../core/classes/ApiError.js';
import { createErrorResponse } from '../core/helpers/index.js';

interface GeneralError extends Error {
  code?: number;
  formFields?: RecursiveFormFields;
}

const errorHandler: ErrorRequestHandler = (
  error: GeneralError,
  req,
  res,
  next,
) => {
  console.error(error.name, error.message);

  if (res.headersSent) {
    // Delegate to the default Express error handler, when the headers have already been sent to the client
    return next(error);
  }

  let code = error.code || 500;
  let message = error.message || 'Something went wrong';
  let fieldErrors = error.formFields
    ? transformFieldErrors(error.formFields)
    : null;

  if (error instanceof ZodError) {
    const validationError = fromError(error);

    code = 400;
    message = validationError.message;
    fieldErrors = error.format();
  }
  if (error instanceof jwt.JsonWebTokenError) {
    code = 401;
    message = 'Invalid token';
  }
  if (error instanceof jwt.TokenExpiredError) {
    code = 401;
    message = 'Please, login again to continue';
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
