import { type Prisma } from '@libs/prisma';
import { z } from 'zod';
import { isValid, parseISO } from 'date-fns';

import { ModelBase } from '../core/classes/index.js';
import { errorFactory } from '../core/helpers/index.js';

const NAME_MIN = 1;

const CreateTaskInput = z.object({
  name: z.string().trim().min(NAME_MIN),
  description: z.string().trim().nullable().optional(),
  startedAt: z.coerce.date().nullable().optional(),
}) satisfies z.Schema<Prisma.TaskCreateInput>;

const UpdateTaskInput = z.object({
  name: z.string().trim().min(NAME_MIN),
  description: z.string().trim().nullable().optional(),
}) satisfies z.Schema<Prisma.TaskUpdateInput>;

const StartEventInput = z.object({
  startedAt: z.coerce.date(),
});

const StopEventInput = z.object({
  entryId: z.number(),
  finishedAt: z.coerce.date(),
});

const UserIdInput = z.number();
const TaskIdInput = z.number();

const parseUserId = (userId: number) => {
  const { success } = UserIdInput.safeParse(userId);

  if (!success)
    throw errorFactory.create('bad_request', { message: 'Invalid id param' });
};
const parseTaskId = (userId: number) => {
  const { success } = TaskIdInput.safeParse(userId);

  if (!success)
    throw errorFactory.create('bad_request', { message: 'Invalid id param' });
};
const parseClientDate = (isoDate: string) => {
  const { success } = z
    .string()
    .refine((val) => isValid(parseISO(val)), 'Invalid client date')
    .safeParse(isoDate);

  return success;
};

const ITEMS_BEYOND_LIMIT = 1;
const LIMIT = 10;

