import type { User } from '@prisma/client';
import { Factory } from 'fishery';

import { type Client } from '../../../db/client.js';
import { hashPassword } from '../../utils/password.js';

interface UserTransientParams {
  client?: Client;
}

const userFactory = Factory.define<User, UserTransientParams>(
  ({ params, sequence, transientParams, onCreate }) => {
    onCreate(async () => {
      if (!transientParams.client) {
        throw new Error('User factory error: client not found');
      }

      return transientParams.client.user.create({
        data: {
          firstName: params.firstName || 'John',
          lastName: params.lastName || 'Doe',
          email: params.email || `john${sequence}@example.com`,
          password: await hashPassword(params.password || 'examplepassword'),
          bio: params.bio || null,
          avatarUrl: params.avatarUrl || null,
        },
      });
    });

    return {
      id: sequence,
      firstName: params.firstName || 'John',
      lastName: params.lastName || 'Doe',
      email: params.email || `john${sequence}@example.com`,
      password: params.password || 'examplepassword',
      bio: params.bio || null,
      avatarUrl: params.avatarUrl || null,
      createdAt: params.createdAt || new Date(),
      updatedAt: params.updatedAt || new Date(),
    };
  },
);

export default userFactory;
