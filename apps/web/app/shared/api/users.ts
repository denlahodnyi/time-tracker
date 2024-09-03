import type { User } from '@libs/prisma';

export type UserDTO = Omit<User, 'password'>;