export default class Task extends ModelBase {
  async create(userId: number, data: z.infer<typeof CreateTaskInput>) {
    parseUserId(userId);
    CreateTaskInput.parse(data);

    let entries;

    if (data.startedAt) {
      entries = {
        create: [
          {
            startedAt: data.startedAt,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        ],
      };
    }

    const task = await this.client.task.create({
      data: {
        name: data.name,
        description: data.description,
        users: {
          create: [
            {
              isAssigned: true,
              isAuthor: true,
              user: {
                connect: {
                  id: userId,
                },
              },
            },
          ],
        },
        timeEntries: entries,
      },
      include: {
        users: true,
        timeEntries: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    return { task };
  }

  async getAll(
    userId: number,
    options?: {
      pagination?: { limit: number; cursor?: number | null };
      includeActiveTask?: boolean;
    },
  ) {
    parseUserId(userId);

    const { pagination, includeActiveTask } = options || {};
    const { limit = LIMIT, cursor } = pagination || {};
    let activeTask: Prisma.Result<
      typeof this.client.task,
      { include: { users: true } },
      'findFirst'
    > = null;

    // eslint-disable-next-line prefer-const
    let [total, tasks, active] = await Promise.all([
      this.client.task.count({
        where: {
          users: {
            some: { userId },
          },
        },
      }),
      this.client.task.findMany({
        // Fetch additional tasks but don't include them to check wether it hasMore
        take: limit + ITEMS_BEYOND_LIMIT,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { id: 'desc' },
        where: {
          users: {
            some: { userId },
          },
        },
        include: { users: true, timeEntries: false },
      }),
      includeActiveTask &&
        this.client.task.findFirst({
          where: {
            timeEntries: {
              some: {
                startedAt: { not: null },
                finishedAt: null,
              },
            },
            users: {
              some: { userId, isAssigned: true, isAuthor: true },
            },
          },
          include: {
            users: true,
            timeEntries: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        }),
    ]);

    activeTask = active || null;

    const hasMore = tasks.length === limit + ITEMS_BEYOND_LIMIT;

    tasks =
      ITEMS_BEYOND_LIMIT && tasks.length > limit && tasks.length > 1
        ? tasks.slice(0, -1)
        : tasks;

    if (tasks.length) {
      const tasksPromises = tasks.map(async (task) => {
        task.totalTimeSpent = await this.client.task.getTotalTimeSpent(
          userId,
          task.id,
        );

        return task;
      });

      tasks = await Promise.all(tasksPromises);
    }
    if (active) {
      active.totalTimeSpent = await this.client.task.getTotalTimeSpent(
        userId,
        active.id,
      );
    }

    return {
      tasks,
      activeTask,
      pagination: {
        total,
        limit,
        hasMore,
        prevCursor: cursor || null,
        nextCursor: hasMore ? tasks.at(-1)?.id || null : null,
      },
    };
  }

  async getById(userId: number, taskId: number) {
    parseUserId(userId);
    parseTaskId(taskId);

    const [task, timeSpent] = await Promise.all([
      this.client.task.findUnique({
        where: {
          id: taskId,
          users: {
            every: { userId },
          },
        },
        include: { users: true, timeEntries: false },
      }),
      this.client.task.getTotalTimeSpent(userId, taskId),
    ]);

    if (!task) {
      throw errorFactory.create('not_found', { message: 'Task not found' });
    }
    if (task && timeSpent) {
      task.totalTimeSpent = timeSpent;
    }

    return { task };
  }

  async getEntries(userId: number, taskId: number) {
    parseUserId(userId);
    parseTaskId(taskId);

    const timeEntries = await this.client.timeEntries.findMany({
      where: {
        userId,
        taskId,
      },
    });

    return { timeEntries };
  }

  async deleteById(userId: number, taskId: number) {
    parseUserId(userId);
    parseTaskId(taskId);

    const existedTask = await this.client.task.findUnique({
      where: {
        id: taskId,
        users: {
          some: { userId },
        },
      },
    });

    if (!existedTask) {
      throw errorFactory.create('not_found', { message: 'Task not found' });
    }

    const task = await this.client.task.delete({
      where: { id: taskId },
      include: { users: true, timeEntries: false },
    });

    return { task };
  }

  async updateById(
    userId: number,
    taskId: number,
    data: z.infer<typeof UpdateTaskInput>,
  ) {
    parseUserId(userId);
    parseTaskId(taskId);
    UpdateTaskInput.parse(data);

    const existedTask = await this.client.task.findUnique({
      where: {
        id: taskId,
        users: {
          some: { userId },
        },
      },
    });

    if (!existedTask) {
      throw errorFactory.create('not_found', { message: 'Task not found' });
    }

    const [task, totalTime] = await Promise.all([
      this.client.task.update({
        data: {
          name: data.name,
          description: data.description,
        },
        where: {
          id: taskId,
          users: {
            some: {
              userId,
            },
          },
        },
        include: { users: true, timeEntries: false },
      }),
      this.client.task.getTotalTimeSpent(userId, taskId),
    ]);

    if (task && totalTime) {
      task.totalTimeSpent = totalTime;
    }

    return { task };
  }

  async start(
    userId: number,
    taskId: number,
    data: z.infer<typeof StartEventInput>,
  ) {
    parseUserId(userId);
    parseTaskId(taskId);
    StartEventInput.parse(data);

    const existedTask = await this.client.task.findUnique({
      where: {
        id: taskId,
        users: {
          some: { userId },
        },
      },
    });

    if (!existedTask) {
      throw errorFactory.create('not_found', { message: 'Task not found' });
    }

    const active = await this.client.timeEntries.findFirst({
      where: {
        taskId,
        userId,
        finishedAt: null,
        NOT: {
          startedAt: null,
        },
      },
    });

    if (active) {
      throw errorFactory.create('bad_request', {
        message: 'Task is already in progress',
      });
    }

    const [task, timeSpent] = await Promise.all([
      this.client.task.update({
        data: {
          timeEntries: {
            create: [
              {
                startedAt: data.startedAt,
                user: {
                  connect: {
                    id: userId,
                  },
                },
              },
            ],
          },
        },
        where: {
          id: taskId,
          users: {
            some: { userId },
          },
        },
        include: {
          users: true,
          timeEntries: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      }),
      this.client.task.getTotalTimeSpent(userId, taskId),
    ]);

    if (task && timeSpent) {
      task.totalTimeSpent = timeSpent;
    }

    return { task };
  }

  async stop(
    userId: number,
    taskId: number,
    data: z.infer<typeof StopEventInput>,
  ) {
    parseUserId(userId);
    parseTaskId(taskId);
    StopEventInput.parse(data);

    const existedTask = await this.client.task.findUnique({
      where: {
        id: taskId,
        users: {
          some: { userId },
        },
      },
    });

    if (!existedTask) {
      throw errorFactory.create('not_found', { message: 'Task not found' });
    }

    const task = await this.client.task.update({
      data: {
        timeEntries: {
          update: {
            data: {
              finishedAt: data.finishedAt,
            },
            where: {
              id: data.entryId,
            },
          },
        },
      },
      where: {
        id: taskId,
      },
      include: {
        users: true,
        timeEntries: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    const timeSpent = await this.client.task.getTotalTimeSpent(userId, taskId);

    if (task && timeSpent) {
      task.totalTimeSpent = timeSpent;
    }

    return { task };
  }

  async getAnalytics(userId: number, userIsoDate?: string) {
    parseUserId(userId);

    if (!userIsoDate) {
      console.warn('User date was not provided. Server date will be used');
    }

    let clientDate = new Date().toISOString();

    if (userIsoDate && parseClientDate(userIsoDate)) {
      clientDate = userIsoDate;
    }

    const [
      { _all: totalTasks },
      totalAvgTimeSpent,
      todayTotalTimeSpent,
      weekTotalTimeSpent,
      topLongest,
      topShortest,
    ] = await Promise.all([
      this.client.userTasks.count({
        select: { _all: true },
        where: { userId, isAssigned: true, isAuthor: true },
      }),
      this.client.task.getAllAvgTimeSpentByUser(userId),
      this.client.task.getTotalTimeSpentByDate(userId, clientDate),
      this.client.task.getTotalTimeSpentByWeek(userId, clientDate),
      this.client.task.geTopLongestByUser(userId, clientDate),
      this.client.task.geTopShortestByUser(userId, clientDate),
    ]);

    return {
      totalTasks,
      totalAvgTimeSpent,
      todayTotalTimeSpent,
      weekTotalTimeSpent,
      topLongest,
      topShortest,
    };
  }
}
