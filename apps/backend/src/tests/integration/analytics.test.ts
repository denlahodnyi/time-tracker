import {
  createUserTasksList,
  getErrorResponseExpects,
  HttpTestContext,
} from '../helpers';

const httpCtx = new HttpTestContext();

beforeEach(async () => {
  await httpCtx.prepareEach();
});

afterEach(async () => {
  await httpCtx.finishEach();
});

const analyticsEndpoint = '/api/analytics';

describe('/analytics', () => {
  describe('[GET] /analytics', () => {
    it('returns 401 status code and error status with message for unauthenticated user', async () => {
      const { body, status } = await httpCtx.agent.get(analyticsEndpoint);

      expect(status).toBe(401);
      getErrorResponseExpects(body);
    });

    it('returns 200 status code and success status for authorized user', async () => {
      const { agent } = await httpCtx.getAuthAgent();
      const { body, status } = await agent.get(analyticsEndpoint);

      expect(status).toBe(200);
      expect(body).toHaveProperty('status', 'success');
    });

    it('returns correct nullified stats on success', async () => {
      const { agent } = await httpCtx.getAuthAgent();
      const { body } = await agent.get(analyticsEndpoint);

      expect(body).toHaveProperty('data.totalTasks', 0);
      expect(body).toHaveProperty('data.totalAvgTimeSpent', '0');
      expect(body).toHaveProperty('data.todayTotalTimeSpent', '0');
      expect(body).toHaveProperty('data.weekTotalTimeSpent', '0');
      expect(body).toHaveProperty('data.topLongest', []);
      expect(body).toHaveProperty('data.topShortest', []);
    });

    it('returns correct totalTasks', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();

      await createUserTasksList(httpCtx.client, createdUser.id, 2);

      const { body } = await agent.get(analyticsEndpoint);

      expect(body).toHaveProperty('data.totalTasks', 2);
    });

    it('returns correct totalAvgTimeSpent', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();

      const tasks = await createUserTasksList(
        httpCtx.client,
        createdUser.id,
        2,
      );
      const dates = [
        {
          startedAt: new Date(2024, 8, 1, 10, 0, 0, 0),
          finishedAt: new Date(2024, 8, 1, 12, 0, 0, 0),
        },
        {
          startedAt: new Date(2024, 8, 1, 14, 0, 0, 0),
          finishedAt: new Date(2024, 8, 1, 15, 0, 0, 0),
        },
        {
          startedAt: new Date(2024, 8, 1, 16, 0, 0, 0),
          finishedAt: new Date(2024, 8, 1, 18, 0, 0, 0),
        },
      ];
      const avg =
        (dates[0].finishedAt.getTime() -
          dates[0].startedAt.getTime() +
          (dates[1].finishedAt.getTime() - dates[1].startedAt.getTime()) +
          (dates[2].finishedAt.getTime() - dates[2].startedAt.getTime())) /
        tasks.length;

      await httpCtx.client.timeEntries.createMany({
        data: [
          {
            taskId: tasks[0].id,
            userId: createdUser.id,
            startedAt: dates[0].startedAt.toISOString(),
            finishedAt: dates[0].finishedAt.toISOString(),
          },
          {
            taskId: tasks[0].id,
            userId: createdUser.id,
            startedAt: dates[1].startedAt.toISOString(),
            finishedAt: dates[1].finishedAt.toISOString(),
          },
          {
            taskId: tasks[1].id,
            userId: createdUser.id,
            startedAt: dates[2].startedAt.toISOString(),
            finishedAt: dates[2].finishedAt.toISOString(),
          },
        ],
      });

      const { body } = await agent.get(analyticsEndpoint);

      expect(body).toHaveProperty('data.totalTasks', 2);
      expect(body).toHaveProperty('data.totalAvgTimeSpent', avg.toString());
    });

    // TODO: add more tests
  });
});
