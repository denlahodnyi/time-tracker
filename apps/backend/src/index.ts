import '@total-typescript/ts-reset';

import { env } from '../env.js';
import { initializeClient } from '../db/index.js';
import createServer from './server/createServer.js';

initializeClient();

createServer().listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`);
});
