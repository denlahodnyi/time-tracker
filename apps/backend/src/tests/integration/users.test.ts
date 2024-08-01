import {
  HttpTestContext,
  userFactory,
  getErrorResponseExpects,
} from '../helpers/index.js';
import { excludeObjectKeys } from '../../utils/index.js';

const httpCtx = new HttpTestContext();
const dummyUser = userFactory.build();

beforeEach(async () => {
  await httpCtx.prepareEach();
});

afterEach(async () => {
  await httpCtx.finishEach();
});

describe('/users', () => {
  describe('[GET] /users/:user_id', () => {
    it('returns 200 status code and success status for authorized user', async () => {
      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const { body, status } = await agent.get(`/api/users/${createdUser.id}`);

      expect(status).toBe(200);
      expect(body).toHaveProperty('status', 'success');
    });

    it('returns user details without password for authorized user', async () => {
      const { agent, createdUser, dummyUser } = await httpCtx.getAuthAgent();
      const { body } = await agent.get(`/api/users/${createdUser.id}`);

      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('user');
      expect(body.data.user).toMatchObject(
        excludeObjectKeys({ ...dummyUser, id: 1 }, [
          'password',
          'createdAt',
          'updatedAt',
        ]),
      );
    });

    it('returns 403 status code and error status with message for unauthorized user', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const createdUser2 = await userFactory.create(
        {},
        { transient: { client: httpCtx.client } },
      );
      const { agent } = await httpCtx.getAuthAgent({
        ...dummyUser,
        email: 'distinctuser@example.com',
      });
      const { body, status } = await agent.get(`/api/users/${createdUser2.id}`);

      expect(status).toBe(403);
      getErrorResponseExpects(body);
    });

    it('returns 401 status code and error status with message for unauthenticated user', async () => {
      const { body, status } = await httpCtx.agent.get(`/api/users/1`);

      expect(status).toBe(401);
      getErrorResponseExpects(body);
    });
  });

  describe('[PATCH] /users/:user_id', () => {
    it('returns 200 status code and success status for authorized user', async () => {
      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const { body, status } = await agent
        .patch(`/api/users/${createdUser.id}`)
        .send({
          firstName: 'James',
          lastName: 'Bond',
          email: 'agent007@exampl.com',
          bio: 'New bio',
        });

      expect(status).toBe(200);
      expect(body).toHaveProperty('status', 'success');
    });

    it('returns updated user details without password for authorized user', async () => {
      const { agent, createdUser, dummyUser } = await httpCtx.getAuthAgent();
      const { body } = await agent.patch(`/api/users/${createdUser.id}`).send({
        firstName: 'James',
        lastName: 'Bond',
        email: 'agent007@exampl.com',
        bio: 'New bio',
      });

      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('user');
      expect(body.data.user).toMatchObject(
        excludeObjectKeys(
          {
            ...dummyUser,
            firstName: 'James',
            lastName: 'Bond',
            email: 'agent007@exampl.com',
            bio: 'New bio',
            id: 1,
          },
          ['password', 'createdAt', 'updatedAt'],
        ),
      );
    });

    it('returns 200 status code when updated email is provided; prevents password update', async () => {
      const { agent, createdUser, dummyUser } = await httpCtx.getAuthAgent();

      await agent.patch(`/api/users/${createdUser.id}`).send({
        email: 'agent007@exampl.com',
        password: 'newpass',
      });

      const signInResult = await agent.post('/api/signin').send({
        email: 'agent007@exampl.com',
        password: dummyUser.password,
      });

      expect(signInResult.status).toBe(200);
    });

    it('returns 403 status code and error status with message for unauthorized user', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const createdUser2 = await userFactory.create(
        {},
        { transient: { client: httpCtx.client } },
      );
      const { agent } = await httpCtx.getAuthAgent({
        ...dummyUser,
        email: 'distinctuser@example.com',
      });
      const { body, status } = await agent
        .patch(`/api/users/${createdUser2.id}`)
        .send({
          firstName: 'James',
          lastName: 'Bond',
          email: 'agent007@exampl.com',
          bio: 'New bio',
        });

      expect(status).toBe(403);
      getErrorResponseExpects(body);
    });

    it('returns 401 status code and error status with message for unauthenticated user', async () => {
      const { body, status } = await httpCtx.agent.patch(`/api/users/1`).send({
        firstName: 'James',
        lastName: 'Bond',
        email: 'agent007@exampl.com',
        bio: 'New bio',
      });

      expect(status).toBe(401);
      getErrorResponseExpects(body);
    });

    it('returns 400 status code when updated email is already taken', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const createdUser2 = await userFactory.create(
        {},
        { transient: { client: httpCtx.client } },
      );
      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const { body, status } = await agent
        .patch(`/api/users/${createdUser.id}`)
        .send({
          email: createdUser2.email,
        });

      expect(status).toBe(400);
      getErrorResponseExpects(body, true);
    });
  });

  describe('[DELETE] /users/:user_id', () => {
    it('returns 200 status code and success status for authorized user', async () => {
      const { agent, createdUser } = await httpCtx.getAuthAgent();
      const { body, status } = await agent.delete(
        `/api/users/${createdUser.id}`,
      );

      expect(status).toBe(200);
      expect(body).toHaveProperty('status', 'success');
    });

    it('returns user details without password for authorized user', async () => {
      const { agent, createdUser, dummyUser } = await httpCtx.getAuthAgent();
      const { body } = await agent.delete(`/api/users/${createdUser.id}`);

      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('user');
      expect(body.data.user).toMatchObject(
        excludeObjectKeys(
          {
            ...dummyUser,
            id: 1,
          },
          ['password', 'createdAt', 'updatedAt'],
        ),
      );
    });

    it('deletes user', async () => {
      const { agent, createdUser, dummyUser } = await httpCtx.getAuthAgent();

      await agent.delete(`/api/users/${createdUser.id}`);

      const foundUser = await httpCtx.client?.user.findUnique({
        where: { email: dummyUser.email },
      });

      expect(foundUser).toBeFalsy();
    });

    it('returns 403 status code and error status with message for unauthorized user', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const createdUser2 = await userFactory.create(
        {},
        { transient: { client: httpCtx.client } },
      );
      const { agent } = await httpCtx.getAuthAgent({
        ...dummyUser,
        email: 'distinctuser@example.com',
      });
      const { body, status } = await agent.delete(
        `/api/users/${createdUser2.id}`,
      );

      expect(status).toBe(403);
      getErrorResponseExpects(body);
    });

    it('returns 401 status code and error status with message for unauthenticated user', async () => {
      const { body, status } = await httpCtx.agent.delete(`/api/users/1`);

      expect(status).toBe(401);
      getErrorResponseExpects(body);
    });
  });
});
