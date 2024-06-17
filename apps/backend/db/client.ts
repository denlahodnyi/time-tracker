import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { type Prisma, PrismaClient } from '@libs/prisma';

import { env } from '../env.js';

const connectionString = env.DATABASE_URL;

type Client = ReturnType<typeof getExtendedClient>;

let client: Client;

function getExtendedClient(options: Prisma.PrismaClientOptions) {
  return new PrismaClient(options).$extends({
    // result: {
    //   user: {
    //     password: {
    //       needs: {},
    //       compute() {
    //         // Obfuscate a sensitive password field
    //         return undefined;
    //       },
    //     },
    //   },
    // },
  });
}

interface InitClientConfig {
  pool?: pg.Pool;
  clientOptions?: Prisma.PrismaClientOptions;
  adapterOptions?: ConstructorParameters<typeof PrismaPg>[1];
}

function initializeClient(config?: InitClientConfig) {
  const poolInstance = config?.pool ?? new pg.Pool({ connectionString });
  const adapter = new PrismaPg(poolInstance, config?.adapterOptions);

  client = getExtendedClient({ adapter, ...(config?.clientOptions || {}) });

  return client;
}

export { client, initializeClient, type Client };
