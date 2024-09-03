import { apiClient } from '~/shared/api';
import { TaskService } from './services';

const services = new TaskService(apiClient);

export { services };
// export { default as queries } from './queries';
// export { default as useMyTasks } from './useMyTasks';
