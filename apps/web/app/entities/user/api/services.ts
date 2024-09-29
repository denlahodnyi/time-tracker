import {
  constructEndpoint,
  type ApiClient,
  type ClientRequestOptions,
  type ResponseData,
  type ServiceMethodReturn,
} from '~/shared/api';
import { dtoToUser } from './dto';
import type {
  AvatarUploadPayload,
  UserPayload,
  UserSuccessData,
} from '../model';

class UserService {
  constructor(private client: ApiClient) {}

  async getCurrentUser(requestOptions?: ClientRequestOptions) {
    const { data, response } = await this.client.get<
      ResponseData<UserSuccessData>
    >(constructEndpoint('/users/me'), requestOptions);

    if (!data || data.status === 'error') {
      throw new Error(data?.error || 'Cannot fetch current user');
    }

    return {
      result: {
        data: {
          user: dtoToUser(data.data.user),
        },
        error: null,
        errors: null,
      },
      response,
    } satisfies ServiceMethodReturn;
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
    } satisfies ServiceMethodReturn;
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
    } satisfies ServiceMethodReturn;
  }

  async uploadAvatar(
    payload: AvatarUploadPayload,
    requestOptions?: ClientRequestOptions,
  ) {
    const formData = new FormData();

    formData.append('avatar', payload.avatar);

    const { data, response } = await this.client.post<
      ResponseData<UserSuccessData>,
      FormData
    >(constructEndpoint('/users/me/avatar'), formData, {
      ...(requestOptions || {}),
      fetchOpts: {
        ...(requestOptions?.fetchOpts || {}),
        method: 'PUT',
      },
    });

    if (!data) throw new Error('Some error happen during avatar upload');

    return {
      response,
      result: {
        data:
          data.status === 'success'
            ? { user: dtoToUser(data.data.user) }
            : null,
        error: data.status === 'success' ? null : data.error,
        errors: data.status === 'success' ? null : data.errors,
      },
    } satisfies ServiceMethodReturn;
  }

  async deleteAvatar(requestOptions?: ClientRequestOptions) {
    const { data, response } = await this.client.delete<
      ResponseData<UserSuccessData>
    >(constructEndpoint('/users/me/avatar'), requestOptions);

    if (!data) throw new Error('Some error happen during avatar deleting');

    return {
      response,
      result: {
        data:
          data.status === 'success'
            ? { user: dtoToUser(data.data.user) }
            : null,
        error: data.status === 'success' ? null : data.error,
        errors: data.status === 'success' ? null : data.errors,
      },
    } satisfies ServiceMethodReturn;
  }
}

export { UserService };
