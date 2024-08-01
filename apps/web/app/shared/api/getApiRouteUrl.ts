import type { Endpoints } from './types';

type Funcs = {
  [P in Endpoints]: P extends '/users/:userId'
    ? (id: number) => string
    : P extends '/users/:userId/posts/:postId'
      ? (id: number, pid: number) => string
      : () => string;
};

export default function getApiRouteUrl<T extends Endpoints>(
  apiBaseUrl: string,
  route: T,
): Funcs[T] {
  switch (route) {
    case '/signin':
      return () => `${apiBaseUrl}/signin`;
    case '/signup':
      return () => `${apiBaseUrl}/signup`;
    case '/users/me':
      return () => `${apiBaseUrl}/users/me`;
    case '/users/:userId':
      return ((id: number) =>
        `${apiBaseUrl}/users/${id}`) satisfies Funcs['/users/:userId'] as Funcs[T];
    default:
      throw new Error('Unknown route');
  }
}
