import ApiError, { type ApiErrorConfig } from '../classes/ApiError.js';

type ErrorCodes =
  | 'bad_request'
  | 'not_found'
  | 'unauthorized'
  | 'forbidden'
  | 'conflict'
  | 'server_error';

const errorFactory = {
  create(type: ErrorCodes, config?: ApiErrorConfig) {
    switch (type) {
      case 'bad_request':
        return new ApiError({
          code: 400,
          message: 'Request is invalid',
          ...(config || {}),
        });
      case 'unauthorized': {
        return new ApiError({
          code: 401,
          message: 'Authentication is required',
          ...(config || {}),
        });
      }
      case 'forbidden': {
        return new ApiError({
          code: 403,
          message: 'You are not allowed to use that resource',
          ...(config || {}),
        });
      }
      case 'not_found': {
        return new ApiError({
          code: 404,
          message: 'Resource was not found',
          ...(config || {}),
        });
      }
      case 'conflict': {
        return new ApiError({
          code: 409,
          message: 'Something went wrong',
          ...(config || {}),
        });
      }
      case 'server_error': {
        return new ApiError({
          code: 500,
          message: 'Something went wrong',
          ...(config || {}),
        });
      }
      default:
        throw new Error('Undefined error');
    }
  },
};

export default errorFactory;
