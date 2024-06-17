export interface RecursiveFormFields {
  [key: string]: string[] | RecursiveFormFields;
}

export interface ApiErrorConfig {
  code?: number;
  name?: string;
  formFields?: RecursiveFormFields;
  message: string;
}

export default class ApiError extends Error {
  code: number;
  formFields: RecursiveFormFields | null;
  constructor(config: ApiErrorConfig) {
    super(config.message);
    this.code = config?.code || 500;
    this.name = config?.name || 'ApiError';
    this.formFields = config?.formFields || null;
  }
}
