import { GENERIC_ERROR_MESSAGE } from '~/shared/constants';
import ClientError from './lib/ClientError';
import { isSSR } from '../lib';

interface OnAuthErrorCommand {
  error?: ClientError;
  skip?: boolean;
}

export interface ClientRequestOptions {
  fetchOpts?: RequestInit;
  onAuthError?: (param: {
    error: ClientError;
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  }) => void | OnAuthErrorCommand;
}

interface ResponseHandlerOptions {
  onAuthError?: ClientRequestOptions['onAuthError'];
}

const commonFetchOptions: RequestInit = {
  // @TODO: set same-site on production?
  credentials: 'include',
};

class ApiClient {
  public baseUrl: string | null = null;

  constructor(baseUrl: string | null = null) {
    this.baseUrl = baseUrl;
  }

  public static getDefaultBaseUrl() {
    return isSSR ? process.env.API_URL : window.ENV.API_URL;
  }

  protected makeFullEndpoint(path: string) {
    return (this.baseUrl || ApiClient.getDefaultBaseUrl()) + path;
  }

  public handleResponse<TResponseData>(
    response: Response,
    options: ResponseHandlerOptions,
  ): Promise<TResponseData | null> {
    if (!response.ok) {
      if ([401, 403].includes(response.status)) {
        const authError = new ClientError('Authentication is required', {
          code: response.status,
        });
        const c: OnAuthErrorCommand = options.onAuthError
          ? options.onAuthError({
              error: authError,
            }) ?? { skip: true }
          : { error: authError };

        if (c?.error) throw c.error;
        if (c?.skip) return Promise.resolve(null);
      }
      if (
        response.status < 500 &&
        response.headers.get('Content-Type')?.includes('application/json')
      ) {
        return response.json();
      } else {
        throw new ClientError('HTTP error', { code: response.status });
      }
    }

    return response.json();
  }

  public catchError(error: unknown) {
    if (error instanceof ClientError) return error;

    return new ClientError(
      error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE,
      { code: 400 },
    );
  }

  public async get<TResponseData>(
    path: string,
    requestOptions?: ClientRequestOptions,
  ) {
    try {
      const { fetchOpts, onAuthError } = requestOptions || {};
      const response = await fetch(this.makeFullEndpoint(path), {
        method: 'GET',
        ...commonFetchOptions,
        ...(fetchOpts || {}),
        headers: {
          ...(fetchOpts?.headers || {}),
        },
      });

      const data = await this.handleResponse<TResponseData>(response, {
        onAuthError,
      });

      return { data, response };
    } catch (error) {
      throw this.catchError(error);
    }
  }

  public async post<TResponseData, TBody extends object>(
    path: string,
    body: TBody,
    requestOptions?: ClientRequestOptions,
  ) {
    const { fetchOpts, onAuthError } = requestOptions || {};
    const isFormData = body instanceof FormData;

    try {
      const response = await fetch(this.makeFullEndpoint(path), {
        method: 'POST',
        ...commonFetchOptions,
        ...(fetchOpts || {}),
        headers: {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...(fetchOpts?.headers || {}),
        },
        body: isFormData ? body : JSON.stringify(body),
      });

      const data = await this.handleResponse<TResponseData>(response, {
        onAuthError,
      });

      return { data, response };
    } catch (error) {
      throw this.catchError(error);
    }
  }

  public async delete<TResponseData>(
    path: string,
    requestOptions?: ClientRequestOptions,
  ) {
    const { fetchOpts, onAuthError } = requestOptions || {};

    try {
      const response = await fetch(this.makeFullEndpoint(path), {
        method: 'DELETE',
        ...commonFetchOptions,
        ...(fetchOpts || {}),
        headers: {
          'Content-Type': 'application/json',
          ...(fetchOpts?.headers || {}),
        },
      });
      const data = await this.handleResponse<TResponseData>(response, {
        onAuthError,
      });

      return { data, response };
    } catch (error) {
      throw this.catchError(error);
    }
  }
}

const apiClient = new ApiClient();

export { ApiClient, apiClient };
