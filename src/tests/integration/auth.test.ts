import {
  HttpTestContext,
  userFactory,
  getErrorResponseExpects,
} from '../helpers/index.js';
import { hashPassword, verifyJwt } from '../../utils/index.js';

const httpCtx = new HttpTestContext();
const dummyUser = userFactory.build();

beforeEach(async () => {
  await httpCtx.prepareEach();
});

afterEach(async () => {
  await httpCtx.finishEach();
});

describe('/signup', () => {
  describe('[POST] /signup', () => {
    it('returns 201 status code and success status', async () => {
      const { body, status } = await httpCtx.agent.post('/api/signup').send({
        firstName: dummyUser.firstName,
        email: dummyUser.email,
        password: dummyUser.password,
      });

      expect(status).toBe(201);
      expect(body).toHaveProperty('status', 'success');
    });

    it('returns user details without password', async () => {
      const { body } = await httpCtx.agent.post('/api/signup').send({
        firstName: dummyUser.firstName,
        email: dummyUser.email,
        password: dummyUser.password,
      });

      expect(body.data.user).toHaveProperty('firstName', dummyUser.firstName);
      expect(body.data.user).toHaveProperty('lastName');
      expect(body.data.user).toHaveProperty('email', dummyUser.email);
      expect(body.data.user).toHaveProperty('bio');
      expect(body.data.user).toHaveProperty('id');
      expect(body.data.user).toHaveProperty('avatarUrl');
      expect(body.data.user).not.toHaveProperty('password');
    });

    it('returns valid token', async () => {
      const { body } = await httpCtx.agent.post('/api/signup').send({
        firstName: dummyUser.firstName,
        email: dummyUser.email,
        password: dummyUser.password,
      });

      expect(body.data).toHaveProperty('token');
      expect(() => verifyJwt(body.data.token)).not.toThrow();
      expect(verifyJwt(body.data.token)).toHaveProperty('userId');
    });

    it('returns 400 status code and error status with error message if user is already exist', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      await userFactory.create(
        { email: dummyUser.email },
        { transient: { client: httpCtx.client } },
      );

      const { body, status } = await httpCtx.agent.post('/api/signup').send({
        firstName: dummyUser.firstName,
        email: dummyUser.email,
        password: dummyUser.password,
      });

      expect(status).toBe(400);
      getErrorResponseExpects(body);
    });

    it('returns 400 status code and error status with error message if wrong credentials were provided', async () => {
      const { body, status } = await httpCtx.agent.post('/api/signup').send({
        firstName: 'TestUser',
        email: 'test',
        password: 'test',
      });

      expect(status).toBe(400);
      getErrorResponseExpects(body, true);
    });
  });
});

describe('/signin', () => {
  describe('[POST] /signin', () => {
    it('returns 200 status code and success status when provided valid credentials', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      await userFactory.create(
        { email: dummyUser.email },
        { transient: { client: httpCtx.client } },
      );

      const { body, status } = await httpCtx.agent.post('/api/signin').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });

      expect(status).toBe(200);
      expect(body).toHaveProperty('status', 'success');
    });

    it('returns user details without password and with valid token when provided valid credentials', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      const user = await userFactory.create(
        { email: dummyUser.email, bio: 'Test bio' },
        { transient: { client: httpCtx.client } },
      );

      const { body } = await httpCtx.agent.post('/api/signin').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });

      expect(body.data).toHaveProperty('user');
      expect(body.data).toHaveProperty('token');
      expect(body.data.user).toHaveProperty('firstName', dummyUser.firstName);
      expect(body.data.user).toHaveProperty('lastName', dummyUser.lastName);
      expect(body.data.user).toHaveProperty('email', dummyUser.email);
      expect(body.data.user).toHaveProperty('bio', 'Test bio');
      expect(body.data.user).toHaveProperty('avatarUrl');
      expect(body.data.user).not.toHaveProperty('password');
      expect(() => verifyJwt(body.data.token)).not.toThrow();
      expect(verifyJwt(body.data.token)).toHaveProperty('userId', user?.id);
    });

    it("returns 400 status code and error status with error message if user doesn't exist", async () => {
      await httpCtx.client?.user.create({
        data: {
          firstName: dummyUser.firstName,
          lastName: dummyUser.lastName,
          email: dummyUser.email,
          bio: 'Test bio',
          password: await hashPassword(dummyUser.password),
        },
      });

      const { body, status } = await httpCtx.agent.post('/api/signin').send({
        email: 'user404@example.com',
        password: 'sometestpassword',
      });

      expect(status).toBe(400);
      getErrorResponseExpects(body);
    });

    it('returns 400 status code and error status with error message if provide invalid email', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      await userFactory.create(
        { email: dummyUser.email },
        { transient: { client: httpCtx.client } },
      );

      const { body, status } = await httpCtx.agent.post('/api/signin').send({
        email: 'invalidmail',
        password: 'sometestpassword',
      });

      expect(status).toBe(400);
      getErrorResponseExpects(body, true);
    });

    it('returns 400 status code and error status with error message if provide wrong password', async () => {
      HttpTestContext.assertClient(httpCtx.client);

      await userFactory.create(
        { email: dummyUser.email },
        { transient: { client: httpCtx.client } },
      );

      const { body, status } = await httpCtx.agent.post('/api/signin').send({
        email: dummyUser.email,
        password: 'wrongpassword',
      });

      expect(status).toBe(400);
      // TODO: check this empty details errors
      getErrorResponseExpects(body, true);
    });
  });
});
