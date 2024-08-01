import { json, redirect } from '@remix-run/node';

import { ClientError } from '~/shared/api';
import { GENERIC_ERROR_MESSAGE } from '~/shared/constants';
import getNullifiedAuthCookie from '../getNullifiedAuthCookie.server';

interface Options {
  shouldThrowError: boolean;
}

export default function handleCatchResponseError(
  error: unknown,
  opts?: Options,
) {
  const { shouldThrowError = false } = opts || {};

  console.error(error);

  if (error instanceof ClientError) {
    if (error.code === 401 || error.code === 403) {
      throw redirect('/login', {
        headers: {
          'Set-Cookie': getNullifiedAuthCookie(),
        },
      });
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
      error: GENERIC_ERROR_MESSAGE,
      errors: null,
      data: null,
    },
    { status: 500 },
  );
}
