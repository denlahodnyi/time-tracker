import { test as teardown } from '@playwright/test';
import { exec } from 'node:child_process';
import util from 'node:util';

const execAsync = util.promisify(exec);

teardown('delete database', async ({}) => {
  console.log('Cleaning test database...');
  const { stdout, stderr } = await execAsync('pnpm -F backend db:stop-test');
  if (stderr) console.error(stderr);
  else console.log(stdout);
});
