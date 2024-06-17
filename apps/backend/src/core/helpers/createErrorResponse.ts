export default function createErrorResponse(config: {
  code: number;
  message: string;
  fieldErrors: unknown;
}) {
  const errorCode = config.code >= 500 ? 'server_error' : 'client_error';

  return {
    status: 'error',
    message: config.message,
    fieldErrors: config.fieldErrors,
    errorCode,
  } as const;
}
