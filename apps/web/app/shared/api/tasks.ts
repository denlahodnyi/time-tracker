import type { Prisma, TimeEntries } from '@libs/prisma';
import type { Jsonify } from 'type-fest';

// import { Prisma, P } from '@libs/prisma';

// const Prisma = P.Prisma;

// export type UserTaskDTO = Prisma.TaskGetPayload<typeof tasksWithUsers>;
export interface UserTaskDtoOrigin
  extends Prisma.TaskGetPayload<{
    include: { users: true; timeEntries: false };
  }> {
  totalTimeSpent?: string | null; // computed field, is not presence in prisma schema
}
export interface UserTaskDTO extends Jsonify<UserTaskDtoOrigin> {}

export interface UserTaskWithEntriesDtoOrigin
  extends Prisma.TaskGetPayload<{
    include: { users: true; timeEntries: true };
  }> {
  totalTimeSpent?: string | null; // computed field, is not presence in prisma schema
}
export interface UserTaskWithEntriesDTO
  extends Jsonify<UserTaskWithEntriesDtoOrigin> {}

export interface UserTasksDTO extends Array<UserTaskDTO> {}

export interface UserTaskEntriesDTO extends Array<TimeEntries> {}

export interface UserCreateTaskDTO
  extends Pick<Prisma.TaskCreateInput, 'name' | 'description'>,
    Pick<Prisma.TimeEntriesCreateInput, 'startedAt'> {}
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
