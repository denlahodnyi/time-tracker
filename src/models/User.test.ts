import User from './User.js';
import { MockContext, userFactory } from '../tests/helpers/index.js';
import { excludeObjectKeys } from '../utils/index.js';

jest.mock('../utils/password', () => ({
  comparePasswords: jest.fn(() => true),
  hashPassword: jest.fn(),
}));

describe('User model', () => {
  const ctx = new MockContext();
  const dummyUser = userFactory.build();

  beforeEach(() => {
    ctx.prepareEach();
  });

  describe('signUp', () => {
    it('returns user without password and token', async () => {
      ctx.mockContext.client.user.create.mockResolvedValue(dummyUser);

      const result = await new User(ctx.context.client.user).signUp({
        firstName: dummyUser.firstName,
        email: dummyUser.email,
        password: dummyUser.password,
      });

      expect(result).toHaveProperty(
        'user',
        excludeObjectKeys(dummyUser, ['password']),
      );
      expect(result).toHaveProperty('token');
      expect(result.token).toBeTruthy();
    });
  });

  describe('signIn', () => {
    it('returns user without password and token', async () => {
      ctx.mockContext.client.user.findUnique.mockResolvedValue(dummyUser);

      const result = await new User(ctx.context.client.user).signIn({
        email: dummyUser.email,
        password: dummyUser.password,
      });

      expect(result).toHaveProperty(
        'user',
        excludeObjectKeys(dummyUser, ['password']),
      );
      expect(result).toHaveProperty('token');
      expect(result.token).toBeTruthy();
    });
  });

  describe('updateById', () => {
    it('returns user without password', async () => {
      ctx.mockContext.client.user.update.mockResolvedValue(dummyUser);

      await expect(
        new User(ctx.context.client.user).updateById(dummyUser),
      ).resolves.toStrictEqual(excludeObjectKeys(dummyUser, ['password']));
    });
  });
});
