import type { User } from '@libs/prisma';

export interface UserDTO extends Omit<User, 'password'> {
  avatarUrls: {
    original: string | null;
    thumbnail: string | null;
  };
}
