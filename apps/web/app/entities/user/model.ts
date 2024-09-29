import type { UserDTO } from '~/shared/api';

export interface UserBase {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  bio: string;
  avatarUrls: {
    original: string;
    thumbnail: string;
  };
}

export interface SignUpReturn {
  user: UserDTO;
}

export interface SignUpPayload {
  email: string;
  password: string;
  confirmedPassword: string;
  firstName: string;
}

export interface LoginReturn {
  user: UserDTO;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserSuccessData {
  user: UserDTO;
}

export type UserPayload = Pick<
  UserDTO,
  'firstName' | 'lastName' | 'email' | 'bio'
>;

export interface AvatarUploadPayload {
  avatar: File | Blob;
}
