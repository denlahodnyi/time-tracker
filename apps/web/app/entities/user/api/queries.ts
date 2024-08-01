import {
  createQueryKeys,
  mergeQueryKeys,
} from '@lukemorales/query-key-factory';

const users = createQueryKeys('users', {
  me: {
    queryKey: null,
  },
});

export default mergeQueryKeys(users);
