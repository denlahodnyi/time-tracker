import { spawn } from 'node:child_process';

const scriptArgs = process.argv.slice(2);

function invokeCommand(command: string) {
  const childProcess = spawn(command, { stdio: 'inherit', shell: true });

  childProcess.stdout?.on('data', (data) => {
    console.log(data);
  });
  childProcess.stderr?.on('data', (data) => {
    console.log(data);
  });
}

switch (scriptArgs[0]) {
  case 'serve': {
    // Start dev server
    invokeCommand('dotenvx run -f .env.development.local -f .env.development -f .env -- nodemon src/index.ts');
    break;
  }
  case 'start': {
    // Compile to dist and run node
    invokeCommand('dotenvx run -f .env.production.local -f .env.production -f .env -- node dist/src/index.js');
    break;
  }
  case 'test:unit': {
    // Run unit tests
    invokeCommand('dotenvx run -f .env.test.local -f .env.test -f .env -- jest --config jest.config.unit.ts');
    break;
  }
  case 'test:int': {
    // Run integration tests
    invokeCommand('dotenvx run -f .env.test.local -f .env.test -f .env -- jest --config jest.config.int.ts');
    break;
  }
  case 'push': {
    // Push to database bypassing migrations (only for prototyping)
    invokeCommand(
      'dotenvx run -f .env.development.local -f .env.development -f .env -- pnpm -F @libs/prisma prisma db push',
    );
    break;
  }
  default: {
    console.log('Unknown script');
  }
}
