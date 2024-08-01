import type { UserDTO } from '~/shared/api';
import type { UserBase } from '../types';

export default function dtoToUser(dto: UserDTO): UserBase {
  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName || '',
    fullName: dto.lastName ? `${dto.firstName} ${dto.lastName}` : dto.firstName,
    email: dto.email,
    bio: dto.bio || '',
  };
}
