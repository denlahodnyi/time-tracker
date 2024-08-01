import { json, type ActionFunctionArgs } from '@remix-run/node';

import type { SignUpPayload, SignUpReturn } from '~/entities/user';
import { apiClient, type FormErrors, type ResponseData } from '~/shared/api';
import { excludeObjectKeys } from '~/shared/lib';
import {
  handleCatchResponseError,
  handleResponseData,
  parseRequestFormData,
} from '~/shared/server-side';

export default async function action({ request }: ActionFunctionArgs) {
  const payload = (await parseRequestFormData(
    request,
  )) as unknown as SignUpPayload;

  if (payload.confirmedPassword !== payload.password) {
    return json({
      data: null,
      error: null,
      errors: {
        confirmedPassword: {
          _errors: ["Passwords don't match"],
        },
      } satisfies FormErrors,
    });
  }

  try {
    const { data, response } = await apiClient.post<
      ResponseData<SignUpReturn>,
      Omit<SignUpPayload, 'confirmedPassword'>
    >('/signup', excludeObjectKeys(payload, ['confirmedPassword']));

    return handleResponseData<SignUpReturn>(data, response);
  } catch (err) {
    return handleCatchResponseError(err);
  }
}
