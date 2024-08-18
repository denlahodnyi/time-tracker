import type { Task } from '@libs/prisma';
import { Factory, type BuildOptions } from 'fishery';
import invariant from 'tiny-invariant';

import type { Client } from '../../../db/client.js';

interface TransientParams {
  client?: Client;
  userId?: number;
  includeTimeEntries?: boolean;
  startedAt?: string | Date | null;
}

interface TaskExtended extends Task {
  totalTimeSpent: null | number; // computed field
}

class TaskFactory extends Factory<TaskExtended, TransientParams> {
  async createList(
    number: number,
    params?: Partial<TaskExtended>,
    options?: BuildOptions<TaskExtended, TransientParams>,
  ): Promise<TaskExtended[]> {
    const { client, userId, startedAt } = options?.transient || {};

    invariant(client, 'Task factory error: client not found');
    invariant(userId, 'Task factory error: cannot create list without userId');

    const list = Array(number)
      .fill(null)
      .map(() =>
        client.task.create({
          data: {
            name: params?.name || `Task #${this.sequence()}`,
            description:
              'Aute eu excepteur mollit elit pariatur proident occaecat labore tempor occaecat aliquip.',
            users: {
              create: [
                {
                  isAssigned: true,
                  isAuthor: true,
                  user: {
                    connect: { id: userId },
                  },
                },
              ],
            },
            timeEntries: startedAt
              ? {
                  create: {
                    startedAt,
                    user: {
                      connect: {
                        id: userId,
                      },
                    },
                  },
                }
              : undefined,
          },
          include: {
            users: true,
            timeEntries: startedAt
              ? {
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                }
              : false,
          },
        }),
      );

    let results = await client.$transaction(list);

    if (results.length)
      results = results.map((o) => ({ ...o, totalTimeSpent: null }));

    return results;
  }
}

const taskFactory = TaskFactory.define<TaskExtended, TransientParams>(
  ({ params, transientParams, onCreate, sequence }) => {
    onCreate(async () => {
      const { client, userId, startedAt } = transientParams;

      invariant(client, 'Task factory error: client not found');
      invariant(userId, 'Task factory error: cannot create without userId');

      const result = await client.task.create({
        data: {
          name: params.name || `Task #${sequence}`,
          description:
            'Aute eu excepteur mollit elit pariatur proident occaecat labore tempor occaecat aliquip.',
          users: {
            create: [
              {
                isAssigned: true,
                isAuthor: true,
                user: {
                  connect: { id: userId },
                },
              },
            ],
          },
          timeEntries: startedAt
            ? {
                create: {
                  startedAt,
                  user: {
                    connect: {
                      id: userId,
                    },
                  },
                },
              }
            : undefined,
        },
        include: {
          users: true,
          timeEntries: startedAt
            ? {
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
              }
            : false,
        },
      });

      if (result) result.totalTimeSpent = null;

      return result;
    });

    return {
      id: sequence,
      name: params.name || `Task #${sequence}`,
      description:
        params.description ||
        'Sunt veniam sint mollit consectetur elit aliqua ea sunt.',
      totalTimeSpent: null,
      createdAt: params.createdAt || new Date(),
      updatedAt: params.updatedAt || new Date(),
    };
  },
);

export default taskFactory;
