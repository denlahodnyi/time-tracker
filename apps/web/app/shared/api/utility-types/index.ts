type RouteParts<
  TParams extends
    | { params: Record<string, unknown>; query?: Record<string, unknown> }
    | object = object,
> = {
  query?: Record<string, unknown>;
} & TParams;

export interface Routes {
  '/signin': RouteParts;
  '/signup': RouteParts;
  '/users/me': RouteParts;
  '/users/:userId': RouteParts<{ params: { userId: number } }>;
  '/tasks': RouteParts<{
    query: { task_id?: number; filter_by?: 'completed' };
  }>;
  '/tasks/:taskId': RouteParts<{ params: { taskId: number } }>;
  '/tasks/:taskId/event': RouteParts<{ params: { taskId: number } }>;
  '/analytics': undefined;
  '/tasks/search': RouteParts<{
    query: { name: string; filter_by?: 'completed' };
  }>;
}

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

export interface CursorPagination {
  total: number;
  limit: number;
  hasMore: boolean;
  prevCursor: number | null;
  nextCursor: number | null;
}
