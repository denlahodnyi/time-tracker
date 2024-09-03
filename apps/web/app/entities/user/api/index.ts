import { apiClient } from '~/shared/api';
import { UserService } from './services';

const services = new UserService(apiClient);

export { services };
// export { default as queries } from './queries';
// export { default as useCurrentUser } from './useCurrentUser';
