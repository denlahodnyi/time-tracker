// import type { InfiniteData } from '@tanstack/react-query';

import type {
  CursorPagination,
  UserTaskDTO,
  UserTaskEntriesDTO,
  UserTasksDTO,
  UserTaskWithEntriesDTO,
} from '~/shared/api';

export interface TimeEntry {
  id: number;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface TaskBase {
  id: number;
  name: string;
  description: string;
  totalTimeSpent: number | null;
  isAuthor: boolean;
  isAssigned: boolean;
  completedAt: string | null;
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

export interface MyTaskCompletePayload {
  taskId: number;
  completedAt: Date;
}

export interface MyTaskEventSuccessReturn {
  task: UserTaskDTO;
}

// export type AllTasksQueryData = InfiniteData<{
//   tasks: TaskBase[];
//   pagination: CursorPagination;
// }>;

export interface MyTasksAnalytics {
  totalTasks: number;
  totalAvgTimeSpent: number;
  todayTotalTimeSpent: number;
  weekTotalTimeSpent: number;
  topLongest: {
    taskId: number;
    totalTimeSpent: number;
    name: string;
  }[];
  topShortest: {
    taskId: number;
    totalTimeSpent: number;
    name: string;
  }[];
}

export type TasksFilterByUrlParam = 'completed' | null;
