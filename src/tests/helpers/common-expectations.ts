import type { createErrorResponse } from '../../core/helpers/index.js';

const getErrorResponseExpects = (
  responseBody: ReturnType<typeof createErrorResponse>,
  isValidationError = false,
) => {
  expect(responseBody).not.toHaveProperty('data');
  expect(responseBody).toHaveProperty('status', 'error');
  expect(responseBody).toHaveProperty('message');
  expect(responseBody).toHaveProperty('errorCode');
  expect(responseBody.message).toBeTruthy();

  if (isValidationError) {
    expect(responseBody.fieldErrors).toBeTruthy();
  }
};

export { getErrorResponseExpects };
