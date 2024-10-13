import type { SeedClient } from '@snaplet/seed';
import { hashPassword } from './utils';
import tasks from './tasks.json';

const users = [
  {
    name: 'Den',
    password: '12345',
  },
  {
    name: 'Jack',
    password: '12345',
  },
];

export default async function seedData(seed: SeedClient) {
  const store = await seed.user((x) =>
    x(users.length, (modelCtx) => ({
      firstName: users[modelCtx.index].name,
      avatar: null,
      avatarThumbnail: null,
      email(ctx) {
        return ctx.data.firstName!.toLowerCase() + '@dev.dev';
      },
      async password(ctx) {
        const hash = await hashPassword(users[modelCtx.index].password);
        return hash;
      },
    }))
  );

  await seed.task(
    (x) =>
      x(tasks.length, (modelCtx) => ({
        name: () => tasks[modelCtx.index].name,
        completedAt: tasks[modelCtx.index].completed
          ? tasks[modelCtx.index].time.at(-1)!.finish
          : null,
        user_tasks: (x) =>
          // Create tasks for a single user
          x(1, {
            isAssigned: true,
            isAuthor: true,
          }),
        time_entries: (x) =>
          x(tasks[modelCtx.index].time.length, (ctx) => ({
            startedAt: tasks[modelCtx.index].time[ctx.index].start,
            finishedAt: tasks[modelCtx.index].time[ctx.index].finish,
          })),
      })),
    {
      connect: {
        user: [store.user.at(0)!],
      },
    }
  );
}
