import type { UserDTO } from '~/shared/api';
import type { UserBase } from '../model';

export function dtoToUser(dto: UserDTO): UserBase {
  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName || '',
    fullName: dto.lastName ? `${dto.firstName} ${dto.lastName}` : dto.firstName,
    email: dto.email,
    bio: dto.bio || '',
    avatarUrls: {
      original: dto.avatarUrls.original || '',
      thumbnail: dto.avatarUrls.thumbnail || '',
    },
  };
}

// export function userToDto(
//   user: Omit<UserBase, 'id'>,
// ): Omit<UserDTO, 'createdAt' | 'updatedAt'> {
//   return {
//     firstName: user.firstName,
//     email: user.email,
//     lastName: user.lastName || null,
//     bio: user.bio || null,
//     avatarUrl: null,
//   };
// }
