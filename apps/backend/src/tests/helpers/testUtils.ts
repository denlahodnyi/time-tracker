import type { Client } from '../../../db/index.js';
import taskFactory from './taskFactory';

const createUserTasksList = (
  client: Client,
  userId: number,
  tasksNum: number,
) => taskFactory.createList(tasksNum, {}, { transient: { client, userId } });

export { createUserTasksList };
