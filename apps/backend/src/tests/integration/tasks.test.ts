import {
  createUserTasksList,
  getErrorResponseExpects,
  HttpTestContext,
  taskFactory,
  userFactory,
} from '../helpers';

const httpCtx = new HttpTestContext();

beforeEach(async () => {
  await httpCtx.prepareEach();
});

afterEach(async () => {
  await httpCtx.finishEach();
});

describe('/tasks', () => {
  describe('[GET] /tasks', () => {
    it('returns 401 status code and error status with message for unauthenticated user', async () => {
      const { body, status } = await httpCtx.agent.get('/api/tasks');

      expect(status).toBe(401);
      getErrorResponseExpects(body);
    });

    it('returns 200 status code and success status for authorized user', async () => {
      const { agent } = await httpCtx.getAuthAgent();
      const { body, status } = await agent.get('/api/tasks');

      expect(status).toBe(200);
      expect(body).toHaveProperty('status', 'success');
    });

    it('returns list of tasks with pagination object for successful request', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const tasks = await createUserTasksList(
        httpCtx.client,
        createdUser.id,
        3,
      );
      const { body, status } = await agent.get('/api/tasks?limit=5');

      expect(status).toBe(200);
      expect(body).toMatchObject({
        status: 'success',
        data: {
          // Stringify created tasks to match field types like dates with requests' result
          tasks: (JSON.parse(JSON.stringify(tasks)) as []).toReversed(),
          activeTask: null,
          pagination: {
            limit: 5,
            total: 3,
            hasMore: false,
            prevCursor: null,
            nextCursor: null,
          },
        },
      });
    });

    it('returns correctly paginated result for passed cursor', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const tasks = await createUserTasksList(
        httpCtx.client,
        createdUser.id,
        9,
      );
      const reversedTasks = tasks.toReversed();
      const { body: body1 } = await agent.get(`/api/tasks?limit=3`);

      expect(body1).toMatchObject({
        data: {
          tasks: JSON.parse(JSON.stringify(reversedTasks.slice(0, 3))) as [],
          pagination: {
            total: tasks.length,
            hasMore: true,
            nextCursor: reversedTasks[2].id,
            prevCursor: null,
          },
        },
      });

      const { body: body2 } = await agent.get(
        `/api/tasks?limit=3&cursor=${body1.data.pagination.nextCursor}`,
      );

      expect(body2).toMatchObject({
        data: {
          tasks: JSON.parse(JSON.stringify(reversedTasks.slice(3, 6))) as [],
          pagination: {
            hasMore: true,
            nextCursor: reversedTasks[5].id,
            prevCursor: reversedTasks[2].id,
          },
        },
      });

      const { body: body3 } = await agent.get(
        `/api/tasks?limit=3&cursor=${body2.data.pagination.nextCursor}`,
      );

      expect(body3).toMatchObject({
        data: {
          tasks: JSON.parse(JSON.stringify(reversedTasks.slice(6, 9))) as [],
          pagination: {
            hasMore: false,
            nextCursor: null,
            prevCursor: reversedTasks[5].id,
          },
        },
      });
    });

    it("returns active task if it's exist", async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const startedAt = new Date().toISOString();

      await taskFactory.create(
        {},
        {
          transient: {
            client: httpCtx.client,
            userId: createdUser.id,
          },
        },
      );

      const startedTask = await taskFactory.create(
        {},
        {
          transient: {
            client: httpCtx.client,
            userId: createdUser.id,
            startedAt,
          },
        },
      );
      const { body } = await agent.get('/api/tasks');

      expect(body.data.activeTask).toMatchObject({
        id: startedTask.id,
        name: startedTask.name,
        description: startedTask.description,
        totalTimeSpent: startedTask.totalTimeSpent,
        users: [
          {
            userId: createdUser.id,
            isAssigned: true,
            isAuthor: true,
          },
        ],
        timeEntries: [
          {
            userId: createdUser.id,
            taskId: startedTask.id,
            startedAt,
            finishedAt: null,
          },
        ],
      });
    });

    it("returns only user's own tasks", async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const user1 = await userFactory.create(
        {},
        { transient: { client: httpCtx.client } },
      );

      await createUserTasksList(httpCtx.client, user1.id, 3);

      const { agent: user2agent, createdUser: user2 } =
        await httpCtx.getAuthAgent();
      const user2tasks = await createUserTasksList(httpCtx.client, user2.id, 2);
      const { body, status } = await user2agent.get(`/api/tasks`);

      expect(status).toBe(200);
      expect(body).toMatchObject({
        data: {
          tasks: (JSON.parse(JSON.stringify(user2tasks)) as []).toReversed(),
          pagination: { total: 2 },
        },
      });
    });
  });

  describe('[GET] /tasks?task_id=<id>', () => {
    it('returns task with matched id', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const tasks = await taskFactory.createList(
        2,
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );
      const { body, status } = await agent.get(
        `/api/tasks?task_id=${tasks[0].id}`,
      );

      expect(status).toBe(200);
      expect(body.data.tasks).toHaveLength(1);
      expect(body.data.tasks[0]).toHaveProperty('id', tasks[0].id);
    });
  });

  describe('[GET] /tasks?task_id=<id>&filter_by=completed', () => {
    it('returns only completed task with matched id', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const tasks = await taskFactory.createList(
        2,
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );

      await agent.patch(`/api/tasks/${tasks[0].id}/event`).send({
        event: 'complete',
        completedAt: new Date().toISOString(),
      });

      const { body, status } = await agent.get(
        `/api/tasks?task_id=${tasks[0].id}&filter_by=completed`,
      );

      expect(status).toBe(200);
      expect(body.data.tasks).toHaveLength(1);
      expect(body.data.tasks[0]).toHaveProperty('id', tasks[0].id);
    });

    it("doesn't return task with matched id if it's not completed", async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const tasks = await taskFactory.createList(
        2,
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );

      const { body, status } = await agent.get(
        `/api/tasks?task_id=${tasks[0].id}&filter_by=completed`,
      );

      expect(status).toBe(200);
      expect(body.data.tasks).toHaveLength(0);
    });
  });

  describe('[POST] /tasks', () => {
    it('returns 401 status code and error status with message for unauthenticated user', async () => {
      const { body, status } = await httpCtx.agent.post('/api/tasks').send({
        name: 'Example task',
        description: 'Example description',
      });

      expect(status).toBe(401);
      getErrorResponseExpects(body);
    });

    it('returns 400 status code and error status with message if name is nullish', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent } = await httpCtx.getAuthAgent();
      const { body, status } = await agent.post('/api/tasks').send({
        name: '',
      });

      expect(status).toBe(400);
      getErrorResponseExpects(body, true);
    });

    it('returns 201 status code and success status for authorized user', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent } = await httpCtx.getAuthAgent();
      const { body, status } = await agent.post('/api/tasks').send({
        name: 'Example task',
        description: 'Example description',
      });

      expect(status).toBe(201);
      expect(body).toHaveProperty('status', 'success');
    });

    it('returns created task for authorized user on success', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const { body } = await agent.post('/api/tasks').send({
        name: 'Example task',
        description: 'Example description',
      });

      expect(body).toMatchObject({
        data: {
          task: {
            name: 'Example task',
            description: 'Example description',
            users: [
              {
                userId: createdUser.id,
                isAssigned: true,
                isAuthor: true,
              },
            ],
            totalTimeSpent: null,
          },
        },
      });
    });

    it('returns time entry if startedAt was provided', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent } = await httpCtx.getAuthAgent();
      const startedAt = new Date().toISOString();
      const { body } = await agent.post('/api/tasks').send({
        name: 'Example task',
        description: 'Example description',
        startedAt,
      });

      expect(body.data.task.timeEntries).toHaveLength(1);
      expect(body.data.task.timeEntries[0]).toMatchObject({
        startedAt,
        finishedAt: null,
      });
    });
  });

  describe('[GET] /tasks/:taskId', () => {
    it('returns 401 status code and error status with message for unauthenticated user', async () => {
      const { body, status } = await httpCtx.agent.get(`/api/tasks/1`);

      expect(status).toBe(401);
      getErrorResponseExpects(body);
    });

    it("returns 404 status code and error status with message if task doesn't exist or user doesn't own it", async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const user1 = await userFactory.create(
        {},
        { transient: { client: httpCtx.client } },
      );
      const user1Task = await taskFactory.create(
        {},
        { transient: { client: httpCtx.client, userId: user1.id } },
      );
      const { agent: user2agent } = await httpCtx.getAuthAgent();
      const { body, status } = await user2agent.get(
        `/api/tasks/${user1Task.id}`,
      );

      expect(status).toBe(404);
      getErrorResponseExpects(body);
    });

    it('returns 200 status code and single task for authorized user', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const task = await taskFactory.create(
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );
      const { body, status } = await agent.get(`/api/tasks/${task.id}`);

      expect(status).toBe(200);
      expect(body).toMatchObject({
        status: 'success',
        data: {
          task: {
            id: task.id,
            name: task.name,
            description: task.description,
            users: [
              {
                userId: createdUser.id,
                taskId: task.id,
                isAssigned: true,
                isAuthor: true,
              },
            ],
            totalTimeSpent: null,
          },
        },
      });
    });
  });

  describe('[PATCH] /tasks/:taskId', () => {
    it('returns 401 status code and error status with message for unauthenticated user', async () => {
      const { body, status } = await httpCtx.agent.patch(`/api/tasks/1`).send({
        name: 'New task name',
      });

      expect(status).toBe(401);
      getErrorResponseExpects(body);
    });

    it("returns 404 status code and error status with message if task doesn't exist or user doesn't own it", async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const user1 = await userFactory.create(
        {},
        { transient: { client: httpCtx.client } },
      );
      const user1Task = await taskFactory.create(
        {},
        { transient: { client: httpCtx.client, userId: user1.id } },
      );
      const { agent: user2agent } = await httpCtx.getAuthAgent();
      const { body, status } = await user2agent
        .patch(`/api/tasks/${user1Task.id}`)
        .send({
          name: 'New task name',
        });

      expect(status).toBe(404);
      getErrorResponseExpects(body);
    });

    it('returns 400 status code and error status with message if name is nullish', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const task = await taskFactory.create(
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );
      const { body, status } = await agent.patch(`/api/tasks/${task.id}`).send({
        name: '',
      });

      expect(status).toBe(400);
      getErrorResponseExpects(body, true);
    });

    it('returns 200 status code and updated task on success', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const task = await taskFactory.create(
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );
      const { body, status } = await agent.patch(`/api/tasks/${task.id}`).send({
        name: 'New task name',
        description: 'Roses are red...',
      });

      expect(status).toBe(200);
      expect(body).toMatchObject({
        status: 'success',
        data: {
          task: {
            id: task.id,
            name: 'New task name',
            description: 'Roses are red...',
            users: [
              {
                userId: createdUser.id,
                taskId: task.id,
                isAssigned: true,
                isAuthor: true,
              },
            ],
            totalTimeSpent: null,
          },
        },
      });
    });
  });

  describe('[DELETE] /tasks/:taskId', () => {
    it('returns 401 status code and error status with message for unauthenticated user', async () => {
      const { body, status } = await httpCtx.agent.delete(`/api/tasks/1`);

      expect(status).toBe(401);
      getErrorResponseExpects(body);
    });

    it("returns 404 status code and error status with message if task doesn't exist or user doesn't own it", async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const user1 = await userFactory.create(
        {},
        { transient: { client: httpCtx.client } },
      );
      const user1Task = await taskFactory.create(
        {},
        { transient: { client: httpCtx.client, userId: user1.id } },
      );
      const { agent: user2agent } = await httpCtx.getAuthAgent();
      const { body, status } = await user2agent.delete(
        `/api/tasks/${user1Task.id}`,
      );

      expect(status).toBe(404);
      getErrorResponseExpects(body);
    });

    it('returns 200 status code and task that was completely deleted', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const task = await taskFactory.create(
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );
      const { body, status } = await agent.delete(`/api/tasks/${task.id}`);
      const notFoundTask = await httpCtx.client.task.findUnique({
        where: { id: task.id },
      });

      expect(status).toBe(200);
      expect(body).toMatchObject({
        status: 'success',
        data: {
          task: {
            id: task.id,
            name: task.name,
            description: task.description,
            users: [
              {
                userId: createdUser.id,
                taskId: task.id,
                isAssigned: true,
                isAuthor: true,
              },
            ],
          },
        },
      });
      expect(notFoundTask).toBeNull();
    });
  });

  describe('[PATCH] /tasks/:taskId/event', () => {
    it('returns 401 status code and error status with message for unauthenticated user', async () => {
      const { body, status } = await httpCtx.agent
        .patch(`/api/tasks/1/event`)
        .send({
          event: 'start',
          startedAt: new Date().toISOString(),
        });

      expect(status).toBe(401);
      getErrorResponseExpects(body);
    });

    it("returns 404 status code and error status with message if task doesn't exist or user doesn't own it", async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const user1 = await userFactory.create(
        {},
        { transient: { client: httpCtx.client } },
      );
      const user1Task = await taskFactory.create(
        {},
        { transient: { client: httpCtx.client, userId: user1.id } },
      );
      const { agent: user2agent } = await httpCtx.getAuthAgent();
      const { body, status } = await user2agent
        .patch(`/api/tasks/${user1Task.id}/event`)
        .send({
          event: 'start',
          startedAt: new Date().toISOString(),
        });

      expect(status).toBe(404);
      getErrorResponseExpects(body);
    });

    it('returns 200 status code and task with time entry for successfully started task', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const task = await taskFactory.create(
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );
      const startedAt = new Date().toISOString();
      const { body, status } = await agent
        .patch(`/api/tasks/${task.id}/event`)
        .send({
          event: 'start',
          startedAt,
        });

      expect(status).toBe(200);
      expect(body).toMatchObject({
        status: 'success',
        data: {
          task: {
            id: task.id,
            completedAt: null,
            timeEntries: [
              {
                startedAt,
                finishedAt: null,
              },
            ],
            totalTimeSpent: null,
          },
        },
      });
    });

    it('returns 200 status code and task with time entry and spent time for successfully stopped task', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const task = await taskFactory.create(
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );
      const startDate = new Date();
      const startedAt = startDate.toISOString();
      const finishDate = new Date(new Date().setDate(startDate.getDate() + 1));
      const finishedAt = finishDate.toISOString();
      const { body: startedResp } = await agent
        .patch(`/api/tasks/${task.id}/event`)
        .send({
          event: 'start',
          startedAt,
        });
      const { body, status } = await agent
        .patch(`/api/tasks/${task.id}/event`)
        .send({
          event: 'stop',
          entryId: startedResp.data.task.timeEntries[0].id,
          finishedAt,
        });

      expect(status).toBe(200);
      expect(body).toMatchObject({
        status: 'success',
        data: {
          task: {
            id: task.id,
            timeEntries: [
              {
                startedAt,
                finishedAt,
              },
            ],
            totalTimeSpent: String(
              new Date(finishedAt).getTime() - new Date(startedAt).getTime(),
            ),
          },
        },
      });
    });

    it('returns 400 status code and error status with message when starting already active task', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const task = await taskFactory.create(
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );
      const startedAt = new Date().toISOString();

      await agent.patch(`/api/tasks/${task.id}/event`).send({
        event: 'start',
        startedAt,
      });

      const { body, status } = await agent
        .patch(`/api/tasks/${task.id}/event`)
        .send({
          event: 'start',
          startedAt,
        });

      expect(status).toBe(400);
      getErrorResponseExpects(body);
    });

    it('successfully starts new task and finishes another active one', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const tasks = await taskFactory.createList(
        2,
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );
      const startedAt = new Date().toISOString();

      const { body: prevActiveRes } = await agent
        .patch(`/api/tasks/${tasks[0].id}/event`)
        .send({
          event: 'start',
          startedAt,
        });

      const { status } = await agent
        .patch(`/api/tasks/${tasks[1].id}/event`)
        .send({
          event: 'start',
          startedAt,
        });

      const prevActive = await httpCtx.client.timeEntries.findFirst({
        where: {
          id: prevActiveRes.data.task.timeEntries[0].id,
          finishedAt: null,
        },
      });

      expect(status).toBe(200);
      expect(prevActive).toBeNull();
    });

    it('returns 200 status code and task with time entry for successfully completed task', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const task = await taskFactory.create(
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );
      const completedAt = new Date().toISOString();
      const { body, status } = await agent
        .patch(`/api/tasks/${task.id}/event`)
        .send({
          event: 'complete',
          completedAt,
        });

      expect(status).toBe(200);
      expect(body).toMatchObject({
        status: 'success',
        data: {
          task: {
            id: task.id,
            completedAt,
          },
        },
      });
    });

    it('finishes active task on completion', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const task = await taskFactory.create(
        {},
        {
          transient: {
            client: httpCtx.client,
            userId: createdUser.id,
            startedAt: new Date().toISOString(),
          },
        },
      );

      const activeTe = await httpCtx.client.timeEntries.findFirst({
        where: {
          userId: createdUser.id,
          taskId: task.id,
        },
      });

      const completedAt = new Date().toISOString();
      const { body, status } = await agent
        .patch(`/api/tasks/${task.id}/event`)
        .send({
          event: 'complete',
          completedAt,
        });

      const finishedTe = await httpCtx.client.timeEntries.findUnique({
        where: {
          id: activeTe?.id,
        },
      });

      expect(status).toBe(200);
      expect(body).toMatchObject({
        status: 'success',
        data: {
          task: {
            id: task.id,
            completedAt,
          },
        },
      });
      expect(activeTe).not.toBeNull();
      expect(finishedTe).not.toBeNull();
      expect(finishedTe?.finishedAt).toBeDefined();
    });

    it('returns 400 status code and error if task is already completed', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const task = await taskFactory.create(
        {},
        {
          transient: {
            client: httpCtx.client,
            userId: createdUser.id,
            startedAt: new Date().toISOString(),
          },
        },
      );

      await agent.patch(`/api/tasks/${task.id}/event`).send({
        event: 'complete',
        completedAt: new Date().toISOString(),
      });

      const { body, status } = await agent
        .patch(`/api/tasks/${task.id}/event`)
        .send({
          event: 'complete',
          completedAt: new Date().toISOString(),
        });

      expect(status).toBe(400);
      getErrorResponseExpects(body);
    });
  });

  describe('[GET] /tasks/:taskId/entries', () => {
    it('returns 401 status code and error status with message for unauthenticated user', async () => {
      const { body, status } = await httpCtx.agent.get(`/api/tasks/1/entries`);

      expect(status).toBe(401);
      getErrorResponseExpects(body);
    });

    it('returns 200 status code and empty array if no entries were found', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent } = await httpCtx.getAuthAgent();
      const { body, status } = await agent.get(`/api/tasks/1/entries`);

      expect(status).toBe(200);
      expect(body.data.timeEntries).toStrictEqual([]);
    });

    it('returns 200 status code and array of entries if they exist', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const task = await taskFactory.create(
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );

      const { body: startResp1 } = await agent
        .patch(`/api/tasks/${task.id}/event`)
        .send({
          event: 'start',
          startedAt: new Date().toISOString(),
        });

      await agent.patch(`/api/tasks/${task.id}/event`).send({
        event: 'stop',
        finishedAt: new Date(
          new Date().setDate(new Date().getDate() + 1),
        ).toISOString(),
        entryId: startResp1.data.task.timeEntries[0].id,
      });

      const { body: startResp2 } = await agent
        .patch(`/api/tasks/${task.id}/event`)
        .send({
          event: 'start',
          startedAt: new Date(
            new Date().setDate(new Date().getDate() + 2),
          ).toISOString(),
        });

      await agent.patch(`/api/tasks/${task.id}/event`).send({
        event: 'stop',
        finishedAt: new Date(
          new Date().setDate(new Date().getDate() + 3),
        ).toISOString(),
        entryId: startResp2.data.task.timeEntries[0].id,
      });

      const { body, status } = await agent.get(`/api/tasks/${task.id}/entries`);

      expect(status).toBe(200);
      expect(body.data.timeEntries).toHaveLength(2);
    });
  });

  describe('[GET] /tasks/search', () => {
    it('returns 401 status code and error status with message for unauthenticated user', async () => {
      const { body, status } = await httpCtx.agent.get(
        `/api/tasks/search?name=foo`,
      );

      expect(status).toBe(401);
      getErrorResponseExpects(body);
    });

    it('returns 200 status code and list of matched tasks', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const tasks = await taskFactory.createList(
        3,
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );

      const res1 = await agent.get(
        `/api/tasks/search?name=${encodeURIComponent(tasks[0].name)}`,
      );
      const res2 = await agent.get(
        `/api/tasks/search?name=${encodeURIComponent(tasks[1].name)}`,
      );
      const res3 = await agent.get(
        `/api/tasks/search?name=${encodeURIComponent(tasks[2].name)}`,
      );

      expect(res1.status).toBe(200);
      expect(res1.body.data.suggestions[0]).toMatchObject({
        id: tasks[0].id,
        name: tasks[0].name,
      });
      expect(res2.status).toBe(200);
      expect(res2.body.data.suggestions[0]).toMatchObject({
        id: tasks[1].id,
        name: tasks[1].name,
      });
      expect(res3.status).toBe(200);
      expect(res3.body.data.suggestions[0]).toMatchObject({
        id: tasks[2].id,
        name: tasks[2].name,
      });
    });

    it('returns 200 status code and list of only completed tasks', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const tasks = await taskFactory.createList(
        2,
        {},
        { transient: { client: httpCtx.client, userId: createdUser.id } },
      );

      await agent.patch(`/api/tasks/${tasks[1].id}/event`).send({
        event: 'complete',
        completedAt: new Date().toISOString(),
      });

      // must return []
      const res1 = await agent.get(
        `/api/tasks/search?filter_by=completed&name=${encodeURIComponent(tasks[0].name)}`,
      );
      // must return completed
      const res2 = await agent.get(
        `/api/tasks/search?filter_by=completed&name=${encodeURIComponent(tasks[1].name)}`,
      );

      expect(res1.status).toBe(200);
      expect(res1.body).toMatchObject({
        status: 'success',
        data: {
          suggestions: [],
        },
      });
      expect(res2.status).toBe(200);
      expect(res2.body).toMatchObject({
        status: 'success',
        data: {
          suggestions: [{ id: tasks[1].id, name: tasks[1].name }],
        },
      });
    });
  });
});
