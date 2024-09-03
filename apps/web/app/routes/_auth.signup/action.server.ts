import { json, type ActionFunctionArgs } from '@remix-run/node';

import type { SignUpPayload, SignUpReturn } from '~/entities/user';
import { apiClient, type FormErrors, type ResponseData } from '~/shared/api';
import { excludeObjectKeys, parseRequestFormData } from '~/shared/lib';
import {
  handleRequestError,
  handleResponseData,
} from '~/shared/lib/server-only';

export default async function action({ request }: ActionFunctionArgs) {
  const payload = await parseRequestFormData<SignUpPayload>(request);

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

    if (!data) throw new Error('Empty signup data');

    return handleResponseData<SignUpReturn>(data, response);
  } catch (err) {
    return handleRequestError(err, request);
  }
}
