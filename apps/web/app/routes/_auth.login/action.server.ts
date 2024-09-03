import type { ActionFunctionArgs } from '@remix-run/node';

import type { LoginPayload, LoginReturn } from '~/entities/user';
import { apiClient, type ResponseData } from '~/shared/api';
import { parseRequestFormData } from '~/shared/lib';
import {
  handleRequestError,
  handleResponseData,
} from '~/shared/lib/server-only';

export default async function action({ request }: ActionFunctionArgs) {
  const payload = await parseRequestFormData<LoginPayload>(request);

  try {
    const { data, response } = await apiClient.post<
      ResponseData<LoginReturn>,
      LoginPayload
    >('/signin', payload);

    if (!data) throw new Error('Empty signin data');

    return handleResponseData<LoginReturn>(data, response);
  } catch (err) {
    return handleRequestError(err, request);
  }
}
