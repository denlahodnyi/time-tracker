import type {
  UserCreateTaskDTO,
  UserTaskDTO,
  UserTasksAnalyticsDTO,
  UserTasksDTO,
  UserTaskWithEntriesDTO,
  UserUpdateTaskDTO,
} from '~/shared/api';
import type {
  MyTaskCreatePayload,
  MyTasksAnalytics,
  MyTaskUpdatePayload,
  TaskBase,
} from '../model';

export function userTaskFromDto(
  taskDto: UserTaskDTO | UserTaskWithEntriesDTO,
): TaskBase {
  return {
    id: taskDto.id,
    name: taskDto.name,
    description: taskDto.description || '',
    totalTimeSpent: Number(taskDto.totalTimeSpent) || null,
    isAuthor: taskDto.users[0].isAuthor,
    isAssigned: taskDto.users[0].isAssigned,
    // timeEntries: taskDto.timeEntries,
    completedAt: taskDto.completedAt || null,
    timeEntries: 'timeEntries' in taskDto ? taskDto.timeEntries : undefined,
  };
}

export function userTasksFromDto(tasksDto: UserTasksDTO): TaskBase[] {
  return tasksDto.map(userTaskFromDto);
}

export function userTasksAnalyticsFromDto(
  data: UserTasksAnalyticsDTO,
): MyTasksAnalytics {
  return {
    ...data,
    totalAvgTimeSpent: Number(data.totalAvgTimeSpent),
    todayTotalTimeSpent: Number(data.todayTotalTimeSpent),
    weekTotalTimeSpent: Number(data.weekTotalTimeSpent),
    topLongest: data.topLongest.map((o) => ({
      name: o.name,
      totalTimeSpent: Number(o.total_time),
      taskId: o.task_id,
    })),
    topShortest: data.topShortest.map((o) => ({
      name: o.name,
      totalTimeSpent: Number(o.total_time),
      taskId: o.task_id,
    })),
  };
}

export function userNewTaskToDto(
  newTask: MyTaskCreatePayload,
): UserCreateTaskDTO {
  return {
    name: newTask.name,
    description: newTask.description || null,
    startedAt: newTask.startedAt || null,
  };
}

export function userTaskToDto(newTask: MyTaskUpdatePayload): UserUpdateTaskDTO {
  return {
    name: newTask.name,
    description: newTask.description || null,
  };
}
