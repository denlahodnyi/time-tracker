import { apiClient } from '~/shared/api';
import { UserService } from './services';

const services = new UserService(apiClient);

export { default as queries } from './queries';
export { services };
export { default as useCurrentUser } from './useCurrentUser';
export { default as useLogout } from './useLogout';
