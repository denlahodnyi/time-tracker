import {
  constructEndpoint,
  type ApiClient,
  type ClientRequestOptions,
  type ResponseData,
} from '~/shared/api';
import { dtoToUser } from './dto';
import type { UserPayload, UserSuccessData } from '../model';

class UserService {
  constructor(private client: ApiClient) {}

  async getCurrentUser(requestOptions?: ClientRequestOptions) {
    const { data, response } = await this.client.get<
      ResponseData<UserSuccessData>
    >(constructEndpoint('/users/me'), requestOptions);

    if (!data || data.status === 'error') {
      throw new Error(data?.error || 'Cannot fetch current user');
    }

    return { user: dtoToUser(data.data.user), response };
  }

  async updateCurrentUser(
    payload: UserPayload,
    requestOptions?: ClientRequestOptions,
  ) {
    const { data, response } = await this.client.post<
      ResponseData<UserSuccessData>,
      UserPayload
    >(constructEndpoint('/users/me'), payload, {
      fetchOpts: {
        method: 'PATCH',
        ...(requestOptions?.fetchOpts || {}),
      },
      onAuthError: requestOptions?.onAuthError,
    });

    if (!data) throw new Error('Empty data');

    return {
      result: {
        error: data.status === 'error' ? data.error : null,
        errors: data.status === 'error' ? data.errors : null,
        data:
          data.status === 'success'
            ? { user: dtoToUser(data.data.user) }
            : null,
      },
      response,
    };
  }

  async deleteCurrentUser(requestOptions?: ClientRequestOptions) {
    const { data, response } = await this.client.delete<
      ResponseData<UserSuccessData>
    >(constructEndpoint('/users/me'), {
      fetchOpts: {
        ...(requestOptions?.fetchOpts || {}),
      },
    });

    if (!data) throw new Error('Empty data');

    return {
      result: {
        error: data.status === 'error' ? data.error : null,
        errors: data.status === 'error' ? data.errors : null,
        data:
          data.status === 'success'
            ? { user: dtoToUser(data.data.user) }
            : null,
      },
      response,
    };
  }
}

export { UserService };