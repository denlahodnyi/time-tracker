import type { CustomFormErrors, ZodLikeFormErrors } from '../core/types';

/**
 * Make structure similar to zod format()
 *
 * Parameter example:
 * @example
 * {
 *    foo: [error, error],
 *    bar: {
 *      _errors: [error, error]
 *      baz: [error]
 *    }
 * }
 *
 * Result:
 * @example
 * {
 *    foo: {
 *      _errors: [error, error]
 *    },
 *    bar: {
 *      _errors: [error, error],
 *      baz: {
 *        _errors: [error]
 *      }
 *    },
 * }
 */
export default function transformFieldErrors(
  errorFields: CustomFormErrors,
): ZodLikeFormErrors {
  let transformed = {};

  for (const key in errorFields) {
    if (Object.hasOwn(errorFields, key)) {
      const element = errorFields[key];

      if (key === '_errors' && Array.isArray(element)) {
        transformed = { ...transformed, _errors: element };
      } else if (Array.isArray(element)) {
        transformed = {
          ...transformed,
          [key]: { _errors: element },
        };
      } else if (element) {
        transformed = { ...transformed, [key]: transformFieldErrors(element) };
      }
    }
  }

  return transformed;
}
