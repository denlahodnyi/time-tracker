import type { User } from '@libs/prisma';

export type Endpoints = '/signin' | '/signup' | '/users/me' | '/users/:userId';

export interface RecZodLikeFormErrors {
  [key: string]: undefined | RecZodLikeFormErrors | { _errors?: string[] };
}

export interface FormErrors {
  _errors?: string[];
  [key: string]: FormErrors | string[] | undefined;
}

export interface ErrorResponseData {
  status: 'error';
  error: string;
  errors: null | FormErrors;
}

export interface SuccessResponseData<TSuccessData> {
  status: 'success';
  data: TSuccessData;
}

export type ResponseData<TSuccessData = null> =
  | ErrorResponseData
  | SuccessResponseData<TSuccessData>;

// DTO's

export type UserDTO = Omit<User, 'password'>;
