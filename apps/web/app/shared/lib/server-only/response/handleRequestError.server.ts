import { json } from '@remix-run/node';

import { ClientError } from '~/shared/api';
import { logout } from '~/shared/api/server';
import { GENERIC_ERROR_MESSAGE } from '~/shared/constants';

interface Options {
  shouldThrowError: boolean;
}

export default function handleRequestError(
  error: unknown,
  req: Request,
  opts?: Options,
) {
  const { shouldThrowError = false } = opts || {};

  console.error(error);

  if (error instanceof ClientError) {
    if (error.code === 401 || error.code === 403) {
      logout(req);
    }
    if (shouldThrowError) {
      throw json(error.message, { status: error.code });
    }
  }
  if (shouldThrowError) {
    throw json(GENERIC_ERROR_MESSAGE, { status: 500 });
  }

  return json(
    {
      data: null,
      error: GENERIC_ERROR_MESSAGE,
      errors: null,
    },
    { status: 500 },
  );
}
