import { json } from '@remix-run/node';

import type { ResponseData } from '~/shared/api';
import { getSetCookie } from '~/shared/lib';

export default function handleResponseData<
  TSuccessReturn,
  TData extends ResponseData<TSuccessReturn> = ResponseData<TSuccessReturn>,
>(data: TData, response: Response) {
  return json(
    {
      error: data.status === 'error' ? data.error : null,
      errors: data.status === 'error' ? data.errors : null,
      data: data.status === 'success' ? data.data : null,
    },
    {
      headers: {
        'Set-Cookie': getSetCookie(response),
      },
    },
  );
}
