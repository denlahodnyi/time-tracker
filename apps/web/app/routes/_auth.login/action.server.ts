import type { ActionFunctionArgs } from '@remix-run/node';

import type { LoginPayload, LoginReturn } from '~/entities/user';
import { apiClient, type ResponseData } from '~/shared/api';
import {
  handleCatchResponseError,
  handleResponseData,
  parseRequestFormData,
} from '~/shared/server-side';

export default async function action({ request }: ActionFunctionArgs) {
  const payload = (await parseRequestFormData(
    request,
  )) as unknown as LoginPayload;

  try {
    const { data, response } = await apiClient.post<
      ResponseData<LoginReturn>,
      LoginPayload
    >('/signin', payload);

    return handleResponseData<LoginReturn>(data, response);
  } catch (err) {
    return handleCatchResponseError(err);
  }
}
