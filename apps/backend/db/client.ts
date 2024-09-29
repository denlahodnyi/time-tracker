import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { type Prisma, PrismaClient } from '@libs/prisma';

import { env } from '../env.js';

const connectionString = env.DATABASE_URL;

type Client = ReturnType<typeof getExtendedClient>;
type TopTasks = { task_id: number; total_time: number; name: string }[];

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
        async getAllAvgTimeSpentByUser(userId: number) {
          try {
            const result = await client.$queryRaw<{ avg_time: number }[]>`
              SELECT coalesce((
                SELECT AVG(total_time) FROM (
                  SELECT SUM(ROUND(EXTRACT(EPOCH FROM (te.finished_at - te.started_at)) * 1000)) AS total_time
                  FROM time_entries AS te
                  WHERE te.user_id = ${userId}
                    AND te.started_at IS NOT NULL
                    AND te.finished_at IS NOT NULL
                  GROUP BY te.task_id
                )
              ), 0) as avg_time;
            `;

            return result[0].avg_time;
          } catch (err) {
            console.error(err);

            return 0;
          }
        },
        async getTotalTimeSpentByDate(userId: number, isoDate: string) {
          try {
            const result = await client.$queryRaw<{ total_time: number }[]>`
              SELECT (
                coalesce((
                -- get sum of all entries for the current date
                SELECT SUM(ROUND(EXTRACT(EPOCH FROM (te.finished_at - te.started_at)) * 1000)) AS total_done_time
                FROM time_entries AS te
                WHERE te.user_id = ${userId}
                  AND te.started_at IS NOT NULL
                  AND te.finished_at IS NOT NULL
                  AND date_trunc('day', te.started_at) = date_trunc('day', ${isoDate}::timestamptz)
                  AND date_trunc('day', te.finished_at) = date_trunc('day', ${isoDate}::timestamptz)
                ), 0) +
                coalesce((
                  -- get time spent for current active task at current date
                  SELECT ROUND(EXTRACT(EPOCH FROM (${isoDate}::timestamptz - date_trunc('day', ${isoDate}::timestamptz) )) * 1000) AS total_active_time
                  FROM time_entries AS te
                  WHERE te.user_id = ${userId}
                    AND te.started_at IS NOT NULL
                    AND te.finished_at IS NULL
                ), 0)
              ) as total_time
            `;

            return result[0].total_time;
          } catch (err) {
            console.error(err);

            return 0;
          }
        },
        async getTotalTimeSpentByWeek(userId: number, isoDate: string) {
          try {
            const result = await client.$queryRaw<{ total_time: number }[]>`
              SELECT (
                coalesce((
                -- get sum of all entries for the current week
                SELECT SUM(ROUND(EXTRACT(EPOCH FROM (te.finished_at - te.started_at)) * 1000)) AS total_done_time
                FROM time_entries AS te
                WHERE te.user_id = ${userId}
                  AND te.started_at IS NOT NULL
                  AND te.finished_at IS NOT NULL
                  AND date_trunc('day', te.started_at) >= date_trunc('week', ${isoDate}::timestamptz)
                  AND date_trunc('day', te.finished_at) <= date_trunc('week', ${isoDate}::timestamptz) + '1 week'
                ), 0) +
                coalesce((
                  -- get time spent for current active task at current date
                  SELECT ROUND(
                    EXTRACT(EPOCH FROM
                      (${isoDate}::timestamptz -
                        CASE
                          -- take time spent only for the current week
                          WHEN te.started_at <= date_trunc('week', ${isoDate}::timestamptz)
                            THEN date_trunc('week', ${isoDate}::timestamptz)
                          ELSE te.started_at
                        END
                      )) * 1000
                    ) AS total_active_time
                  FROM time_entries AS te
                  WHERE te.user_id = ${userId}
                    AND te.started_at IS NOT NULL
                    AND te.finished_at IS NULL
                ), 0)
              ) as total_time
            `;

            return result[0].total_time;
          } catch (err) {
            console.error(err);

            return 0;
          }
        },
        async geTopLongestByUser(userId: number, isoDate: string) {
          try {
            const result = await client.$queryRaw<TopTasks>`
              WITH active_tasks AS (
                SELECT te.task_id FROM time_entries AS te
                WHERE te.started_at IS NOT NULL AND te.finished_at is NULL
              )
              SELECT task_id, total_time, name FROM
              (
                (SELECT te.task_id, SUM(ROUND(EXTRACT(EPOCH FROM (te.finished_at - te.started_at)) * 1000)) AS total_time
                  FROM time_entries AS te
                  WHERE te.user_id = ${userId}
                    AND te.started_at IS NOT NULL
                    AND te.finished_at IS NOT NULL
                  GROUP BY te.task_id
                  -- Exclude active task. It will be calculated in separate query
                  HAVING te.task_id NOT IN (SELECT * FROM active_tasks)
                  LIMIT 5
                )
                UNION
                -- Calculate total time spent for active task
                (SELECT te.task_id,
                    SUM(
                      ROUND(
                        EXTRACT(EPOCH
                          FROM (
                            (
                            CASE
                              WHEN te.finished_at IS NULL
                                THEN ${isoDate}::timestamptz
                              ELSE te.finished_at
                            END
                            ) - te.started_at
                          )
                        )
                      * 1000)
                    ) AS total_time
                  FROM time_entries AS te
                  WHERE te.user_id = ${userId}
                    AND te.task_id IN (SELECT * FROM active_tasks)
                  GROUP BY te.task_id
                )
              ) AS topTasks
              -- Join with tasks to get their details
              JOIN tasks ON topTasks.task_id = tasks.id
              ORDER BY total_time DESC
              LIMIT 5
            `;

            return result;
          } catch (err) {
            console.error(err);

            return [];
          }
        },
        async geTopShortestByUser(userId: number, isoDate: string) {
          try {
            const result = await client.$queryRaw<TopTasks>`
              WITH active_tasks AS (
                SELECT te.task_id FROM time_entries AS te
                WHERE te.started_at IS NOT NULL AND te.finished_at is NULL
              )
              SELECT task_id, total_time, name FROM
              (
                (SELECT te.task_id, SUM(ROUND(EXTRACT(EPOCH FROM (te.finished_at - te.started_at)) * 1000)) AS total_time
                  FROM time_entries AS te
                  WHERE te.user_id = ${userId}
                    AND te.started_at IS NOT NULL
                    AND te.finished_at IS NOT NULL
                  GROUP BY te.task_id
                  -- Exclude active task. It will be calculated in separate query
                  HAVING te.task_id NOT IN (SELECT * FROM active_tasks)
                  ORDER BY total_time ASC
                  LIMIT 5
                )
                UNION
                -- Calculate total time spent for active task
                (SELECT te.task_id,
                    SUM(
                      ROUND(
                        EXTRACT(EPOCH
                          FROM (
                            (
                            CASE
                              WHEN te.finished_at IS NULL
                                THEN ${isoDate}::timestamptz
                              ELSE te.finished_at
                            END
                            ) - te.started_at
                          )
                        )
                      * 1000)
                    ) AS total_time
                  FROM time_entries AS te
                  WHERE te.user_id = ${userId}
                    AND te.task_id IN (SELECT * FROM active_tasks)
                  GROUP BY te.task_id
                )
              ) AS topTasks
              -- Join with tasks to get their details
              JOIN tasks ON topTasks.task_id = tasks.id
              ORDER BY total_time ASC
              LIMIT 5
            `;

            return result;
          } catch (err) {
            console.error(err);

            return [];
          }
        },
      },
    },
    result: {
      user: {
        avatarUrls: {
          compute() {
            return {
              original: null as null | string,
              thumbnail: null as null | string,
            };
          },
        },
      },
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
