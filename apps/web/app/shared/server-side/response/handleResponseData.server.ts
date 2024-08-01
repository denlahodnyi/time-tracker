import { json } from '@remix-run/node';

import type { ResponseData } from '~/shared/api';

export default function handleResponseData<
  TSuccessReturn,
  TData extends
    ResponseData<TSuccessReturn> | null = ResponseData<TSuccessReturn> | null,
>(data: TData, response: Response) {
  if (!data) throw new Error('Empty data');

  return json(
    {
      error: data.status === 'error' ? data.error : null,
      errors: data.status === 'error' ? data.errors : null,
      data: data.status === 'success' ? data.data : null,
    },
    {
      headers: {
        'Set-Cookie': response.headers.get('Set-Cookie') || '',
      },
    },
  );
}
