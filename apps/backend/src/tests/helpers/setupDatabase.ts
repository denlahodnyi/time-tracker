import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export default async function () {
  const { stdout, stderr } = await execAsync('pnpm db:start-test');

  if (stderr) console.error(stderr);
  else console.log(stdout);
}
