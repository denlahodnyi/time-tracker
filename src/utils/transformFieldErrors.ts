import type { ApiErrorConfig } from '../core/classes/ApiError.js';

/**
 * Make structure similar to zod format()
 */
export default function transformFieldErrors(
  errorFields: NonNullable<ApiErrorConfig['formFields']>,
) {
  const transformed = {} as NonNullable<ApiErrorConfig['formFields']>;

  for (const key in errorFields) {
    if (Object.hasOwn(errorFields, key)) {
      const element = errorFields[key];

      if (Array.isArray(element)) {
        transformed[key] = {
          _errors: element,
        };
      } else {
        transformed[key] = transformFieldErrors(element);
      }
    }
  }

  return transformed;
}
