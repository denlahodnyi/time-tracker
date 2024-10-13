import '@total-typescript/ts-reset';

import { env } from '../env.js';
import { initializeClient } from '../db/index.js';
import createServer from './server/createServer.js';

initializeClient();

const portArgIdx = process.argv.indexOf('--port');
const port =
  portArgIdx !== -1 ? Number(process.argv[portArgIdx + 1]) : env.PORT;

createServer().listen(port, () => {
  console.log(`Listening on port ${port}`);
});
