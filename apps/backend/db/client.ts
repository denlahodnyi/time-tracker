import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { type Prisma, PrismaClient } from '@libs/prisma';

import { env } from '../env.js';

const connectionString = env.DATABASE_URL;

type Client = ReturnType<typeof getExtendedClient>;

let client: Client;

function getExtendedClient(options: Prisma.PrismaClientOptions) {
  return new PrismaClient(options).$extends({
    model: {
      task: {
        async getTotalTimeSpent(userId: number, taskId: number) {
          try {
            const result = await client.$queryRaw<{ total_time: number }[]>`
              SELECT SUM(ROUND(EXTRACT(EPOCH FROM (te.finished_at - te.started_at)) * 1000)) AS total_time
              FROM time_entries AS te
              WHERE te.task_id = ${taskId}
                AND te.user_id = ${userId}
                AND te.started_at IS NOT NULL
                AND te.finished_at IS NOT NULL
            `;

            return result[0].total_time || null;
          } catch (err) {
            console.error(err);

            return null;
          }
        },
      },
    },
    result: {
      task: {
        totalTimeSpent: {
          compute() {
            return null as null | number;
          },
        },
      },
    },
  });
}

interface InitClientConfig {
  pool?: pg.Pool;
  clientOptions?: Prisma.PrismaClientOptions;
  adapterOptions?: ConstructorParameters<typeof PrismaPg>[1];
}

function initializeClient(config?: InitClientConfig) {
  const poolInstance = config?.pool ?? new pg.Pool({ connectionString });
  const adapter = new PrismaPg(poolInstance, config?.adapterOptions);

  client = getExtendedClient({ adapter, ...(config?.clientOptions || {}) });

  return client;
}

export { client, initializeClient, type Client };
