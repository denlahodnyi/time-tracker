import {
  createQueryKeys,
  mergeQueryKeys,
} from '@lukemorales/query-key-factory';

const tasks = createQueryKeys('tasks', {
  myAll: null,
  myActive: null,
});

export default mergeQueryKeys(tasks);
