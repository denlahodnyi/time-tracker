import type {
  UseInfiniteQueryResult,
  InfiniteData,
} from '@tanstack/react-query';

import type {
  CursorPagination,
  UserTaskDTO,
  UserTasksDTO,
  UserTaskWithEntriesDTO,
} from '~/shared/api';
import { UserTaskEntriesDTO } from './../../shared/api/types';

export interface TimeEntry {
  id: number;
  startedAt: Date | null;
  finishedAt: Date | null;
}

export interface TaskBase {
  id: number;
  name: string;
  description: string;
  // startedAt: Date | null;
  // finishedAt: Date | null;
  totalTimeSpent: number | null;
  isAuthor: boolean;
  isAssigned: boolean;
  // status: 'idle' | 'inProgress' | 'done';
  timeEntries?: TimeEntry[];
}

export interface MyTasksSuccessGetReturn {
  tasks: UserTasksDTO;
  activeTask: UserTaskDTO | null;
  pagination: CursorPagination;
}

export interface MyTaskEntriesGetReturn {
  timeEntries: UserTaskEntriesDTO;
}

export interface MyTaskCreatePayload {
  name: string;
  description?: string;
  startedAt?: Date | null;
}

export interface MyTaskUpdatePayload {
  taskId: number;
  name: string;
  description?: string;
}
// export type MyTaskCreatePayload = {
//   name: string;
//   description?: string;
// } & (
//   | {
//       startedAt?: Date | null;
//       isStarted?: false;
//     }
//   | {
//       startedAt: Date;
//       isStarted: true;
//     }
// );

export interface MyTaskSuccessCreateReturn {
  task: UserTaskWithEntriesDTO;
}

export interface MyTaskSuccessUpdateReturn {
  task: UserTaskDTO;
}

export interface MyTaskStopPayload {
  taskId: number;
  entryId: number;
  finishedAt: Date;
}

export interface MyTaskStartPayload {
  taskId: number;
  startedAt: Date;
}

export interface MyTaskEventSuccessReturn {
  task: UserTaskDTO;
}

// export interface AllTasksQueryData {
//   pages: { tasks: TaskBase[]; pagination: CursorPagination }[];
// }
export type AllTasksQueryData = InfiniteData<{
  tasks: TaskBase[];
  pagination: CursorPagination;
}>;
