import type { Prisma } from '@prisma/client';
import { z } from 'zod';

import {
  comparePasswords,
  excludeObjectKeys,
  hashPassword,
  signJwt,
} from '../utils/index.js';
import { ModelBase } from '../core/classes/index.js';
import { errorFactory } from '../core/helpers/index.js';

const PASSWORD_MIN = 4;
const PASSWORD_MAX = 20;
const NAME_MIN = 1;
const NAME_MAX = 50;
const BIO_MAX = 200;

const SignUpInput = z.object({
  firstName: z.string().trim().min(NAME_MIN).max(NAME_MAX),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(PASSWORD_MIN).max(PASSWORD_MAX),
}) satisfies z.Schema<Prisma.UserCreateInput>;

const SignInInput = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(1, 'Is required'),
});

const UpdateInput = z.object({
  id: z.number().gte(1),
  firstName: SignUpInput.shape.firstName.optional(),
  lastName: SignUpInput.shape.firstName.nullable().optional(),
  email: SignUpInput.shape.email.optional(),
  bio: z.string().trim().max(BIO_MAX).nullable().optional(),
}) satisfies z.Schema<
  Pick<Prisma.UserUpdateInput, 'firstName' | 'lastName' | 'bio' | 'email'>
>;

export default class User extends ModelBase<'user'> {
  async signUp(data: z.infer<typeof SignUpInput>) {
    SignUpInput.parse(data);

    const user = await this.clientModel.findUnique({
      where: { email: data.email },
    });

    if (user) {
      throw errorFactory.create('bad_request', {
        message: 'Invalid data',
        formFields: {
          email: ['User with provided email is already exist'],
        },
      });
    }

    const hashedPassword = await hashPassword(data.password);
    const newUser = await this.clientModel.create({
      data: { ...data, password: hashedPassword },
    });
    const token = signJwt({ userId: newUser.id });

    return { user: excludeObjectKeys(newUser, ['password']), token };
  }

  async signIn(data: z.infer<typeof SignInInput>) {
    SignInInput.parse(data);

    const user = await this.clientModel.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw errorFactory.create('bad_request', {
        message: 'Invalid credentials',
        formFields: {
          password: ["User with provided email doesn't exist"],
        },
      });
    }

    const match = await comparePasswords(data.password, user.password);

    if (!match) {
      throw errorFactory.create('bad_request', {
        message: 'Invalid credentials',
        formFields: {
          password: ["Password doesn't match"],
        },
      });
    }

    const token = signJwt({ userId: user.id });

    return { user: { ...excludeObjectKeys(user, ['password']) }, token };
  }

  async updateById(data: z.infer<typeof UpdateInput>) {
    const parsedData = UpdateInput.parse(data);

    const user = await this.clientModel.update({
      where: { id: parsedData.id },
      data: excludeObjectKeys(parsedData, ['id']),
    });

    return excludeObjectKeys(user, ['password']);
  }
}
