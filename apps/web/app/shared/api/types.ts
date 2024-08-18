import {
  type User,
  type Prisma,
  type TimeEntries,
  // type Task,
} from '@libs/prisma';
// import { Prisma, P } from '@libs/prisma';

// const Prisma = P.Prisma;

type RouteParts<
  TParams extends { params: Record<string, unknown> } | object = object,
> = {
  query?: Record<string, unknown>;
} & TParams;

export interface Routes {
  '/signin': RouteParts;
  '/signup': RouteParts;
  '/users/me': RouteParts;
  '/users/:userId': RouteParts<{ params: { userId: number } }>;
  '/tasks': RouteParts;
  '/tasks/:taskId': RouteParts<{ params: { taskId: number } }>;
  '/tasks/:taskId/event': RouteParts<{ params: { taskId: number } }>;
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

// DTO's

// const tasksWithUsers = Prisma.validator<Prisma.TaskDefaultArgs>()({
//   include: { users: true },
// });

export type UserDTO = Omit<User, 'password'>;
// export type UserTaskDTO = Prisma.TaskGetPayload<typeof tasksWithUsers>;
export interface UserTaskDTO
  extends Prisma.TaskGetPayload<{
    include: { users: true; timeEntries: false };
  }> {
  totalTimeSpent?: string | null; // computed field, is not presence in prisma schema
}

export interface UserTaskWithEntriesDTO
  extends Prisma.TaskGetPayload<{
    include: { users: true; timeEntries: true };
  }> {
  totalTimeSpent?: string | null; // computed field, is not presence in prisma schema
}

export type UserTasksDTO = UserTaskDTO[];

export type UserTaskEntriesDTO = TimeEntries[];

export interface UserCreateTaskDTO
  extends Pick<Prisma.TaskCreateInput, 'name' | 'description'>,
    Pick<Prisma.TimeEntriesCreateInput, 'startedAt'> {
  // isStarted: boolean; // TODO: do I need this?
}
export type UserUpdateTaskDTO = Pick<
  Prisma.TaskUpdateInput,
  'name' | 'description'
>;
export interface UserStartTaskDTO
  extends Partial<Pick<TimeEntries, 'startedAt'>> {
  event: 'start';
}
export interface UserStopTaskDTO
  extends Required<Pick<TimeEntries, 'finishedAt'>> {
  entryId: TimeEntries['id'];
  event: 'stop';
}

export interface CursorPagination {
  total: number;
  limit: number;
  hasMore: boolean;
  prevCursor: number | null;
  nextCursor: number | null;
}
