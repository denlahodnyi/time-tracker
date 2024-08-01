import type { CustomFormErrors } from '../types';

export interface ApiErrorConfig {
  code?: number;
  name?: string;
  formFields?: CustomFormErrors;
  message: string;
}

export default class ApiError extends Error {
  code: number;
  formFields: CustomFormErrors | null;
  constructor(config: ApiErrorConfig) {
    super(config.message);
    this.code = config?.code || 500;
    this.name = config?.name || 'ApiError';
    this.formFields = config?.formFields || null;
  }
}
