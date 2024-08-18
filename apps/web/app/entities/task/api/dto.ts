// import { formatDistanceStrict } from 'date-fns';

import type {
  UserCreateTaskDTO,
  UserTaskDTO,
  UserTasksDTO,
  UserTaskWithEntriesDTO,
  UserUpdateTaskDTO,
} from '~/shared/api';
import type {
  MyTaskCreatePayload,
  MyTaskUpdatePayload,
  TaskBase,
} from '../types';

// function transformDtoStatus(status: UserTaskDTO['status']): TaskBase['status'] {
//   if (status === 'IDLE') return 'idle';
//   if (status === 'IN_PROGRESS') return 'inProgress';
//   if (status === 'DONE') return 'done';

//   throw new Error('Undefined status');
// }

// function getTimeSpent(start: Date | null, finish: Date | null) {
//   return start && finish ? formatDistanceStrict(finish, start) : null;
// }

export function userTaskFromDto(
  taskDto: UserTaskDTO | UserTaskWithEntriesDTO,
): TaskBase {
  return {
    id: taskDto.id,
    name: taskDto.name,
    description: taskDto.description || '',
    // startedAt: taskDto.startedAt ? new Date(taskDto.startedAt) : null,
    // finishedAt: taskDto.finishedAt ? new Date(taskDto.finishedAt) : null,
    // totalTimeSpent: getTimeSpent(taskDto.startedAt, taskDto.finishedAt),
    totalTimeSpent: Number(taskDto.totalTimeSpent) || null,
    // status: transformDtoStatus(taskDto.status),
    isAuthor: taskDto.users[0].isAuthor,
    isAssigned: taskDto.users[0].isAssigned,
    // timeEntries: taskDto.timeEntries,
    timeEntries: 'timeEntries' in taskDto ? taskDto.timeEntries : undefined,
  };
}

export function userTasksFromDto(tasksDto: UserTasksDTO): TaskBase[] {
  return tasksDto.map(userTaskFromDto);
}

export function userNewTaskToDto(
  newTask: MyTaskCreatePayload,
): UserCreateTaskDTO {
  return {
    name: newTask.name,
    description: newTask.description || null,
    startedAt: newTask.startedAt || null,
    // isStarted: newTask.isStarted || false,
  };
}

export function userTaskToDto(newTask: MyTaskUpdatePayload): UserUpdateTaskDTO {
  return {
    name: newTask.name,
    description: newTask.description || null,
    // startedAt: newTask.startedAt || null,
    // isStarted: newTask.isStarted || false,
  };
}
