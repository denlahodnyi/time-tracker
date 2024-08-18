import { apiClient } from '~/shared/api';
import { TaskService } from './services';

const services = new TaskService(apiClient);

export { default as queries } from './queries';
export { services };
export { default as useMyTasks } from './useMyTasks';
