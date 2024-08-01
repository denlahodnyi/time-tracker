import type { ResponseFormErrors } from '../types';

export default function createErrorResponse(config: {
  code: number;
  message: string;
  fieldErrors?: ResponseFormErrors;
}) {
  return {
    status: 'error',
    error: config.message,
    errors: config.fieldErrors || null,
  } as const;
}
