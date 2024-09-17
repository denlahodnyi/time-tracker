import { createSeedClient } from '@snaplet/seed';
import { parseArgs } from 'node:util';
import devSeed from './development';

const options = {
  environment: { type: 'string' as const },
};

async function main() {
  const {
    values: { environment },
  } = parseArgs({ options });

  try {
    const seed = await createSeedClient();

    // Truncate all tables in the database (except migrations)
    await seed.$resetDatabase(['!*_prisma_migrations']);

    switch (environment) {
      case 'development':
        await devSeed(seed);
        break;
      case 'test':
        break;
      default:
        break;
    }

    console.log('Database seeded successfully!');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
