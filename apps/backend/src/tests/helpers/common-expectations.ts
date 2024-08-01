import type { createErrorResponse } from '../../core/helpers/index.js';

const getErrorResponseExpects = (
  responseBody: ReturnType<typeof createErrorResponse>,
  isValidationError = false,
) => {
  expect(responseBody).not.toHaveProperty('data');
  expect(responseBody).toHaveProperty('status', 'error');
  expect(responseBody).toHaveProperty('error');

  if (isValidationError) {
    expect(responseBody.errors).toBeTruthy();
  }
};

export { getErrorResponseExpects };
